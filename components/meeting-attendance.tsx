'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  Timer
} from 'lucide-react'
import { 
  getMeetingById, 
  getAttendanceByMeeting, 
  getMeetingStats,
  getAllUsers,
  updateAttendance
} from '@/lib/storage'
import type { Meeting, Attendance, User } from '@/lib/storage'

interface MeetingAttendanceProps {
  meetingId: string
}

export function MeetingAttendance({ meetingId }: MeetingAttendanceProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [meetingId])

  const loadData = () => {
    const meetingData = getMeetingById(meetingId)
    const attendanceData = getAttendanceByMeeting(meetingId)
    const usersData = getAllUsers()
    const statsData = getMeetingStats(meetingId)

    setMeeting(meetingData)
    setAttendance(attendanceData)
    setUsers(usersData)
    setStats(statsData)
    setLoading(false)
  }

  const handleMarkAttendance = (attendanceId: string, status: 'present' | 'absent' | 'late') => {
    updateAttendance(attendanceId, { status })
    loadData()
  }

  const handleEngagementScore = (attendanceId: string, score: number) => {
    updateAttendance(attendanceId, { engagementScore: score })
    loadData()
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.email || 'unknown@example.com'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />
      case 'late': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Not Found</h3>
          <p className="text-gray-500">The requested meeting could not be found.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
            <p className="text-gray-600 mt-1">{meeting.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(meeting.scheduledAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>{meeting.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{meeting.participants.length} participants</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
              meeting.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {meeting.status}
            </span>
            {meeting.webinarMode && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Webinar
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalParticipants || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats?.presentCount || 0}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats?.absentCount || 0}</p>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(Math.round(stats?.averageDuration || 0))}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Attendance List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Records</h3>
        
        {attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-gray-900">{getUserName(record.userId)}</p>
                    <p className="text-sm text-gray-500">{getUserEmail(record.userId)}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Joined: {new Date(record.joinedAt).toLocaleTimeString()}</span>
                      {record.leftAt && (
                        <span>Left: {new Date(record.leftAt).toLocaleTimeString()}</span>
                      )}
                      <span>Duration: {formatDuration(record.duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Selector */}
                  <select
                    value={record.status}
                    onChange={(e) => handleMarkAttendance(record.id, e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>

                  {/* Engagement Score */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={record.engagementScore}
                      onChange={(e) => handleEngagementScore(record.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="0-100"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>

                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-500">No attendance has been recorded for this meeting yet.</p>
          </div>
        )}
      </Card>

      {/* Meeting Link */}
      {meeting.meetingLink && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Access</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meeting Link</p>
              <p className="text-sm font-mono text-gray-900 mt-1">{meeting.meetingLink}</p>
            </div>
            <Button
              onClick={() => window.open(meeting.meetingLink, '_blank')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Join Meeting
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
