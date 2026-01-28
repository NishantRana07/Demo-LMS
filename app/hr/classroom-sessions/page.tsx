'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  FileText,
  Monitor,
  Phone,
  Link,
  Play
} from 'lucide-react'
import { 
  getCurrentUser, 
  getMeetings,
  createMeeting,
  initializeStorage,
  updateMeeting,
  deleteMeeting
} from '@/lib/storage'
import type { User, Meeting } from '@/lib/storage'
import { CreateMeetingModal } from '@/components/create-meeting-modal'
import { MeetingAttendance } from '@/components/meeting-attendance'
import { teamsService } from '@/lib/microsoft-teams'

export default function HRClassroomSessions() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Load classroom sessions (non-webinar meetings)
    const allMeetings = getMeetings()
    const classroomSessions = allMeetings.filter(meeting => !meeting.webinarMode)
    setSessions(classroomSessions)
    setLoading(false)
  }, [router])

  const handleCreateSession = async (sessionData: {
    title: string
    description: string
    scheduledAt: string
    participants: string[]
    platform: 'teams' | 'meet' | 'zoom' | 'custom'
    customUrl?: string
  }) => {
    try {
      const newSession = createMeeting({
        title: sessionData.title,
        description: sessionData.description,
        scheduledAt: sessionData.scheduledAt,
        participants: sessionData.participants,
        createdBy: currentUser?.id || 'hr-admin',
        platform: sessionData.platform,
        duration: 60,
        status: 'scheduled',
        webinarMode: false, // Classroom sessions are not webinars
        createdAt: new Date().toISOString()
      })

      // Create platform-specific meeting
      let platformMeeting
      const endTime = new Date(sessionData.scheduledAt)
      endTime.setHours(endTime.getHours() + 1)

      switch (sessionData.platform) {
        case 'teams':
          platformMeeting = await teamsService.createTeamsMeeting({
            subject: sessionData.title,
            startTime: sessionData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: sessionData.participants,
            description: sessionData.description
          })
          break
        case 'meet':
          platformMeeting = await teamsService.createGoogleMeetMeeting({
            subject: sessionData.title,
            startTime: sessionData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: sessionData.participants,
            description: sessionData.description
          })
          break
        case 'zoom':
          platformMeeting = await teamsService.createZoomMeeting({
            subject: sessionData.title,
            startTime: sessionData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: sessionData.participants,
            description: sessionData.description
          })
          break
        case 'custom':
          if (sessionData.customUrl) {
            platformMeeting = await teamsService.createCustomMeeting({
              subject: sessionData.title,
              startTime: sessionData.scheduledAt,
              endTime: endTime.toISOString(),
              participants: sessionData.participants,
              joinUrl: sessionData.customUrl,
              description: sessionData.description
            })
          }
          break
      }

      if (platformMeeting?.success && platformMeeting.meeting) {
        updateMeeting(newSession.id, {
          meetingLink: platformMeeting.meeting.joinUrl
        })
        
        await teamsService.sendMeetingInvitation(platformMeeting.meeting)
      }

      // Reload sessions
      const allMeetings = getMeetings()
      const classroomSessions = allMeetings.filter(meeting => !meeting.webinarMode)
      setSessions(classroomSessions)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating classroom session:', error)
      alert('Failed to create classroom session. Please try again.')
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this classroom session?')) {
      deleteMeeting(sessionId)
      const allMeetings = getMeetings()
      const classroomSessions = allMeetings.filter(meeting => !meeting.webinarMode)
      setSessions(classroomSessions)
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'teams': return <Monitor className="h-4 w-4 text-blue-600" />
      case 'meet': return <Video className="h-4 w-4 text-green-600" />
      case 'zoom': return <Phone className="h-4 w-4 text-blue-500" />
      default: return <Link className="h-4 w-4 text-gray-600" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'teams': return 'Microsoft Teams'
      case 'meet': return 'Google Meet'
      case 'zoom': return 'Zoom'
      default: return 'Custom Link'
    }
  }

  const getSessionStatus = (scheduledAt: string) => {
    const now = new Date()
    const sessionDate = new Date(scheduledAt)
    if (sessionDate > now) return 'upcoming'
    if (sessionDate.toDateString() === now.toDateString()) return 'today'
    return 'completed'
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'today': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <HRSidebar userName={currentUser?.name || ''} />
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Classroom Sessions</h1>
              <p className="text-muted-foreground mt-2">
                Manage in-person and virtual training sessions
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Session
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{sessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {sessions.filter(s => new Date(s.scheduledAt) > new Date()).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {sessions.filter(s => new Date(s.scheduledAt).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {sessions.reduce((sum, s) => sum + s.participants.length, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Sessions</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => {
                const status = getSessionStatus(session.scheduledAt)
                
                return (
                  <Card key={session.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-foreground">{session.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            <div className="flex items-center gap-1">
                              {getPlatformIcon(session.platform)}
                              <span className="text-xs text-muted-foreground">{getPlatformName(session.platform)}</span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{session.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Date:</span>
                              <span className="font-medium">{new Date(session.scheduledAt).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{new Date(session.scheduledAt).toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Participants:</span>
                              <span className="font-medium">{session.participants.length}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Duration: </span>
                                <span className="font-medium">{session.duration || 0} min</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(session.meetingLink, '_blank')}
                                className="gap-2"
                              >
                                <Play className="h-4 w-4" />
                                Join
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSessionId(session.id)}
                                className="gap-2"
                              >
                                <Users className="h-4 w-4" />
                                Attendance
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteSession(session.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Classroom Sessions Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by scheduling your first classroom session'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Session
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Create Session Modal */}
          {showCreateModal && (
            <CreateMeetingModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateSession}
            />
          )}

          {/* Attendance Modal */}
          {selectedSessionId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Session Attendance</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSessionId(null)}
                    >
                      Close
                    </Button>
                  </div>
                  <MeetingAttendance meetingId={selectedSessionId} />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
      </div>
    </div>
  )
}
