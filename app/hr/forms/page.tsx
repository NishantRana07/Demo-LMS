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
  FileText,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Download,
  Eye
} from 'lucide-react'
import { 
  getCurrentUser, 
  getForms,
  initializeStorage
} from '@/lib/storage'
import type { User, Form } from '@/lib/storage'

export default function HRForms() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setForms(getForms())
    setLoading(false)
  }, [router])

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus
    const matchesType = filterType === 'all' || form.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'survey': return '📊'
      case 'feedback': return '💬'
      case 'application': return '📝'
      case 'assessment': return '🎯'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'survey': return 'bg-blue-100 text-blue-800'
      case 'feedback': return 'bg-purple-100 text-purple-800'
      case 'application': return 'bg-orange-100 text-orange-800'
      case 'assessment': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
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
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Forms & Surveys</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage forms for feedback, applications, and assessments
              </p>
            </div>
            
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{forms.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {forms.filter(f => f.status === 'published').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {forms.reduce((sum, f) => sum + f.responses.length, 0)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Responses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {forms.length > 0 ? Math.round(forms.reduce((sum, f) => sum + f.responses.length, 0) / forms.length) : 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
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
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="survey">Survey</option>
              <option value="feedback">Feedback</option>
              <option value="application">Application</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.length > 0 ? (
              filteredForms.map((form) => {
                const responseRate = forms.length > 0 ? Math.round((form.responses.length / 10) * 100) : 0
                const isActive = form.status === 'published'
                
                return (
                  <Card key={form.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                          {getTypeIcon(form.type)}
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                            {form.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(form.type)}`}>
                            {form.type}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">{form.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{form.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Fields</span>
                          <span className="font-medium">{form.fields.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Responses</span>
                          <span className="font-medium">{form.responses.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created</span>
                          <span className="font-medium">{getTimeAgo(form.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Response Rate */}
                      {form.responses.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Response Rate</span>
                            <span className="font-medium">{responseRate}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(responseRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status-specific info */}
                      {isActive && (
                        <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Form is active and collecting responses
                          </span>
                        </div>
                      )}
                      
                      {form.status === 'closed' && (
                        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-800">
                            Form closed - {form.responses.length} responses collected
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {form.responses.length > 0 && (
                          <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <BarChart3 className="h-4 w-4" />
                            View Results
                          </Button>
                        )}
                        {form.responses.length > 0 && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No forms found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Get started by creating your first form'}
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Form
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
