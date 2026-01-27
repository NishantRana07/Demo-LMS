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
  Award, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp,
  Target,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  proficiencyRequired: number
  assessmentMethod: 'quiz' | 'practical' | 'project' | 'peer-review'
  status: 'active' | 'inactive'
  usersAssessed: number
  averageScore: number
  createdAt: string
}

export default function HREvaluationsSkills() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    level: 'intermediate' as Skill['level'],
    proficiencyRequired: '70',
    assessmentMethod: 'quiz' as Skill['assessmentMethod']
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
    // Load skills from localStorage or create demo data
    const savedSkills = localStorage.getItem('qedge_skills')
    if (savedSkills) {
      setSkills(JSON.parse(savedSkills))
    } else {
      const demoSkills: Skill[] = [
        {
          id: '1',
          name: 'JavaScript Programming',
          description: 'Proficiency in JavaScript including ES6+ features, async programming, and DOM manipulation.',
          category: 'Programming',
          level: 'intermediate',
          proficiencyRequired: 75,
          assessmentMethod: 'practical',
          status: 'active',
          usersAssessed: 24,
          averageScore: 82,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'React Development',
          description: 'Building modern web applications using React, including hooks, state management, and component lifecycle.',
          category: 'Frontend',
          level: 'advanced',
          proficiencyRequired: 80,
          assessmentMethod: 'project',
          status: 'active',
          usersAssessed: 18,
          averageScore: 76,
          createdAt: '2024-01-16T14:30:00Z'
        },
        {
          id: '3',
          name: 'Communication Skills',
          description: 'Effective verbal and written communication, presentation skills, and interpersonal abilities.',
          category: 'Soft Skills',
          level: 'intermediate',
          proficiencyRequired: 70,
          assessmentMethod: 'peer-review',
          status: 'active',
          usersAssessed: 32,
          averageScore: 88,
          createdAt: '2024-01-17T09:15:00Z'
        },
        {
          id: '4',
          name: 'Project Management',
          description: 'Planning, executing, and managing projects using agile methodologies and project management tools.',
          category: 'Management',
          level: 'expert',
          proficiencyRequired: 85,
          assessmentMethod: 'practical',
          status: 'active',
          usersAssessed: 12,
          averageScore: 79,
          createdAt: '2024-01-18T16:45:00Z'
        }
      ]
      setSkills(demoSkills)
      localStorage.setItem('qedge_skills', JSON.stringify(demoSkills))
    }
    setLoading(false)
  }

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      proficiencyRequired: parseInt(formData.proficiencyRequired),
      assessmentMethod: formData.assessmentMethod,
      status: 'active',
      usersAssessed: 0,
      averageScore: 0,
      createdAt: new Date().toISOString()
    }
    
    const updatedSkills = [...skills, newSkill]
    setSkills(updatedSkills)
    localStorage.setItem('qedge_skills', JSON.stringify(updatedSkills))
    
    setFormData({
      name: '',
      description: '',
      category: '',
      level: 'intermediate',
      proficiencyRequired: '70',
      assessmentMethod: 'quiz'
    })
    setShowCreateForm(false)
  }

  const handleDeleteSkill = (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      const updatedSkills = skills.filter(s => s.id !== id)
      setSkills(updatedSkills)
      localStorage.setItem('qedge_skills', JSON.stringify(updatedSkills))
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory
    const matchesLevel = filterLevel === 'all' || skill.level === filterLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAssessmentColor = (method: string) => {
    switch(method) {
      case 'quiz': return 'bg-orange-100 text-orange-800'
      case 'practical': return 'bg-cyan-100 text-cyan-800'
      case 'project': return 'bg-pink-100 text-pink-800'
      case 'peer-review': return 'bg-indigo-100 text-indigo-800'
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
              <h1 className="text-3xl font-bold text-foreground">Skills Assessment</h1>
              <p className="text-muted-foreground mt-2">
                Define and track employee skill competencies
              </p>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{skills.length}</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {[...new Set(skills.map(s => s.category))].length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {skills.reduce((sum, s) => sum + s.usersAssessed, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + s.averageScore, 0) / skills.length) : 0}%
                  </p>
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
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {[...new Set(skills.map(s => s.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Create Skill Form */}
          {showCreateForm && (
            <Card className="p-6 mb-8 bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Add New Skill</h3>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <Label htmlFor="name">Skill Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter skill name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the skill and what it entails"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., Programming, Soft Skills"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="level">Proficiency Level *</Label>
                    <Select value={formData.level} onValueChange={(value: Skill['level']) => setFormData({...formData, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assessmentMethod">Assessment Method *</Label>
                    <Select value={formData.assessmentMethod} onValueChange={(value: Skill['assessmentMethod']) => setFormData({...formData, assessmentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="peer-review">Peer Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="proficiencyRequired">Required Proficiency (%) *</Label>
                  <Input
                    id="proficiencyRequired"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.proficiencyRequired}
                    onChange={(e) => setFormData({...formData, proficiencyRequired: e.target.value})}
                    placeholder="70"
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit">Add Skill</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Skills List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => (
                <Card key={skill.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{skill.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                            {skill.level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssessmentColor(skill.assessmentMethod)}`}>
                            {skill.assessmentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm">{skill.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{skill.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Required:</span>
                        <span className="font-medium">{skill.proficiencyRequired}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assessed:</span>
                        <span className="font-medium">{skill.usersAssessed} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Avg Score:</span>
                        <span className="font-medium">{skill.averageScore}%</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Proficiency Progress</span>
                        <span className="font-medium">{skill.averageScore}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            skill.averageScore >= skill.proficiencyRequired ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(skill.averageScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {skill.usersAssessed > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {skill.averageScore >= skill.proficiencyRequired ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Meeting proficiency standards
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              Below proficiency standards
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No skills found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterCategory !== 'all' || filterLevel !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Get started by adding your first skill'}
                  </p>
                  <Button 
                    className="gap-2"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
