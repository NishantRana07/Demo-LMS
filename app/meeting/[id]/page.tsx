'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getMeetingById, joinMeeting, leaveMeeting, getAttendanceByMeetingAndUser, getAllUsers, createNotification } from '@/lib/storage'
import { Phone, Mic, Video, Settings, Users, MessageSquare, ArrowLeft, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function MeetingRoomPage() {
  const { user, loading } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const meetingId = Array.isArray(id) ? id[0] : id

  const [meeting, setMeeting] = useState<any>(null)
  const [joined, setJoined] = useState(false)
  const [joinedTime, setJoinedTime] = useState<Date | null>(null)
  const [duration, setDuration] = useState(0)
  const [attendanceId, setAttendanceId] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [participantsList, setParticipantsList] = useState<any[]>([])

  useEffect(() => {
    if (user && meetingId) {
      const meetingData = getMeetingById(meetingId as string)
      if (meetingData && meetingData.participants.includes(user.id)) {
        setMeeting(meetingData)
        setParticipantsList(
          meetingData.participants.map((id: string) => ({
            id,
            name: id === user.id ? user.name : `Participant ${Math.floor(Math.random() * 100)}`,
          }))
        )

        // Check if already joined
        const attendance = getAttendanceByMeetingAndUser(meetingId as string, user.id)
        if (attendance) {
          setJoined(true)
          setAttendanceId(attendance.id)
          setJoinedTime(new Date(attendance.joinedAt))
        }
      } else {
        router.push('/employee/meetings')
      }
    }
  }, [user, meetingId, router])

  // Timer for meeting duration
  useEffect(() => {
    if (!joined || !joinedTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - joinedTime.getTime()) / 1000)
      setDuration(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [joined, joinedTime])

  const handleJoinMeeting = () => {
    if (!meeting) return

    const now = new Date()
    const attendance = joinMeeting(meetingId as string, user!.id)
    setJoined(true)
    setAttendanceId(attendance.id)
    setJoinedTime(now)

    // Send notification
    createNotification({
      userId: user!.id,
      type: 'reminder',
      title: 'Meeting Joined',
      message: `You've joined the "${meeting.title}" meeting`,
      read: false,
    })
  }

  const handleLeaveMeeting = async () => {
    if (!attendanceId) return

    // Update attendance with leave time
    leaveMeeting(meetingId as string, user!.id)

    setJoined(false)
    router.push('/employee/meetings')
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Meeting not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employee/meetings">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{meeting.title}</h1>
              {joined && <p className="text-sm text-gray-400">Duration: {formatDuration(duration)}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        {!joined ? (
          // Pre-join screen
          <div className="flex items-center justify-center min-h-full">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Ready to Join?</CardTitle>
                <CardDescription>You're about to join {meeting.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meeting Details */}
                <div className="space-y-3 bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    {new Date(meeting.scheduledAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4" />
                    {meeting.participants.length} participants
                  </div>
                </div>

                {/* Device Settings */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800">
                    <Mic className="w-5 h-5 text-gray-400" />
                    <span className="flex-1">Microphone</span>
                    <span className={`text-sm ${micOn ? 'text-green-400' : 'text-gray-500'}`}>
                      {micOn ? 'On' : 'Off'}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800">
                    <Video className="w-5 h-5 text-gray-400" />
                    <span className="flex-1">Camera</span>
                    <span className={`text-sm ${videoOn ? 'text-green-400' : 'text-gray-500'}`}>
                      {videoOn ? 'On' : 'Off'}
                    </span>
                  </label>
                </div>

                {/* Join Button */}
                <Button
                  onClick={handleJoinMeeting}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                >
                  Join Meeting
                </Button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center">
                  This is a demo meeting. In production, you'd use Zoom, Teams, or similar platforms.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // In-meeting view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Main Video Area */}
            <div className="lg:col-span-2">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                {/* Demo Video Placeholder */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-gray-300">Your camera would appear here</p>
                  {videoOn ? (
                    <p className="text-sm text-gray-500 mt-2">Camera: On</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">Camera: Off</p>
                  )}
                </div>

                {/* Meeting Timer */}
                <div className="absolute top-4 right-4 bg-black/50 px-3 py-2 rounded text-sm font-medium">
                  {formatDuration(duration)}
                </div>
              </div>

              {/* Meeting Controls */}
              <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center gap-4">
                <Button
                  variant={micOn ? 'default' : 'destructive'}
                  size="lg"
                  onClick={() => setMicOn(!micOn)}
                  className="gap-2"
                >
                  <Mic className="w-4 h-4" />
                  {micOn ? 'Mute' : 'Unmute'}
                </Button>
                <Button
                  variant={videoOn ? 'default' : 'destructive'}
                  size="lg"
                  onClick={() => setVideoOn(!videoOn)}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" />
                  {videoOn ? 'Stop Video' : 'Start Video'}
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-gray-300 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-gray-300 bg-transparent">
                  <Users className="w-4 h-4" />
                  Participants
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleLeaveMeeting}
                  className="gap-2 ml-auto"
                >
                  <Phone className="w-4 h-4" />
                  Leave Meeting
                </Button>
              </div>
            </div>

            {/* Participants Panel */}
            <div>
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Participants</CardTitle>
                  <CardDescription>{participantsList.length} in meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participantsList.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-2 p-2 rounded bg-gray-900 text-sm"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {participant.name.charAt(0)}
                        </div>
                        <span className="flex-1 truncate text-gray-200">
                          {participant.name}
                          {participant.id === user?.id && ' (You)'}
                        </span>
                        {participant.id === user?.id && (
                          <span className="text-xs px-2 py-1 bg-blue-600 rounded text-blue-100">Host</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
