'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  Settings,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Repeat,
  Mail,
  Phone
} from 'lucide-react'
import { getCurrentUser, initializeStorage, getBatches, getAllUsers } from '@/lib/storage'
import type { User, Batch } from '@/lib/storage'

interface Schedule {
  id: string
  batchId: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  instructor: string
  type: 'classroom' | 'online' | 'hybrid'
  recurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringEndDate?: string
  reminders: boolean
  reminderTime: string
  attendees: string[]
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
}

export default function ScheduleBatch() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState<Batch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBatch, setFilterBatch] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    batchId: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    instructor: '',
    type: 'classroom' as 'classroom' | 'online' | 'hybrid',
    recurring: false,
    recurringPattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurringEndDate: '',
    reminders: true,
    reminderTime: '30',
    attendees: [] as string[],
    notes: ''
  })

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
    setBatches(getBatches())
    setUsers(getAllUsers())
    loadSchedules()
  }

  const loadSchedules = () => {
    // TODO: Load schedules from storage
    // For now, using mock data
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        batchId: '1',
        title: 'JavaScript Fundamentals',
        description: 'Introduction to JavaScript programming',
        date: '2024-01-20',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Room 101',
        instructor: 'John Doe',
        type: 'classroom',
        recurring: true,
        recurringPattern: 'weekly',
        recurringEndDate: '2024-03-20',
        reminders: true,
        reminderTime: '30',
        attendees: ['1', '2', '3'],
        notes: 'Bring laptops',
        status: 'scheduled',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        batchId: '2',
        title: 'React Workshop',
        description: 'Advanced React concepts and patterns',
        date: '2024-01-25',
        startTime: '10:00',
        endTime: '16:00',
        location: 'Online',
        instructor: 'Jane Smith',
        type: 'online',
        recurring: false,
        reminders: true,
        reminderTime: '60',
        attendees: ['4', '5'],
        notes: 'Zoom link will be sent',
        status: 'scheduled',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]
    setSchedules(mockSchedules)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        batchId: formData.batchId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        instructor: formData.instructor,
        type: formData.type,
        recurring: formData.recurring,
        recurringPattern: formData.recurringPattern,
        recurringEndDate: formData.recurringEndDate || undefined,
        reminders: formData.reminders,
        reminderTime: formData.reminderTime,
        attendees: formData.attendees,
        notes: formData.notes,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      }

      setSchedules(prev => [...prev, newSchedule])
      setShowCreateModal(false)
      resetForm()

      if (formData.reminders) {
        // TODO: Implement reminder functionality
        console.log('Reminders would be set for:', formData.title)
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      batchId: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      instructor: '',
      type: 'classroom',
      recurring: false,
      recurringPattern: 'weekly',
      recurringEndDate: '',
      reminders: true,
      reminderTime: '30',
      attendees: [],
      notes: ''
    })
  }

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id))
  }

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId)
    return batch ? batch.name : 'Unknown Batch'
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown User'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'classroom': return 'bg-blue-100 text-blue-800'
      case 'online': return 'bg-green-100 text-green-800'
      case 'hybrid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSchedules = schedules.filter(schedule => {
    const batchName = getBatchName(schedule.batchId).toLowerCase()
    const title = schedule.title.toLowerCase()
    const matchesSearch = batchName.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase())
    const matchesFilter = filterBatch === 'all' || schedule.batchId === filterBatch
    return matchesSearch && matchesFilter
  })

  if (!currentUser) {
    return <div className="flex h-screen bg-gray-100"><div className="animate-pulse bg-gray-200 h-full w-full"></div></div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HRSidebar userName={currentUser.name} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/hr/batches')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Batch Schedules</h1>
                <p className="text-gray-600 mt-2">Manage training batch schedules and sessions</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Schedule
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by batch or schedule title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterBatch} onValueChange={setFilterBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Schedules List */}
          <div className="space-y-4">
            {filteredSchedules.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                <p className="text-gray-600 mb-4">Create your first batch schedule to get started</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </Button>
              </Card>
            ) : (
              filteredSchedules.map((schedule) => (
                <Card key={schedule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{schedule.title}</h4>
                          <p className="text-sm text-gray-600">{getBatchName(schedule.batchId)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(schedule.type)}>
                            {schedule.type}
                          </Badge>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                          {schedule.recurring && (
                            <Badge variant="outline" className="gap-1">
                              <Repeat className="h-3 w-3" />
                              {schedule.recurringPattern}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{schedule.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{schedule.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{schedule.instructor}</span>
                        </div>
                        {schedule.reminders && (
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{schedule.reminderTime} min before</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{schedule.attendees.length} attendees</span>
                        </div>
                      </div>

                      {schedule.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">{schedule.description}</p>
                        </div>
                      )}

                      {schedule.attendees.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attendees:</p>
                          <div className="flex flex-wrap gap-2">
                            {schedule.attendees.slice(0, 5).map(attendeeId => (
                              <Badge key={attendeeId} variant="outline" className="text-xs">
                                {getUserName(attendeeId)}
                              </Badge>
                            ))}
                            {schedule.attendees.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{schedule.attendees.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {schedule.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{schedule.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Create Schedule Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Schedule</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="batchId">Batch *</Label>
                        <Select value={formData.batchId} onValueChange={(value) => setFormData(prev => ({ ...prev, batchId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.map(batch => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="title">Schedule Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter schedule title"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter schedule description"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instructor">Instructor</Label>
                        <Input
                          id="instructor"
                          value={formData.instructor}
                          onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                          placeholder="Enter instructor name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Session Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classroom">Classroom</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reminderTime">Reminder Time (minutes)</Label>
                        <Input
                          id="reminderTime"
                          type="number"
                          value={formData.reminderTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                          placeholder="30"
                          min="5"
                          max="1440"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={formData.recurring}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="recurring">Recurring Schedule</Label>
                      </div>
                      
                      {formData.recurring && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                          <div>
                            <Label htmlFor="recurringPattern">Pattern</Label>
                            <Select value={formData.recurringPattern} onValueChange={(value) => setFormData(prev => ({ ...prev, recurringPattern: value as any }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="recurringEndDate">End Date</Label>
                            <Input
                              id="recurringEndDate"
                              type="date"
                              value={formData.recurringEndDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Creating...' : 'Create Schedule'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
