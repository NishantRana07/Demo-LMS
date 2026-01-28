'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  Link,
  Play,
  Settings,
  Monitor,
  Phone,
  MessageSquare
} from 'lucide-react'
import { 
  getCurrentUser, 
  getMeetings,
  createMeeting,
  initializeStorage,
  updateMeeting,
  deleteMeeting
} from '@/lib/storage'
import { teamsService, type TeamsMeeting } from '@/lib/microsoft-teams'
import type { User, Meeting } from '@/lib/storage'
import { CreateMeetingModal } from '@/components/create-meeting-modal'
import { MeetingAttendance } from '@/components/meeting-attendance'

export default function HRMeetings() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [teamsMeetings, setTeamsMeetings] = useState<TeamsMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = () => {
    setMeetings(getMeetings())
    // In a real app, you'd fetch Teams meetings from your backend
    setTeamsMeetings([])
    setLoading(false)
  }

  const handleCreateMeeting = async (meetingData: {
    title: string
    description: string
    scheduledAt: string
    participants: string[]
    platform: 'teams' | 'meet' | 'zoom' | 'custom'
    customUrl?: string
  }) => {
    try {
      // Create meeting in local storage
      const newMeeting = createMeeting({
        title: meetingData.title,
        description: meetingData.description,
        scheduledAt: meetingData.scheduledAt,
        participants: meetingData.participants,
        createdBy: currentUser?.id || 'hr-admin',
        platform: meetingData.platform,
        duration: 60, // Default 60 minutes
        status: 'scheduled',
        webinarMode: meetingData.platform === 'zoom', // Zoom meetings default to webinar mode
        createdAt: new Date().toISOString()
      })

      // Create platform-specific meeting
      let platformMeeting
      switch (meetingData.platform) {
        case 'teams':
          const endTime = new Date(meetingData.scheduledAt)
          endTime.setHours(endTime.getHours() + 1)
          platformMeeting = await teamsService.createTeamsMeeting({
            subject: meetingData.title,
            startTime: meetingData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: meetingData.participants,
            description: meetingData.description
          })
          break
        case 'meet':
          const meetEndTime = new Date(meetingData.scheduledAt)
          meetEndTime.setHours(meetEndTime.getHours() + 1)
          platformMeeting = await teamsService.createGoogleMeetMeeting({
            subject: meetingData.title,
            startTime: meetingData.scheduledAt,
            endTime: meetEndTime.toISOString(),
            participants: meetingData.participants,
            description: meetingData.description
          })
          break
        case 'zoom':
          const zoomEndTime = new Date(meetingData.scheduledAt)
          zoomEndTime.setHours(zoomEndTime.getHours() + 1)
          platformMeeting = await teamsService.createZoomMeeting({
            subject: meetingData.title,
            startTime: meetingData.scheduledAt,
            endTime: zoomEndTime.toISOString(),
            participants: meetingData.participants,
            description: meetingData.description
          })
          break
        case 'custom':
          if (meetingData.customUrl) {
            const customEndTime = new Date(meetingData.scheduledAt)
            customEndTime.setHours(customEndTime.getHours() + 1)
            platformMeeting = await teamsService.createCustomMeeting({
              subject: meetingData.title,
              startTime: meetingData.scheduledAt,
              endTime: customEndTime.toISOString(),
              participants: meetingData.participants,
              joinUrl: meetingData.customUrl,
              description: meetingData.description
            })
          }
          break
      }

      if (platformMeeting?.success && platformMeeting.meeting) {
        // Update the meeting with the platform-specific join URL
        updateMeeting(newMeeting.id, {
          meetingLink: platformMeeting.meeting.joinUrl
        })
        
        // Send invitation
        await teamsService.sendMeetingInvitation(platformMeeting.meeting)
      }

      loadData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to create meeting. Please try again.')
    }
  }

  const handleDeleteMeeting = (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      deleteMeeting(meetingId)
      loadData()
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || 
                           (filterPlatform === 'teams' && meeting.meetingLink?.includes('teams')) ||
                           (filterPlatform === 'meet' && meeting.meetingLink?.includes('meet')) ||
                           (filterPlatform === 'zoom' && meeting.meetingLink?.includes('zoom')) ||
                           (filterPlatform === 'custom' && !meeting.meetingLink?.includes('teams') && !meeting.meetingLink?.includes('meet') && !meeting.meetingLink?.includes('zoom'))
    return matchesSearch && matchesPlatform
  })

  const getPlatformIcon = (meetingLink: string) => {
    if (meetingLink?.includes('teams')) return <Monitor className="h-4 w-4 text-blue-600" />
    if (meetingLink?.includes('meet')) return <Video className="h-4 w-4 text-green-600" />
    if (meetingLink?.includes('zoom')) return <Phone className="h-4 w-4 text-blue-500" />
    return <Link className="h-4 w-4 text-gray-600" />
  }

  const getPlatformName = (meetingLink: string) => {
    if (meetingLink?.includes('teams')) return 'Microsoft Teams'
    if (meetingLink?.includes('meet')) return 'Google Meet'
    if (meetingLink?.includes('zoom')) return 'Zoom'
    return 'Custom Link'
  }

  const getMeetingStatus = (scheduledAt: string) => {
    const now = new Date()
    const meetingTime = new Date(scheduledAt)
    
    if (meetingTime < now) {
      const hoursDiff = (now.getTime() - meetingTime.getTime()) / (1000 * 60 * 60)
      if (hoursDiff < 2) return { status: 'Just Ended', color: 'bg-orange-100 text-orange-800' }
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' }
    } else {
      const hoursDiff = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursDiff < 1) return { status: 'Starting Soon', color: 'bg-green-100 text-green-800' }
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
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
              {[1, 2, 3, 4, 5].map(i => (
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
              <h1 className="text-3xl font-bold text-foreground">Meetings & Video Conferences</h1>
              <p className="text-muted-foreground mt-2">
                Schedule and manage virtual meetings with Microsoft Teams, Google Meet, Zoom, and custom links
              </p>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Meetings</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{meetings.length}</p>
                </div>
                <Video className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {meetings.filter(m => {
                      const today = new Date().toDateString()
                      const meetingDate = new Date(m.scheduledAt).toDateString()
                      return today === meetingDate
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {meetings.filter(m => {
                      const now = new Date()
                      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
                      const meetingDate = new Date(m.scheduledAt)
                      return meetingDate >= weekStart
                    }).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {meetings.reduce((sum, m) => sum + m.participants.length, 0)}
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
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Platforms</option>
              <option value="teams">Microsoft Teams</option>
              <option value="meet">Google Meet</option>
              <option value="zoom">Zoom</option>
              <option value="custom">Custom Links</option>
            </select>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting.scheduledAt)
                return (
                  <Card key={meeting.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(meeting.meetingLink)}
                              <h3 className="text-lg font-semibold text-foreground">{meeting.title}</h3>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.status}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getPlatformName(meeting.meetingLink)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {meeting.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(meeting.scheduledAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{meeting.participants.length} participants</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                            className="gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Join
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedMeetingId(meeting.id)}
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
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No meetings found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterPlatform !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by scheduling your first meeting'}
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMeeting}
        />
      )}

      {selectedMeetingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meeting Attendance</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedMeetingId(null)}
                >
                  Close
                </Button>
              </div>
              <MeetingAttendance meetingId={selectedMeetingId} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
