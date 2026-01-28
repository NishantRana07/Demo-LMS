'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  TrendingUp
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface Assignment {
  id: string
  title: string
  description: string
  course: string
  assignedTo: string[]
  dueDate: string
  status: 'draft' | 'published' | 'closed'
  submissions: number
  totalPoints: number
  createdAt: string
  learners?: {
    id: string
    name: string
    email: string
    progress: number
    completedAt?: string
  }[]
}

export default function HREvaluationsAssignment() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    totalPoints: '100'
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
    setUsers(getAllUsers())
    // Load assignments from localStorage or create demo data
    const savedAssignments = localStorage.getItem('qedge_assignments')
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments))
    } else {
      const demoAssignments: Assignment[] = [
        {
          id: '1',
          title: 'JavaScript Fundamentals Quiz',
          description: 'Test your knowledge of JavaScript basics including variables, functions, and control structures.',
          course: 'Web Development Basics',
          assignedTo: ['user-emp-1', 'user-emp-2'],
          dueDate: '2024-02-15',
          status: 'published',
          submissions: 12,
          totalPoints: 100,
          createdAt: '2024-01-15T10:00:00Z',
          learners: [
            {
              id: 'user-emp-1',
              name: 'John Smith',
              email: 'john.smith@company.com',
              progress: 85,
              completedAt: '2024-02-10T14:30:00Z'
            },
            {
              id: 'user-emp-2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@company.com',
              progress: 92,
              completedAt: '2024-02-08T16:45:00Z'
            }
          ]
        },
        {
          id: '2',
          title: 'React Components Assignment',
          description: 'Create a functional React component with props and state management.',
          course: 'Advanced React',
          assignedTo: ['user-emp-3', 'user-emp-4', 'user-emp-5'],
          dueDate: '2024-02-20',
          status: 'published',
          submissions: 8,
          totalPoints: 150,
          createdAt: '2024-01-18T14:30:00Z',
          learners: [
            {
              id: 'user-emp-3',
              name: 'Mike Wilson',
              email: 'mike.wilson@company.com',
              progress: 67
            },
            {
              id: 'user-emp-4',
              name: 'Emily Davis',
              email: 'emily.davis@company.com',
              progress: 45
            },
            {
              id: 'user-emp-5',
              name: 'Robert Brown',
              email: 'robert.brown@company.com',
              progress: 78
            }
          ]
        },
        {
          id: '3',
          title: 'Python Data Analysis',
          description: 'Learn data analysis techniques using Python pandas and numpy libraries.',
          course: 'Data Science Fundamentals',
          assignedTo: ['user-emp-6'],
          dueDate: '2024-02-25',
          status: 'published',
          submissions: 5,
          totalPoints: 120,
          createdAt: '2024-01-20T09:15:00Z',
          learners: [
            {
              id: 'user-emp-6',
              name: 'Lisa Anderson',
              email: 'lisa.anderson@company.com',
              progress: 34
            }
          ]
        }
      ]
      setAssignments(demoAssignments)
      localStorage.setItem('qedge_assignments', JSON.stringify(demoAssignments))
    }
    setLoading(false)
  }

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      course: formData.course,
      assignedTo: [],
      dueDate: formData.dueDate,
      status: 'draft',
      submissions: 0,
      totalPoints: parseInt(formData.totalPoints),
      createdAt: new Date().toISOString()
    }
    
    const updatedAssignments = [...assignments, newAssignment]
    setAssignments(updatedAssignments)
    localStorage.setItem('qedge_assignments', JSON.stringify(updatedAssignments))
    
    setFormData({ title: '', description: '', course: '', dueDate: '', totalPoints: '100' })
    setShowCreateForm(false)
  }

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      const updatedAssignments = assignments.filter(a => a.id !== id)
      setAssignments(updatedAssignments)
      localStorage.setItem('qedge_assignments', JSON.stringify(updatedAssignments))
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
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
                <div key={i} className="h-24 bg-muted rounded"></div>
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
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assigned Courses</h1>
              <p className="text-muted-foreground mt-2">
                View and manage course assignments to learners
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Courses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{assignments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {assignments.filter(a => a.status === 'published').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {assignments.reduce((sum, a) => sum + a.submissions, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">87%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assigned courses..."
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
              <option value="published">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="course">Course</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          {/* Assigned Courses List */}
          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status === 'published' ? 'Active' : assignment.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Course Assigned
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{assignment.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Course:</span>
                          <span className="font-medium">{assignment.course}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due:</span>
                          <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Enrolled:</span>
                          <span className="font-medium">{assignment.assignedTo.length} learners</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Submissions:</span>
                          <span className="font-medium">{assignment.submissions}</span>
                        </div>
                      </div>

                      {/* Learners Section */}
                      {assignment.learners && assignment.learners.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-foreground mb-3">Assigned Learners</h4>
                          <div className="space-y-2">
                            {assignment.learners.map((learner) => (
                              <div key={learner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-800">
                                      {learner.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{learner.name}</p>
                                    <p className="text-sm text-muted-foreground">{learner.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{learner.progress}%</p>
                                    <p className="text-xs text-muted-foreground">Progress</p>
                                  </div>
                                  {learner.completedAt && (
                                    <div className="text-right">
                                      <p className="text-sm text-green-600">Completed</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(learner.completedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No assigned courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No courses have been assigned to learners yet'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
