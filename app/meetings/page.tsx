'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Bell,
  ExternalLink,
  Download
} from 'lucide-react'
import { getCurrentUser, getAllUsers } from '@/lib/storage'
import { getMeetingRecordings, addMeetingRecording, type MeetingRecording } from '@/lib/progress-tracking'
import type { User as UserType } from '@/lib/storage'

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: 'video' | 'in-person' | 'hybrid'
  location?: string
  meetingLink?: string
  organizerId: string
  attendees: string[]
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
}

export default function MeetingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [recordings, setRecordings] = useState<MeetingRecording[]>([])
  const [showRecordings, setShowRecordings] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '1 hour',
    type: 'video' as 'video' | 'in-person' | 'hybrid',
    location: '',
    meetingLink: '',
    attendees: [] as string[]
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setUsers(getAllUsers())
    setRecordings(getMeetingRecordings())
    
    // Mock meetings data
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Team Standup',
        description: 'Daily team sync to discuss progress and blockers',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        duration: '30 min',
        type: 'video',
        meetingLink: 'https://meet.example.com/standup',
        organizerId: 'hr1',
        attendees: [user.id, 'emp1', 'emp2'],
        status: 'scheduled',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Training Session',
        description: 'Advanced React patterns and best practices',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '2:00 PM',
        duration: '2 hours',
        type: 'video',
        meetingLink: 'https://meet.example.com/training',
        organizerId: 'hr1',
        attendees: [user.id, 'emp1', 'emp3', 'emp4'],
        status: 'scheduled',
        createdAt: new Date().toISOString()
      }
    ]
    
    setMeetings(mockMeetings)
    setLoading(false)
  }, [router])

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const myMeetings = meetings.filter(meeting =>
    meeting.attendees.includes(currentUser?.id) || meeting.organizerId === currentUser?.id
  )

  const handleCreateMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      ...formData,
      organizerId: currentUser?.id || '',
      attendees: [currentUser?.id || '', ...formData.attendees],
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    setMeetings(prev => [...prev, newMeeting])
    setShowCreateForm(false)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '1 hour',
      type: 'video',
      location: '',
      meetingLink: '',
      attendees: []
    })
  }

  const joinMeeting = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewRecordings = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowRecordings(true)
  }

  const handleUploadRecording = () => {
    if (!selectedMeeting) return
    
    // Mock upload - in real app, this would handle file upload
    const newRecording = addMeetingRecording({
      meetingId: selectedMeeting.id,
      title: `${selectedMeeting.title} - Recording`,
      description: `Recording of ${selectedMeeting.title} meeting`,
      recordingUrl: 'https://example.com/recording.mp4',
      duration: parseInt(selectedMeeting.duration) || 60,
      uploadedBy: currentUser?.id || '',
      tags: ['meeting', selectedMeeting.type],
      isPublic: true
    })
    
    setRecordings(prev => [...prev, newRecording])
    alert('Recording uploaded successfully!')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'in-person': return MapPin
      case 'hybrid': return Users
      default: return Calendar
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
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
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
              <p className="text-muted-foreground mt-2">Schedule and join team meetings</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Meetings</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{myMeetings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {myMeetings.filter(m => m.date === new Date().toISOString().split('T')[0]).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {myMeetings.filter(m => {
                      const meetingDate = new Date(m.date)
                      const today = new Date()
                      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return meetingDate >= today && meetingDate <= weekFromNow
                    }).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold text-foreground mt-1">12h</p>
                </div>
                <Video className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Create Meeting Form */}
          {showCreateForm && (
            <Card className="bg-card border border-border mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Schedule New Meeting</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="mt-1 w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="30 min">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="2 hours">2 hours</option>
                      <option value="3 hours">3 hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="mt-1 w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  {formData.type !== 'video' && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  {formData.type !== 'in-person' && (
                    <div>
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <Input
                        id="meetingLink"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleCreateMeeting} disabled={!formData.title || !formData.date || !formData.time}>
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Meetings List */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Meetings</h2>
            
            {myMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myMeetings.map((meeting) => {
                  const TypeIcon = getTypeIcon(meeting.type)
                  const isOrganizer = meeting.organizerId === currentUser?.id
                  
                  return (
                    <Card key={meeting.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <TypeIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {isOrganizer ? 'Organizer' : 'Attendee'}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {meeting.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.time} • {meeting.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{meeting.attendees.length} attendees</span>
                          </div>
                          {meeting.type === 'in-person' && meeting.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {meeting.status === 'scheduled' && meeting.meetingLink && (
                            <Button 
                              size="sm" 
                              onClick={() => joinMeeting(meeting)}
                              className="gap-2"
                            >
                              <Video className="h-4 w-4" />
                              Join Meeting
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewRecordings(meeting)}
                            className="gap-2"
                          >
                            <Video className="h-4 w-4" />
                            View Recordings ({getMeetingRecordings(meeting.id).length})
                          </Button>
                          {meeting.meetingLink && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(meeting.meetingLink || '')}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Copy Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-card border border-border">
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No meetings scheduled</h3>
                  <p className="text-muted-foreground mb-4">Schedule your first meeting to get started</p>
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Meeting
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Recordings Modal */}
          {showRecordings && selectedMeeting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {selectedMeeting.title} - Recordings
                      </h2>
                      <p className="text-muted-foreground">
                        Meeting recordings and materials
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUploadRecording} className="gap-2">
                        <Video className="h-4 w-4" />
                        Upload Recording
                      </Button>
                      <Button variant="outline" onClick={() => setShowRecordings(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {getMeetingRecordings(selectedMeeting.id).length > 0 ? (
                    <div className="space-y-4">
                      {getMeetingRecordings(selectedMeeting.id).map((recording) => (
                        <Card key={recording.id} className="bg-card border border-border">
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground mb-2">{recording.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{recording.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Duration: {recording.duration} min</span>
                                  <span>Views: {recording.views}</span>
                                  <span>Uploaded: {new Date(recording.uploadedAt).toLocaleDateString()}</span>
                                </div>

                                <div className="flex gap-2 mt-3">
                                  {recording.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button size="sm" className="gap-2">
                                  <Video className="h-4 w-4" />
                                  Play
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No recordings yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Upload the first recording for this meeting
                      </p>
                      <Button onClick={handleUploadRecording} className="gap-2">
                        <Video className="h-4 w-4" />
                        Upload Recording
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
