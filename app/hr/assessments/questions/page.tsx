'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  EyeOff,
  Download,
  Upload,
  Tag,
  BookOpen,
  Brain,
  FileText,
  HelpCircle,
  Star,
  Clock
} from 'lucide-react'
import { getAssessments, type Question } from '@/lib/assessment-system'
import { getCurrentUser } from '@/lib/storage'

interface QuestionBankItem extends Question {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  usageCount: number;
  createdAt: string;
  createdBy: string;
}

export default function QuestionBankPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [questions, setQuestions] = useState<QuestionBankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [formData, setFormData] = useState({
    type: 'multiple-choice' as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    explanation: '',
    category: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    tags: [] as string[]
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    loadQuestions()
    setLoading(false)
  }, [router])

  const loadQuestions = () => {
    // Get questions from assessments and create a question bank
    const assessments = getAssessments()
    const questionBank: QuestionBankItem[] = []
    
    assessments.forEach(assessment => {
      assessment.questions.forEach((question, index) => {
        const existingQuestion = questionBank.find(q => q.question === question.question)
        if (!existingQuestion) {
          questionBank.push({
            ...question,
            id: `qb-${Date.now()}-${index}`,
            category: 'General',
            difficulty: 'Medium',
            tags: [],
            usageCount: 1,
            createdAt: assessment.createdAt,
            createdBy: assessment.createdBy
          })
        } else {
          existingQuestion.usageCount++
        }
      })
    })

    // Add some sample questions if empty
    if (questionBank.length === 0) {
      questionBank.push(
        {
          id: 'sample-1',
          type: 'multiple-choice',
          question: 'What is the primary purpose of a Learning Management System?',
          options: [
            'To manage employee payroll',
            'To deliver and track training and educational content',
            'To handle customer relationships',
            'To schedule meetings'
          ],
          correctAnswer: 'To deliver and track training and educational content',
          points: 1,
          explanation: 'LMS is specifically designed to manage, deliver, and track educational content and training programs.',
          category: 'LMS Basics',
          difficulty: 'Easy',
          tags: ['LMS', 'Basics', 'Training'],
          usageCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.id || ''
        },
        {
          id: 'sample-2',
          type: 'true-false',
          question: 'Blended learning combines online educational materials with traditional classroom methods.',
          correctAnswer: 'true',
          points: 1,
          explanation: 'Blended learning is an educational approach that combines online digital media with traditional classroom methods.',
          category: 'Learning Methods',
          difficulty: 'Easy',
          tags: ['Learning', 'Blended', 'Education'],
          usageCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.id || ''
        },
        {
          id: 'sample-3',
          type: 'short-answer',
          question: 'What is the difference between formative and summative assessment?',
          correctAnswer: 'Formative assessment monitors learning progress during instruction, while summative assessment evaluates learning at the end of an instructional unit.',
          points: 2,
          explanation: 'Formative is ongoing and diagnostic, summative is final and evaluative.',
          category: 'Assessment',
          difficulty: 'Medium',
          tags: ['Assessment', 'Evaluation', 'Learning'],
          usageCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.id || ''
        }
      )
    }

    setQuestions(questionBank)
  }

  const handleCreateQuestion = () => {
    if (!formData.question.trim()) return

    const newQuestion: QuestionBankItem = {
      id: Date.now().toString(),
      type: formData.type,
      question: formData.question,
      options: formData.type === 'multiple-choice' ? formData.options.filter(o => o.trim()) : undefined,
      correctAnswer: formData.correctAnswer,
      points: formData.points,
      explanation: formData.explanation,
      category: formData.category || 'General',
      difficulty: formData.difficulty,
      tags: formData.tags,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || ''
    }

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...newQuestion, id: editingQuestion.id } : q))
    } else {
      setQuestions(prev => [...prev, newQuestion])
    }

    resetForm()
  }

  const handleEditQuestion = (question: QuestionBankItem) => {
    setEditingQuestion(question)
    setFormData({
      type: question.type,
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer as string,
      points: question.points,
      explanation: question.explanation || '',
      category: question.category,
      difficulty: question.difficulty,
      tags: question.tags
    })
    setShowCreateForm(true)
  }

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  const handleDuplicateQuestion = (question: QuestionBankItem) => {
    const duplicated = {
      ...question,
      id: Date.now().toString(),
      question: question.question + ' (Copy)',
      usageCount: 0,
      createdAt: new Date().toISOString()
    }
    setQuestions(prev => [...prev, duplicated])
  }

  const resetForm = () => {
    setFormData({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      explanation: '',
      category: '',
      difficulty: 'Medium',
      tags: []
    })
    setEditingQuestion(null)
    setShowCreateForm(false)
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [...new Set(questions.map(q => q.category))]
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return HelpCircle
      case 'true-false': return FileText
      case 'short-answer': return Brain
      case 'essay': return BookOpen
      default: return HelpCircle
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
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
              <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
              <p className="text-muted-foreground mt-2">Manage and organize your assessment questions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
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
                  <p className="text-2xl font-bold text-foreground mt-1">{categories.length}</p>
                </div>
                <Tag className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Usage</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.usageCount, 0) / questions.length) : 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground mt-1">12</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>

          {/* Questions Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuestions.map((question) => {
                const TypeIcon = getTypeIcon(question.type)
                return (
                  <Card key={question.id} className="bg-card border border-border">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDuplicateQuestion(question)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-foreground mb-2 line-clamp-3">
                        {question.question}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{question.points} pts</span>
                        <span>{question.usageCount} uses</span>
                      </div>

                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const TypeIcon = getTypeIcon(question.type)
                return (
                  <Card key={question.id} className="bg-card border border-border">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{question.type}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.category}</Badge>
                            <span className="text-sm text-muted-foreground">{question.points} points</span>
                            <span className="text-sm text-muted-foreground">{question.usageCount} uses</span>
                          </div>
                          
                          <h3 className="font-medium text-foreground mb-3">{question.question}</h3>
                          
                          {question.type === 'multiple-choice' && question.options && (
                            <div className="space-y-2 mb-3">
                              {question.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                  <span className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                    {option}
                                  </span>
                                  {option === question.correctAnswer && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Correct</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {question.explanation && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}

                          {question.tags.length > 0 && (
                            <div className="flex gap-2">
                              {question.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDuplicateQuestion(question)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {filteredQuestions.length === 0 && (
            <Card className="bg-card border border-border">
              <div className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No questions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start building your question bank'}
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </Card>
          )}

          {/* Create/Edit Question Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {editingQuestion ? 'Edit Question' : 'Create Question'}
                    </h2>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Question Type</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          value={formData.points}
                          onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 1})}
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="question">Question *</Label>
                      <Textarea
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </div>

                    {formData.type === 'multiple-choice' && (
                      <div>
                        <Label>Answer Options</Label>
                        <div className="space-y-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...formData.options]
                                  newOptions[index] = e.target.value
                                  setFormData({...formData, options: newOptions})
                                }}
                                placeholder={`Option ${index + 1}`}
                              />
                              <input
                                type="radio"
                                name="correct"
                                checked={formData.correctAnswer === option}
                                onChange={() => setFormData({...formData, correctAnswer: option})}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.type === 'true-false' && (
                      <div>
                        <Label>Correct Answer</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="tf-correct"
                              checked={formData.correctAnswer === 'true'}
                              onChange={() => setFormData({...formData, correctAnswer: 'true'})}
                            />
                            True
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="tf-correct"
                              checked={formData.correctAnswer === 'false'}
                              onChange={() => setFormData({...formData, correctAnswer: 'false'})}
                            />
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {(formData.type === 'short-answer' || formData.type === 'essay') && (
                      <div>
                        <Label htmlFor="correctAnswer">Correct Answer / Grading Criteria</Label>
                        <Textarea
                          id="correctAnswer"
                          value={formData.correctAnswer}
                          onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                          placeholder="Enter the correct answer or grading criteria"
                          rows={2}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="e.g., Mathematics, Science, etc."
                        />
                      </div>

                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <select
                          id="difficulty"
                          value={formData.difficulty}
                          onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea
                        id="explanation"
                        value={formData.explanation}
                        onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                        placeholder="Provide an explanation for the correct answer"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateQuestion}>
                      {editingQuestion ? 'Update Question' : 'Create Question'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  )
}
