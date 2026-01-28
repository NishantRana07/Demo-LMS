'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Monitor,
  Presentation,
  Clock,
  Tag
} from 'lucide-react'
import { 
  getCurrentUser, 
  initializeStorage
} from '@/lib/storage'
import type { User, LearningObject } from '@/lib/storage'

export default function HRLearningObjects() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [learningObjects, setLearningObjects] = useState<LearningObject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Load demo learning objects
    const demoObjects: LearningObject[] = [
      {
        id: 'lo-1',
        title: 'Introduction to Project Management',
        description: 'Learn the fundamentals of project management',
        type: 'video',
        content: 'Video content for project management basics',
        category: 'Management',
        difficulty: 'beginner',
        duration: 45,
        tags: ['project-management', 'basics', 'management'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'lo-2',
        title: 'Communication Skills Assessment',
        description: 'Interactive quiz to test communication skills',
        type: 'quiz',
        content: 'Quiz content with multiple choice questions',
        category: 'Soft Skills',
        difficulty: 'intermediate',
        duration: 30,
        tags: ['communication', 'assessment', 'soft-skills'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'lo-3',
        title: 'Leadership Principles',
        description: 'Essential leadership concepts and practices',
        type: 'presentation',
        content: 'Leadership training presentation slides',
        category: 'Leadership',
        difficulty: 'advanced',
        duration: 60,
        tags: ['leadership', 'management', 'strategy'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'lo-4',
        title: 'Safety Guidelines Document',
        description: 'Comprehensive workplace safety procedures',
        type: 'document',
        content: 'PDF document with safety guidelines',
        category: 'Compliance',
        difficulty: 'beginner',
        duration: 20,
        tags: ['safety', 'compliance', 'workplace'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'lo-5',
        title: 'Team Building Simulation',
        description: 'Interactive team building exercise',
        type: 'interactive',
        content: 'Simulation-based team activity',
        category: 'Team Development',
        difficulty: 'intermediate',
        duration: 90,
        tags: ['teamwork', 'collaboration', 'soft-skills'],
        createdAt: new Date().toISOString()
      }
    ]
    
    setLearningObjects(demoObjects)
    setLoading(false)
  }, [router])

  const filteredObjects = learningObjects.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || obj.type === filterType
    const matchesCategory = filterCategory === 'all' || obj.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      case 'interactive': return <Monitor className="h-4 w-4" />
      case 'presentation': return <Presentation className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'video': return 'bg-blue-100 text-blue-800'
      case 'document': return 'bg-green-100 text-green-800'
      case 'quiz': return 'bg-purple-100 text-purple-800'
      case 'interactive': return 'bg-orange-100 text-orange-800'
      case 'presentation': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
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
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Objects</h1>
              <p className="text-muted-foreground mt-2">
                Manage learning content and resources
              </p>
            </div>
            
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Learning Object
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Objects</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{learningObjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Videos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {learningObjects.filter(o => o.type === 'video').length}
                  </p>
                </div>
                <Video className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {learningObjects.filter(o => o.type === 'document').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interactive</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {learningObjects.filter(o => o.type === 'interactive' || o.type === 'quiz').length}
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learning objects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="quiz">Quiz</option>
              <option value="interactive">Interactive</option>
              <option value="presentation">Presentation</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              <option value="Management">Management</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Compliance">Compliance</option>
              <option value="Team Development">Team Development</option>
            </select>
          </div>

          {/* Learning Objects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjects.length > 0 ? (
              filteredObjects.map((obj) => (
                <Card key={obj.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(obj.type)}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(obj.type)}`}>
                          {obj.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(obj.difficulty)}`}>
                          {obj.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">{obj.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{obj.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{obj.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{obj.duration || 0} min</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {obj.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {obj.tags.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{obj.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No learning objects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Get started by creating your first learning object'}
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Learning Object
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
