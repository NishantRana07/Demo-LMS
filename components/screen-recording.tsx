'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Circle,
  Square,
  Download,
  Settings,
  Eye,
  EyeOff,
  Clock,
  FileVideo,
  AlertCircle,
  CheckCircle,
  Pause,
  Play
} from 'lucide-react'

interface ScreenRecordingProps {
  meetingId: string
  userId: string
  onRecordingComplete?: (recordingData: RecordingData) => void
}

interface RecordingData {
  id: string
  meetingId: string
  userId: string
  startTime: Date
  endTime?: Date
  duration: number
  blob?: Blob
  url?: string
  size: number
  status: 'recording' | 'paused' | 'stopped' | 'processing' | 'completed' | 'error'
  audioEnabled: boolean
  videoEnabled: boolean
  screenEnabled: boolean
}

export function ScreenRecording({ meetingId, userId, onRecordingComplete }: ScreenRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [screenEnabled, setScreenEnabled] = useState(true)
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'starting' | 'recording' | 'pausing' | 'stopping' | 'processing'>('idle')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([]) as React.MutableRefObject<Blob[]>
  const timerRef = useRef<NodeJS.Timeout>()
  const recordingDataRef = useRef<RecordingData | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [streamRef, timerRef])

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setRecordingStatus('starting')
      
      // Get screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: audioEnabled
      })

      // Get webcam if enabled
      let videoStream: MediaStream | null = null
      if (videoEnabled) {
        try {
          videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
        } catch (error) {
          console.warn('Webcam not available:', error)
        }
      }

      // Combine streams
      const tracks = [...screenStream.getTracks()]
      if (videoStream) {
        tracks.push(...videoStream.getTracks())
      }

      const combinedStream = new MediaStream(tracks)
      streamRef.current = combinedStream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Create recording data
      const recording: RecordingData = {
        id: `recording_${Date.now()}`,
        meetingId,
        userId,
        startTime: new Date(),
        duration: 0,
        size: 0,
        status: 'recording',
        audioEnabled,
        videoEnabled,
        screenEnabled
      }

      recordingDataRef.current = recording
      setRecordingData(recording)

      // Handle recording events
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await handleRecordingStop()
      }

      // Handle screen sharing end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isRecording) {
          stopRecording()
        }
      })

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setRecordingStatus('recording')

    } catch (error) {
      console.error('Error starting recording:', error)
      setRecordingStatus('idle')
      alert('Failed to start recording. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      setRecordingStatus('pausing')
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      setRecordingStatus('recording')
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      setRecordingStatus('stopping')
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const handleRecordingStop = async () => {
    setRecordingStatus('processing')
    
    try {
      // Create blob from chunks
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      
      // Update recording data
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - recordingDataRef.current!.startTime.getTime()) / 1000)
      
      const finalRecordingData: RecordingData = {
        ...recordingDataRef.current!,
        endTime,
        duration,
        blob,
        url,
        size: blob.size,
        status: 'completed'
      }

      setRecordingData(finalRecordingData)
      recordingDataRef.current = finalRecordingData

      // Save to localStorage (in a real app, you'd upload to server)
      saveRecordingToStorage(finalRecordingData)

      setRecordingStatus('idle')
      onRecordingComplete?.(finalRecordingData)

    } catch (error) {
      console.error('Error processing recording:', error)
      setRecordingStatus('idle')
      
      if (recordingDataRef.current) {
        const errorData: RecordingData = {
          ...recordingDataRef.current,
          status: 'error'
        }
        setRecordingData(errorData)
      }
    }
  }

  const saveRecordingToStorage = (recording: RecordingData) => {
    if (typeof window === 'undefined') return
    
    const recordings = getRecordingsFromStorage()
    recordings.push(recording)
    
    // Keep only last 10 recordings per meeting
    const filteredRecordings = recordings
      .filter(r => r.meetingId === meetingId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10)
    
    localStorage.setItem(`meeting_recordings_${meetingId}`, JSON.stringify(filteredRecordings))
  }

  const getRecordingsFromStorage = (): RecordingData[] => {
    if (typeof window === 'undefined') return []
    
    const recordings = localStorage.getItem(`meeting_recordings_${meetingId}`)
    return recordings ? JSON.parse(recordings) : []
  }

  const downloadRecording = () => {
    if (!recordingData?.url || !recordingData?.blob) return

    const a = document.createElement('a')
    a.href = recordingData.url
    a.download = `meeting_${meetingId}_${recordingData.id}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
  }

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled)
  }

  const toggleScreen = () => {
    setScreenEnabled(!screenEnabled)
  }

  const getStatusBadge = () => {
    switch (recordingStatus) {
      case 'starting':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3 animate-pulse" />Starting...</Badge>
      case 'recording':
        return <Badge variant="destructive" className="gap-1 animate-pulse"><Circle className="h-3 w-3 fill-current" />Recording</Badge>
      case 'pausing':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pausing...</Badge>
      case 'stopping':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Stopping...</Badge>
      case 'processing':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3 animate-pulse" />Processing...</Badge>
      case 'idle':
      default:
        if (recordingData?.status === 'completed') {
          return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>
        } else if (recordingData?.status === 'error') {
          return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>
        }
        return <Badge variant="outline" className="gap-1"><Video className="h-3 w-3" />Ready</Badge>
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Screen Recording</h3>
            {getStatusBadge()}
          </div>
          
          {recordingData?.status === 'completed' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button variant="outline" size="sm" onClick={downloadRecording}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                disabled={recordingStatus !== 'idle'}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button variant="secondary" onClick={pauseRecording} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeRecording} className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button variant="destructive" onClick={stopRecording} className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <Button
              variant={audioEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleAudio}
              disabled={isRecording}
              className="gap-2"
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              Audio
            </Button>
            
            <Button
              variant={videoEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleVideo}
              disabled={isRecording}
              className="gap-2"
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              Camera
            </Button>
            
            <Button
              variant={screenEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleScreen}
              disabled={isRecording}
              className="gap-2"
            >
              {screenEnabled ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
              Screen
            </Button>
          </div>

          {/* Recording Info */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Recording Time</span>
                <span className="font-mono">{formatTime(recordingTime)}</span>
              </div>
              <Progress value={(recordingTime / 3600) * 100} className="w-full" />
            </div>
          )}

          {recordingData && recordingData.status === 'completed' && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{formatTime(recordingData.duration)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">{(recordingData.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <span className="ml-2 font-medium">{recordingData.startTime.toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ended:</span>
                  <span className="ml-2 font-medium">{recordingData.endTime?.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {showPreview && recordingData?.url && (
          <div className="space-y-2">
            <h4 className="font-medium">Recording Preview</h4>
            <video 
              src={recordingData.url} 
              controls 
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
