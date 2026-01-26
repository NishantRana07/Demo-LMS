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
  Users,
  Calendar,
  BookOpen,
  Clock,
  Target,
  Award,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { getCurrentUser, initializeStorage, getAllUsers, createBatch } from '@/lib/storage'
import type { User, Batch } from '@/lib/storage'

export default function CreateBatch() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: '',
    instructor: '',
    startDate: '',
    endDate: '',
    schedule: '',
    location: '',
    maxCapacity: '',
    price: '',
    status: 'planned' as 'planned' | 'active' | 'completed' | 'cancelled',
    requirements: '',
    objectives: '',
    materials: '',
    assessment: '',
    certificate: false,
    autoEnroll: false,
    sendReminders: true
  })

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    loadUsers()
  }, [router])

  const loadUsers = () => {
    const allUsers = getAllUsers()
    setUsers(allUsers.filter(u => u.role === 'employee'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newBatch: Batch = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        courseIds: [], // TODO: Add course selection
        participantIds: selectedUsers,
        instructorId: formData.instructor,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        createdAt: new Date().toISOString()
      }

      createBatch(newBatch)
      
      if (formData.autoEnroll) {
        // TODO: Implement auto-enrollment functionality
        console.log('Auto-enrolling users:', selectedUsers)
      }

      router.push('/hr/batches')
    } catch (error) {
      console.error('Error creating batch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id))
  }

  const deselectAllUsers = () => {
    setSelectedUsers([])
  }

  if (!currentUser) {
    return <div className="flex h-screen bg-gray-100"><div className="animate-pulse bg-gray-200 h-full w-full"></div></div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HRSidebar userName={currentUser.name} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => router.push('/hr/batches')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Batch</h1>
              <p className="text-gray-600 mt-2">Create a new training batch with schedule and enrollment</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Batch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter batch name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course *</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    placeholder="Enter instructor name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter batch description"
                  rows={3}
                />
              </div>
            </Card>

            {/* Schedule & Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => handleInputChange('schedule', e.target.value)}
                    placeholder="e.g., Mon-Wed-Fri, 9:00 AM - 5:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </Card>

            {/* Capacity & Pricing */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Capacity & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                    placeholder="Enter maximum capacity"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </Card>

            {/* Course Content */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Course Content
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Enter course requirements"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                    placeholder="Enter learning objectives"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="materials">Materials</Label>
                  <Textarea
                    id="materials"
                    value={formData.materials}
                    onChange={(e) => handleInputChange('materials', e.target.value)}
                    placeholder="Enter required materials"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="assessment">Assessment Method</Label>
                  <Textarea
                    id="assessment"
                    value={formData.assessment}
                    onChange={(e) => handleInputChange('assessment', e.target.value)}
                    placeholder="Enter assessment methods"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* User Enrollment */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Enrollment
                </h3>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllUsers}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={deselectAllUsers}>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selected: {selectedUsers.length} users
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                      {user.name}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="certificate"
                    checked={formData.certificate}
                    onChange={(e) => handleInputChange('certificate', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="certificate">Issue certificate upon completion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoEnroll"
                    checked={formData.autoEnroll}
                    onChange={(e) => handleInputChange('autoEnroll', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="autoEnroll">Auto-enroll selected users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendReminders"
                    checked={formData.sendReminders}
                    onChange={(e) => handleInputChange('sendReminders', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sendReminders">Send schedule reminders</Label>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Batch'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/hr/batches')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
