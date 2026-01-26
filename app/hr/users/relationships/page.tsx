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
  Users, 
  ArrowLeft, 
  Save, 
  Plus,
  Search,
  Filter,
  Link,
  UserPlus,
  UserMinus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Briefcase,
  GraduationCap,
  Award,
  Target
} from 'lucide-react'
import { getCurrentUser, initializeStorage, getAllUsers } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface Relationship {
  id: string
  mentorId: string
  menteeId: string
  type: 'mentorship' | 'buddy' | 'team_lead' | 'manager'
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'paused'
  goals: string[]
  notes: string
  createdAt: string
}

export default function TraineeRelationships() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    mentorId: '',
    menteeId: '',
    type: 'mentorship' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    goals: '',
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
    loadUsers()
    loadRelationships()
  }, [router])

  const loadUsers = () => {
    const allUsers = getAllUsers()
    setUsers(allUsers)
  }

  const loadRelationships = () => {
    // TODO: Load relationships from storage
    // For now, using mock data
    const mockRelationships: Relationship[] = [
      {
        id: '1',
        mentorId: '1',
        menteeId: '2',
        type: 'mentorship',
        startDate: '2024-01-01',
        status: 'active',
        goals: ['Complete onboarding', 'Learn system processes'],
        notes: 'Mentor for new employee onboarding',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        mentorId: '3',
        menteeId: '4',
        type: 'buddy',
        startDate: '2024-01-15',
        status: 'active',
        goals: ['Team integration', 'Culture understanding'],
        notes: 'Buddy system for team integration',
        createdAt: '2024-01-15T00:00:00Z'
      }
    ]
    setRelationships(mockRelationships)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newRelationship: Relationship = {
        id: Date.now().toString(),
        mentorId: formData.mentorId,
        menteeId: formData.menteeId,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: 'active',
        goals: formData.goals.split(',').map(g => g.trim()).filter(g => g),
        notes: formData.notes,
        createdAt: new Date().toISOString()
      }

      setRelationships(prev => [...prev, newRelationship])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating relationship:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      mentorId: '',
      menteeId: '',
      type: 'mentorship',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      goals: '',
      notes: ''
    })
  }

  const deleteRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id))
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown User'
  }

  const getUserRole = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.role : 'unknown'
  }

  const filteredRelationships = relationships.filter(rel => {
    const mentorName = getUserName(rel.mentorId).toLowerCase()
    const menteeName = getUserName(rel.menteeId).toLowerCase()
    const matchesSearch = mentorName.includes(searchTerm.toLowerCase()) || menteeName.includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || rel.type === filterType
    return matchesSearch && matchesFilter
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mentorship': return 'bg-blue-100 text-blue-800'
      case 'buddy': return 'bg-green-100 text-green-800'
      case 'team_lead': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/hr/users')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Trainee Relationships</h1>
                <p className="text-gray-600 mt-2">Manage mentorship and buddy relationships</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Relationship
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by mentor or mentee name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="buddy">Buddy</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Relationships List */}
          <div className="space-y-4">
            {filteredRelationships.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships found</h3>
                <p className="text-gray-600 mb-4">Create your first trainee relationship to get started</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Relationship
                </Button>
              </Card>
            ) : (
              filteredRelationships.map((relationship) => (
                <Card key={relationship.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{getUserName(relationship.mentorId)}</p>
                            <p className="text-sm text-gray-500 capitalize">{getUserRole(relationship.mentorId)}</p>
                          </div>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{getUserName(relationship.menteeId)}</p>
                            <p className="text-sm text-gray-500 capitalize">{getUserRole(relationship.menteeId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(relationship.type)}>
                            {relationship.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(relationship.status)}>
                            {relationship.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Start Date</p>
                          <p className="text-sm text-gray-600">{relationship.startDate}</p>
                        </div>
                        {relationship.endDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">End Date</p>
                            <p className="text-sm text-gray-600">{relationship.endDate}</p>
                          </div>
                        )}
                      </div>

                      {relationship.goals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {relationship.goals.map((goal, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Target className="h-3 w-3 mr-1" />
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {relationship.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{relationship.notes}</p>
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
                        onClick={() => deleteRelationship(relationship.id)}
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

          {/* Create Relationship Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Relationship</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mentorId">Mentor *</Label>
                        <Select value={formData.mentorId} onValueChange={(value) => setFormData(prev => ({ ...prev, mentorId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mentor" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter(u => u.role !== 'employee').map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="menteeId">Mentee *</Label>
                        <Select value={formData.menteeId} onValueChange={(value) => setFormData(prev => ({ ...prev, menteeId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mentee" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter(u => u.role === 'employee').map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Relationship Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mentorship">Mentorship</SelectItem>
                            <SelectItem value="buddy">Buddy</SelectItem>
                            <SelectItem value="team_lead">Team Lead</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="goals">Goals (comma-separated)</Label>
                      <Textarea
                        id="goals"
                        value={formData.goals}
                        onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                        placeholder="e.g., Complete onboarding, Learn processes, Team integration"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes about this relationship"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Creating...' : 'Create Relationship'}
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
