'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings,
  BookOpen,
  Award,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { scormManager, SCORMAPI, type SCORMTrackingData } from '@/lib/scorm'

interface SCORMPlayerProps {
  packageId: string
  userId: string
  onExit?: () => void
  onComplete?: (trackingData: SCORMTrackingData) => void
}

export function SCORMPlayer({ packageId, userId, onExit, onComplete }: SCORMPlayerProps) {
  const [api, setApi] = useState<SCORMAPI | null>(null)
  const [trackingData, setTrackingData] = useState<SCORMTrackingData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [timeSpent, setTimeSpent] = useState('00:00:00')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Initialize SCORM API
    const scormAPI = scormManager.initializeAPI(packageId)
    setApi(scormAPI)

    // Load existing tracking data
    const existingData = scormManager.getTrackingData(userId, packageId)
    if (existingData) {
      setTrackingData(existingData)
      setProgress(existingData.lessonStatus === 'completed' ? 100 : 50)
      setScore(existingData.scoreRaw || 0)
    }

    // Initialize communication with iframe
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      // Terminate SCORM connection
      if (api) {
        api.terminate('normal')
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        updateTimeSpent()
        updateProgress()
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
  }, [isPlaying])

  const updateTimeSpent = () => {
    if (!api) return
    
    const elapsed = Date.now() - startTimeRef.current
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    setTimeSpent(timeString)
    
    // Update SCORM API
    api.setValue('cmi.core.session_time', timeString)
  }

  const updateProgress = () => {
    if (!api) return
    
    // Simulate progress based on time spent
    const elapsed = Date.now() - startTimeRef.current
    const simulatedProgress = Math.min((elapsed / 300000) * 100, 100) // 5 minutes for completion
    
    setProgress(simulatedProgress)
    
    // Update SCORM API
    if (simulatedProgress >= 100) {
      api.setValue('cmi.core.lesson_status', 'completed')
      api.setValue('cmi.core.score.raw', '100')
      setScore(100)
      
      // Notify completion
      const finalData = scormManager.getTrackingData(userId, packageId)
      if (finalData) {
        onComplete?.(finalData)
      }
    } else if (simulatedProgress > 50) {
      api.setValue('cmi.core.lesson_status', 'incomplete')
    }
  }

  const handlePlay = () => {
    if (!api) return
    
    if (!isPlaying) {
      // Initialize or resume
      const result = api.initialize(userId)
      if (result === 'true') {
        setIsPlaying(true)
        startTimeRef.current = Date.now()
      }
    } else {
      // Pause
      api.setValue('cmi.core.exit', 'suspend')
      api.commit('')
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    if (!api) return
    
    api.setValue('cmi.core.exit', 'normal')
    api.commit('')
    api.terminate('normal')
    setIsPlaying(false)
    
    // Save final data
    const finalData = scormManager.getTrackingData(userId, packageId)
    if (finalData) {
      onComplete?.(finalData)
    }
  }

  const handleRestart = () => {
    if (!api) return
    
    // Reset and restart
    api.terminate('normal')
    const result = api.initialize(userId)
    if (result === 'true') {
      setIsPlaying(true)
      setProgress(0)
      setScore(0)
      setTimeSpent('00:00:00')
      startTimeRef.current = Date.now()
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const getLessonStatusBadge = () => {
    const status = api?.getValue('cmi.core.lesson_status') || 'not attempted'
    
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="gap-1"><Award className="h-3 w-3" />Completed</Badge>
      case 'incomplete':
        return <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3" />In Progress</Badge>
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><Target className="h-3 w-3" />Failed</Badge>
      case 'passed':
        return <Badge variant="default" className="gap-1"><Award className="h-3 w-3" />Passed</Badge>
      default:
        return <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" />Not Started</Badge>
    }
  }

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-background">
      {/* Header Controls */}
      <Card className="m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onExit}>
              <ChevronLeft className="h-4 w-4" />
              Exit
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={handlePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleStop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleRestart}>
                <RefreshCw className="h-4 w-4" />
                Restart
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getLessonStatusBadge()}
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{timeSpent}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              <span>{score}%</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </Card>

      {/* SCORM Content */}
      <div className="flex-1 m-4 relative">
        <Card className="h-full p-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`/scorm-content/${packageId}/index.html`}
            className="w-full h-full border-0"
            title="SCORM Content"
            onLoad={() => {
              // Inject SCORM API into iframe
              if (iframeRef.current?.contentWindow) {
                injectSCORMAPI(iframeRef.current.contentWindow, api)
              }
            }}
          />
        </Card>

        {/* Overlay Controls (show on hover) */}
        <div 
          className={`absolute bottom-4 left-4 right-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <Card className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePlay}>
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleStop}>
                  <Square className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span>Time: {timeSpent}</span>
                <span>Score: {score}%</span>
                <span>Progress: {Math.round(progress)}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Inject SCORM API into iframe content window
function injectSCORMAPI(contentWindow: Window & { API?: any; findAPI?: any; getAPI?: any }, api: SCORMAPI | null) {
  if (!api) return

  // Create SCORM API object in iframe
  const scormAPI = {
    LMSInitialize: (param: string) => api?.initialize(param) || 'false',
    LMSFinish: (param: string) => api?.terminate(param) || 'false',
    LMSGetValue: (param: string) => api?.getValue(param) || '',
    LMSSetValue: (param: string, value: string) => api?.setValue(param, value) || 'false',
    LMSCommit: (param: string) => api?.commit(param) || 'false',
    LMSGetLastError: () => api?.getLastError() || '0',
    LMSGetErrorString: (errorCode: string) => api?.getErrorString(errorCode) || '',
    LMSGetDiagnostic: (errorCode: string) => api?.getDiagnostic(errorCode) || ''
  }

  // Inject into iframe window
  contentWindow.API = scormAPI
  
  // Also inject as a global function for older SCORM content
  contentWindow.findAPI = () => scormAPI
  contentWindow.getAPI = () => scormAPI
  
  // Notify the content that SCORM API is ready
  contentWindow.dispatchEvent(new Event('SCORM_API_Ready'))
}
