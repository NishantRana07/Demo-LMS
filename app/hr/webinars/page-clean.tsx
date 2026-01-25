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
  Video,
  Calendar,
  Clock,
  Users,
  Globe,
  Mic,
  MessageSquare,
  Settings
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

export default function HRWebinars() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [webinars, setWebinars] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWebinarId, setSelectedWebinarId] = useState<string | null>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Load webinars (webinarMode = true meetings)
    const allMeetings = getMeetings()
    const webinarMeetings = allMeetings.filter(meeting => meeting.webinarMode)
    setWebinars(webinarMeetings)
    setLoading(false)
  }, [router])

  const handleCreateWebinar = async (webinarData: {
    title: string
    description: string
    scheduledAt: string
    participants: string[]
    platform: 'teams' | 'meet' | 'zoom' | 'custom'
    customUrl?: string
  }) => {
    try {
      const newWebinar = createMeeting({
        title: webinarData.title,
        description: webinarData.description,
        scheduledAt: webinarData.scheduledAt,
        participants: webinarData.participants,
        createdBy: currentUser?.id || 'hr-admin',
        platform: webinarData.platform,
        duration: 90, // Webinars typically longer
        status: 'scheduled',
        webinarMode: true, // This is a webinar
        createdAt: new Date().toISOString()
      })

      // Create platform-specific meeting
      let platformMeeting
      const endTime = new Date(webinarData.scheduledAt)
      endTime.setHours(endTime.getHours() + 1.5) // 90 minutes

      switch (webinarData.platform) {
        case 'teams':
          platformMeeting = await teamsService.createTeamsMeeting({
            subject: webinarData.title,
            startTime: webinarData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: webinarData.participants,
            description: webinarData.description
          })
          break
        case 'meet':
          platformMeeting = await teamsService.createGoogleMeetMeeting({
            subject: webinarData.title,
            startTime: webinarData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: webinarData.participants,
            description: webinarData.description
          })
          break
        case 'zoom':
          platformMeeting = await teamsService.createZoomMeeting({
            subject: webinarData.title,
            startTime: webinarData.scheduledAt,
            endTime: endTime.toISOString(),
            participants: webinarData.participants,
            description: webinarData.description
          })
          break
        case 'custom':
          if (webinarData.customUrl) {
            platformMeeting = await teamsService.createCustomMeeting({
              subject: webinarData.title,
              startTime: webinarData.scheduledAt,
              endTime: endTime.toISOString(),
              participants: webinarData.participants,
              joinUrl: webinarData.customUrl,
              description: webinarData.description
            })
          }
          break
      }

      if (platformMeeting?.success && platformMeeting.meeting) {
        updateMeeting(newWebinar.id, {
          meetingLink: platformMeeting.meeting.joinUrl
        })
        
        await teamsService.sendMeetingInvitation(platformMeeting.meeting)
      }

      // Reload webinars
      const allMeetings = getMeetings()
      const webinarMeetings = allMeetings.filter(meeting => meeting.webinarMode)
      setWebinars(webinarMeetings)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating webinar:', error)
      alert('Failed to create webinar. Please try again.')
    }
  }

  const handleDeleteWebinar = (webinarId: string) => {
    if (confirm('Are you sure you want to delete this webinar?')) {
      deleteMeeting(webinarId)
      const allMeetings = getMeetings()
      const webinarMeetings = allMeetings.filter(meeting => meeting.webinarMode)
      setWebinars(webinarMeetings)
    }
  }

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || webinar.status === filterStatus
    const matchesPlatform = filterPlatform === 'all' || webinar.platform === filterPlatform
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'zoom': return <Video className="h-4 w-4 text-blue-600" />
      case 'teams': return <Settings className="h-4 w-4 text-purple-600" />
      case 'meet': return <Video className="h-4 w-4 text-green-600" />
      default: return <Globe className="h-4 w-4 text-gray-600" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch(platform) {
      case 'zoom': return 'Zoom'
      case 'teams': return 'Microsoft Teams'
      case 'meet': return 'Google Meet'
      default: return 'Custom'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'zoom': return 'bg-blue-100 text-blue-800'
      case 'teams': return 'bg-purple-100 text-purple-800'
      case 'meet': return 'bg-green-100 text-green-800'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-muted rounded"></div>
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
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Webinars</h1>
              <p className="text-muted-foreground mt-2">
                Manage virtual training sessions and online events
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Webinar
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Webinars</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{webinars.length}</p>
                </div>
                <Video className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {webinars.filter(w => w.status === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {webinars.filter(w => w.status === 'completed').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attendees</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {webinars.reduce((sum, w) => sum + w.participants.length, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search webinars..."
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
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Platforms</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="meet">Google Meet</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Webinars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebinars.length > 0 ? (
              filteredWebinars.map((webinar) => {
                const isUpcoming = new Date(webinar.scheduledAt) > new Date()
                
                return (
                  <Card key={webinar.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(webinar.platform)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(webinar.platform)}`}>
                            {getPlatformName(webinar.platform)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webinar.status || 'scheduled')}`}>
                          {webinar.status || 'scheduled'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">{webinar.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{webinar.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{new Date(webinar.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{new Date(webinar.scheduledAt).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Participants:</span>
                          <span className="font-medium">{webinar.participants.length}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{webinar.duration || 90} min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(webinar.meetingLink, '_blank')}
                          className="gap-2 flex-1"
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWebinarId(webinar.id)}
                          className="gap-2"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteWebinar(webinar.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Webinars Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' || filterPlatform !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by scheduling your first webinar'}
                </p>
                {!searchTerm && filterStatus === 'all' && filterPlatform === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Webinar
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Create Webinar Modal */}
          {showCreateModal && (
            <CreateMeetingModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateWebinar}
            />
          )}

          {/* Attendance Modal */}
          {selectedWebinarId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Webinar Attendance</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedWebinarId(null)}
                    >
                      Close
                    </Button>
                  </div>
                  <MeetingAttendance meetingId={selectedWebinarId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
