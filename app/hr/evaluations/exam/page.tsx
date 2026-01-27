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
  Clipboard, 
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
  FileText,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface Exam {
  id: string
  title: string
  description: string
  course: string
  duration: number // in minutes
  totalQuestions: number
  totalPoints: number
  passingScore: number
  scheduledDate: string
  startTime: string
  endTime: string
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  enrolledUsers: string[]
  submittedUsers: string[]
  instructions: string
  createdAt: string
}

export default function HREvaluationsExam() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    duration: '60',
    totalQuestions: '20',
    totalPoints: '100',
    passingScore: '70',
    scheduledDate: '',
    startTime: '09:00',
    endTime: '11:00',
    instructions: ''
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
    // Load exams from localStorage or create demo data
    const savedExams = localStorage.getItem('qedge_exams')
    if (savedExams) {
      setExams(JSON.parse(savedExams))
    } else {
      const demoExams: Exam[] = [
        {
          id: '1',
          title: 'JavaScript Fundamentals Final Exam',
          description: 'Comprehensive assessment of JavaScript concepts including ES6+, async programming, and DOM manipulation.',
          course: 'Web Development Basics',
          duration: 90,
          totalQuestions: 30,
          totalPoints: 100,
          passingScore: 70,
          scheduledDate: '2024-02-01',
          startTime: '10:00',
          endTime: '11:30',
          status: 'scheduled',
          enrolledUsers: ['user-emp-1', 'user-emp-2'],
          submittedUsers: [],
          instructions: 'Read all questions carefully. You have 90 minutes to complete the exam.',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'React Components Assessment',
          description: 'Test your knowledge of React components, hooks, and state management.',
          course: 'Advanced React',
          duration: 60,
          totalQuestions: 25,
          totalPoints: 100,
          passingScore: 75,
          scheduledDate: '2024-01-25',
          startTime: '14:00',
          endTime: '15:00',
          status: 'completed',
          enrolledUsers: ['user-emp-1'],
          submittedUsers: ['user-emp-1'],
          instructions: 'This exam covers React hooks, component lifecycle, and state management patterns.',
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          title: 'CSS and Styling Quiz',
          description: 'Assessment of CSS concepts including Flexbox, Grid, and responsive design.',
          course: 'Frontend Development',
          duration: 45,
          totalQuestions: 20,
          totalPoints: 50,
          passingScore: 60,
          scheduledDate: '2024-02-05',
          startTime: '15:00',
          endTime: '15:45',
          status: 'draft',
          enrolledUsers: [],
          submittedUsers: [],
          instructions: 'Focus on modern CSS techniques and responsive design principles.',
          createdAt: '2024-01-20T09:15:00Z'
        }
      ]
      setExams(demoExams)
      localStorage.setItem('qedge_exams', JSON.stringify(demoExams))
    }
    setLoading(false)
  }

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    const newExam: Exam = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      course: formData.course,
      duration: parseInt(formData.duration),
      totalQuestions: parseInt(formData.totalQuestions),
      totalPoints: parseInt(formData.totalPoints),
      passingScore: parseInt(formData.passingScore),
      scheduledDate: formData.scheduledDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: 'draft',
      enrolledUsers: [],
      submittedUsers: [],
      instructions: formData.instructions,
      createdAt: new Date().toISOString()
    }
    
    const updatedExams = [...exams, newExam]
    setExams(updatedExams)
    localStorage.setItem('qedge_exams', JSON.stringify(updatedExams))
    
    setFormData({
      title: '',
      description: '',
      course: '',
      duration: '60',
      totalQuestions: '20',
      totalPoints: '100',
      passingScore: '70',
      scheduledDate: '',
      startTime: '09:00',
      endTime: '11:00',
      instructions: ''
    })
    setShowCreateForm(false)
  }

  const handleDeleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      const updatedExams = exams.filter(e => e.id !== id)
      setExams(updatedExams)
      localStorage.setItem('qedge_exams', JSON.stringify(updatedExams))
    }
  }

  const handleStatusChange = (id: string, newStatus: Exam['status']) => {
    const updatedExams = exams.map(exam => 
      exam.id === id ? { ...exam, status: newStatus } : exam
    )
    setExams(updatedExams)
    localStorage.setItem('qedge_exams', JSON.stringify(updatedExams))
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'in-progress': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      case 'cancelled': return <Square className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold text-foreground">Exams</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage scheduled examinations
              </p>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Exams</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{exams.length}</p>
                </div>
                <Clipboard className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {exams.filter(e => e.status === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {exams.filter(e => e.status === 'in-progress').length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {exams.filter(e => e.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
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
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Create Exam Form */}
          {showCreateForm && (
            <Card className="p-6 mb-8 bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Create New Exam</h3>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter exam title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter exam description"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course *</Label>
                    <Input
                      id="course"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="60"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalQuestions">Total Questions *</Label>
                    <Input
                      id="totalQuestions"
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({...formData, totalQuestions: e.target.value})}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPoints">Total Points *</Label>
                    <Input
                      id="totalPoints"
                      type="number"
                      value={formData.totalPoints}
                      onChange={(e) => setFormData({...formData, totalPoints: e.target.value})}
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passingScore">Passing Score (%) *</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({...formData, passingScore: e.target.value})}
                      placeholder="70"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="Enter exam instructions for students"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit">Create Exam</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Exams List */}
          <div className="space-y-4">
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <Card key={exam.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{exam.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Course:</span>
                          <span className="font-medium">{exam.course}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{new Date(exam.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{exam.startTime} - {exam.endTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Enrolled:</span>
                          <span className="font-medium">{exam.enrolledUsers.length}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <Clipboard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Questions:</span>
                          <span className="font-medium">{exam.totalQuestions}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Points:</span>
                          <span className="font-medium">{exam.totalPoints}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Passing:</span>
                          <span className="font-medium">{exam.passingScore}%</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{exam.duration} min</span>
                        </div>
                      </div>
                      
                      {exam.submittedUsers.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            {exam.submittedUsers.length} users have submitted the exam
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Clipboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No exams found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by creating your first exam'}
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Exam
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
