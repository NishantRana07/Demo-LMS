'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download,
  Eye,
  Calendar,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage } from '@/lib/storage'
import type { User, Form } from '@/lib/storage'

interface FormResponse {
  id: string
  formId: string
  userId: string
  userName: string
  userEmail: string
  submittedAt: string
  responses: Record<string, any>
  status: 'submitted' | 'reviewed'
}

export default function HRFormsResponses() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterForm, setFilterForm] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

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
    
    // Load forms
    const savedForms = localStorage.getItem('qedge_forms')
    if (savedForms) {
      setForms(JSON.parse(savedForms))
    } else {
      // Create demo forms if none exist
      const demoForms: Form[] = [
        {
          id: '1',
          title: 'Employee Satisfaction Survey',
          description: 'Quarterly employee satisfaction and engagement survey',
          type: 'survey',
          status: 'published',
          fields: [
            { id: '1', type: 'select', label: 'Overall Satisfaction', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
            { id: '2', type: 'textarea', label: 'What do you like most about working here?', required: false },
            { id: '3', type: 'textarea', label: 'What improvements would you suggest?', required: false }
          ],
          responses: [],
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Training Feedback Form',
          description: 'Feedback for recent training sessions',
          type: 'feedback',
          status: 'published',
          fields: [
            { id: '1', type: 'radio', label: 'Training Quality', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
            { id: '2', type: 'textarea', label: 'Additional Comments', required: false }
          ],
          responses: [],
          createdAt: '2024-01-18T14:30:00Z'
        }
      ]
      setForms(demoForms)
      localStorage.setItem('qedge_forms', JSON.stringify(demoForms))
    }
    
    // Load responses
    const savedResponses = localStorage.getItem('qedge_form_responses')
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses))
    } else {
      // Create demo responses
      const demoResponses: FormResponse[] = [
        {
          id: '1',
          formId: '1',
          userId: 'user-emp-1',
          userName: 'John Smith',
          userEmail: 'john@company.com',
          submittedAt: '2024-01-20T10:30:00Z',
          responses: {
            '1': 'Satisfied',
            '2': 'Great team environment and supportive management',
            '3': 'More flexible work hours would be appreciated'
          },
          status: 'submitted'
        },
        {
          id: '2',
          formId: '1',
          userId: 'user-emp-2',
          userName: 'Jane Doe',
          userEmail: 'jane@company.com',
          submittedAt: '2024-01-21T14:15:00Z',
          responses: {
            '1': 'Very Satisfied',
            '2': 'Excellent learning opportunities and career growth',
            '3': 'Better communication between departments'
          },
          status: 'reviewed'
        },
        {
          id: '3',
          formId: '2',
          userId: 'user-emp-1',
          userName: 'John Smith',
          userEmail: 'john@company.com',
          submittedAt: '2024-01-22T09:45:00Z',
          responses: {
            '1': 'Excellent',
            '2': 'Very practical and well-structured content'
          },
          status: 'submitted'
        }
      ]
      setResponses(demoResponses)
      localStorage.setItem('qedge_form_responses', JSON.stringify(demoResponses))
    }
    
    setLoading(false)
  }

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesForm = filterForm === 'all' || response.formId === filterForm
    const matchesStatus = filterStatus === 'all' || response.status === filterStatus
    return matchesSearch && matchesForm && matchesStatus
  })

  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId)
    return form?.title || 'Unknown Form'
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'submitted': return <Clock className="h-4 w-4" />
      case 'reviewed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleMarkAsReviewed = (responseId: string) => {
    const updatedResponses = responses.map(response =>
      response.id === responseId ? { ...response, status: 'reviewed' as const } : response
    )
    setResponses(updatedResponses)
    localStorage.setItem('qedge_form_responses', JSON.stringify(updatedResponses))
  }

  const handleExportResponses = () => {
    // Create CSV content
    const headers = ['Form Title', 'User Name', 'User Email', 'Submitted At', 'Status', 'Responses']
    const csvContent = [
      headers.join(','),
      ...filteredResponses.map(response => {
        const form = forms.find(f => f.id === response.formId)
        const responsesText = Object.entries(response.responses)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
        return [
          `"${form?.title || 'Unknown'}"`,
          `"${response.userName}"`,
          `"${response.userEmail}"`,
          `"${new Date(response.submittedAt).toLocaleString()}"`,
          `"${response.status}"`,
          `"${responsesText}"`
        ].join(',')
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form_responses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/hr/forms')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Form Responses</h1>
                <p className="text-muted-foreground mt-2">
                  Review and analyze submitted form responses
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleExportResponses}
              disabled={filteredResponses.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{responses.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {responses.filter(r => r.status === 'submitted').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {responses.filter(r => r.status === 'reviewed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Forms with Responses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {[...new Set(responses.map(r => r.formId))].length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Forms</option>
              {forms.map(form => (
                <option key={form.id} value={form.id}>{form.title}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="submitted">Pending Review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Responses List */}
          <div className="space-y-4">
            {filteredResponses.length > 0 ? (
              filteredResponses.map((response) => (
                <Card key={response.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{getFormTitle(response.formId)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(response.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(response.status)}
                            {response.status}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-medium">{response.userName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="font-medium">{new Date(response.submittedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fields:</span>
                          <span className="font-medium">{Object.keys(response.responses).length}</span>
                        </div>
                      </div>
                      
                      {/* Response Preview */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">Response Preview:</h4>
                        <div className="space-y-2">
                          {Object.entries(response.responses).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-muted-foreground">{key}:</span>
                              <span className="ml-2">{typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value}</span>
                            </div>
                          ))}
                          {Object.keys(response.responses).length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              ... and {Object.keys(response.responses).length - 3} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      
                      {response.status === 'submitted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsReviewed(response.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No responses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterForm !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No form responses have been submitted yet'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Response Details</h3>
                <Button variant="outline" onClick={() => setSelectedResponse(null)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Form</Label>
                  <p className="font-medium">{getFormTitle(selectedResponse.formId)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User</Label>
                    <p className="font-medium">{selectedResponse.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedResponse.userEmail}</p>
                  </div>
                  
                  <div>
                    <Label>Submitted</Label>
                    <p className="font-medium">{new Date(selectedResponse.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Responses</Label>
                  <div className="space-y-3 mt-2">
                    {Object.entries(selectedResponse.responses).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-3">
                        <p className="font-medium text-sm mb-1">{key}</p>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  {selectedResponse.status === 'submitted' && (
                    <Button 
                      onClick={() => {
                        handleMarkAsReviewed(selectedResponse.id)
                        setSelectedResponse(null)
                      }}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Reviewed
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedResponse(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}
