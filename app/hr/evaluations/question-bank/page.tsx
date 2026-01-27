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
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  BookOpen,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface Question {
  id: string
  questionText: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  options?: string[]
  correctAnswer: string
  explanation?: string
  createdAt: string
}

export default function HREvaluationsQuestionBank() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    questionText: '',
    type: 'multiple-choice' as Question['type'],
    category: '',
    difficulty: 'medium' as Question['difficulty'],
    points: '10',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
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
    // Load questions from localStorage or create demo data
    const savedQuestions = localStorage.getItem('qedge_questions')
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    } else {
      const demoQuestions: Question[] = [
        {
          id: '1',
          questionText: 'What is the primary purpose of React hooks?',
          type: 'multiple-choice',
          category: 'React',
          difficulty: 'medium',
          points: 10,
          options: [
            'To style components',
            'To manage state and side effects',
            'To create routes',
            'To handle HTTP requests'
          ],
          correctAnswer: 'To manage state and side effects',
          explanation: 'React hooks allow functional components to use state and lifecycle features.',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          questionText: 'JavaScript is a statically typed language.',
          type: 'true-false',
          category: 'JavaScript',
          difficulty: 'easy',
          points: 5,
          correctAnswer: 'false',
          explanation: 'JavaScript is a dynamically typed language, not statically typed.',
          createdAt: '2024-01-16T14:30:00Z'
        },
        {
          id: '3',
          questionText: 'Explain the concept of closure in JavaScript.',
          type: 'short-answer',
          category: 'JavaScript',
          difficulty: 'hard',
          points: 15,
          correctAnswer: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned.',
          explanation: 'Closures allow functions to maintain access to their lexical scope.',
          createdAt: '2024-01-17T09:15:00Z'
        }
      ]
      setQuestions(demoQuestions)
      localStorage.setItem('qedge_questions', JSON.stringify(demoQuestions))
    }
    setLoading(false)
  }

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: formData.questionText,
      type: formData.type,
      category: formData.category,
      difficulty: formData.difficulty,
      points: parseInt(formData.points),
      options: formData.type === 'multiple-choice' ? formData.options.filter(opt => opt.trim() !== '') : undefined,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation,
      createdAt: new Date().toISOString()
    }
    
    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    localStorage.setItem('qedge_questions', JSON.stringify(updatedQuestions))
    
    setFormData({
      questionText: '',
      type: 'multiple-choice',
      category: '',
      difficulty: 'medium',
      points: '10',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    })
    setShowCreateForm(false)
  }

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== id)
      setQuestions(updatedQuestions)
      localStorage.setItem('qedge_questions', JSON.stringify(updatedQuestions))
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'multiple-choice': return 'bg-blue-100 text-blue-800'
      case 'true-false': return 'bg-purple-100 text-purple-800'
      case 'short-answer': return 'bg-orange-100 text-orange-800'
      case 'essay': return 'bg-pink-100 text-pink-800'
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
              <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
              <p className="text-muted-foreground mt-2">
                Manage your assessment questions database
              </p>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{questions.length}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {[...new Set(questions.map(q => q.category))].length}
                  </p>
                </div>
                <Tag className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Points</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.points, 0) / questions.length) : 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hard Questions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {questions.filter(q => q.difficulty === 'hard').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
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
              {[...new Set(questions.map(q => q.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Create Question Form */}
          {showCreateForm && (
            <Card className="p-6 mb-8 bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Add New Question</h3>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                    placeholder="Enter your question"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Question Type *</Label>
                    <Select value={formData.type} onValueChange={(value: Question['type']) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., JavaScript, React"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <Select value={formData.difficulty} onValueChange={(value: Question['difficulty']) => setFormData({...formData, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">Points *</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                      placeholder="10"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer *</Label>
                    <Input
                      id="correctAnswer"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                      placeholder="Enter correct answer"
                      required
                    />
                  </div>
                </div>
                
                {formData.type === 'multiple-choice' && (
                  <div>
                    <Label>Options *</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.options]
                            newOptions[index] = e.target.value
                            setFormData({...formData, options: newOptions})
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Explain why this is the correct answer"
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit">Add Question</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{question.questionText}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                          {question.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      
                      {question.options && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Options:</p>
                          <div className="space-y-1">
                            {question.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                {option === question.correctAnswer && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{question.category}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Points:</span>
                          <span className="font-medium">{question.points}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
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
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No questions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first question'}
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
