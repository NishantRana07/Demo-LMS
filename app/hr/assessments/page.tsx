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
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Clock, 
  Users, 
  FileText,
  Copy,
  Download,
  Play,
  Settings,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  getAssessments, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment, 
  getAssessmentStats,
  type Assessment,
  type Question
} from '@/lib/assessment-system'
import { getCurrentUser, getCourses } from '@/lib/storage'

export default function HRAssessmentsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showStats, setShowStats] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'exam' | 'assignment' | 'survey',
    courseId: '',
    timeLimit: 60,
    attemptsAllowed: 3,
    passingScore: 70,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: true,
    showCorrectAnswers: true,
    allowReview: true,
    tags: [] as string[]
  })

  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setAssessments(getAssessments())
    setCourses(getCourses())
    setLoading(false)
  }, [router])

  const handleCreateAssessment = () => {
    if (!formData.title.trim()) return

    const assessmentData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      courseId: formData.courseId || undefined,
      questions,
      settings: {
        timeLimit: formData.timeLimit,
        attemptsAllowed: formData.attemptsAllowed,
        passingScore: formData.passingScore,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
        showResults: formData.showResults,
        showCorrectAnswers: formData.showCorrectAnswers,
        allowReview: formData.allowReview
      },
      createdBy: currentUser?.id || '',
      isActive: true,
      tags: formData.tags
    }

    if (editingAssessment) {
      updateAssessment(editingAssessment.id, assessmentData)
    } else {
      createAssessment(assessmentData)
    }

    setAssessments(getAssessments())
    resetForm()
  }

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment)
    setFormData({
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      courseId: assessment.courseId || '',
      timeLimit: assessment.settings.timeLimit || 60,
      attemptsAllowed: assessment.settings.attemptsAllowed,
      passingScore: assessment.settings.passingScore,
      shuffleQuestions: assessment.settings.shuffleQuestions,
      shuffleOptions: assessment.settings.shuffleOptions,
      showResults: assessment.settings.showResults,
      showCorrectAnswers: assessment.settings.showCorrectAnswers,
      allowReview: assessment.settings.allowReview,
      tags: assessment.tags
    })
    setQuestions(assessment.questions)
    setShowCreateForm(true)
  }

  const handleDeleteAssessment = (id: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      deleteAssessment(id)
      setAssessments(getAssessments())
    }
  }

  const handleDuplicateAssessment = (assessment: Assessment) => {
    const duplicated = {
      ...assessment,
      title: `${assessment.title} (Copy)`,
      courseId: assessment.courseId,
      questions: assessment.questions,
      settings: assessment.settings,
      createdBy: currentUser?.id || '',
      tags: assessment.tags,
      isActive: true
    }
    createAssessment(duplicated)
    setAssessments(getAssessments())
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'quiz',
      courseId: '',
      timeLimit: 60,
      attemptsAllowed: 3,
      passingScore: 70,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: true,
      allowReview: true,
      tags: []
    })
    setQuestions([])
    setEditingAssessment(null)
    setShowCreateForm(false)
  }

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStats = (assessmentId: string) => {
    return getAssessmentStats(assessmentId)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'exam': return 'bg-red-100 text-red-800'
      case 'assignment': return 'bg-green-100 text-green-800'
      case 'survey': return 'bg-purple-100 text-purple-800'
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <HRSidebar userName={currentUser?.name || ''} />
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
              <p className="text-muted-foreground mt-2">Create and manage quizzes, exams, and assignments</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Assessment
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{assessments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Quizzes</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {assessments.filter(a => a.type === 'quiz' && a.isActive).length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {assessments.reduce((sum, a) => sum + getStats(a.id).totalSubmissions, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {assessments.length > 0 
                      ? Math.round(assessments.reduce((sum, a) => sum + getStats(a.id).passRate, 0) / assessments.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => {
              const stats = getStats(assessment.id)
              return (
                <Card key={assessment.id} className="bg-card border border-border">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
                          <Badge className={getTypeColor(assessment.type)}>
                            {assessment.type}
                          </Badge>
                          {assessment.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{assessment.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{assessment.questions.length} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{assessment.settings.timeLimit || 'No limit'} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{stats.totalSubmissions} submissions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{stats.averageScore}% avg score</span>
                          </div>
                        </div>

                        {assessment.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {assessment.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedAssessment(assessment)
                            setShowStats(true)
                          }}
                          className="gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Stats
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAssessment(assessment)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDuplicateAssessment(assessment)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}

            {filteredAssessments.length === 0 && (
              <Card className="bg-card border border-border">
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No assessments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first assessment to get started'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Assessment
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Create/Edit Assessment Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {editingAssessment ? 'Edit Assessment' : 'Create Assessment'}
                    </h2>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Basic Information */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Enter assessment title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter assessment description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="quiz">Quiz</option>
                          <option value="exam">Exam</option>
                          <option value="assignment">Assignment</option>
                          <option value="survey">Survey</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="courseId">Course (Optional)</Label>
                        <select
                          id="courseId"
                          value={formData.courseId}
                          onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          value={formData.timeLimit}
                          onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="attemptsAllowed">Attempts Allowed</Label>
                        <Input
                          id="attemptsAllowed"
                          type="number"
                          value={formData.attemptsAllowed}
                          onChange={(e) => setFormData({...formData, attemptsAllowed: parseInt(e.target.value) || 1})}
                          min="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          value={formData.passingScore}
                          onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value) || 0})}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="shuffleQuestions"
                          checked={formData.shuffleQuestions}
                          onCheckedChange={(checked) => setFormData({...formData, shuffleQuestions: checked})}
                        />
                        <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="shuffleOptions"
                          checked={formData.shuffleOptions}
                          onCheckedChange={(checked) => setFormData({...formData, shuffleOptions: checked})}
                        />
                        <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showResults"
                          checked={formData.showResults}
                          onCheckedChange={(checked) => setFormData({...formData, showResults: checked})}
                        />
                        <Label htmlFor="showResults">Show Results</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showCorrectAnswers"
                          checked={formData.showCorrectAnswers}
                          onCheckedChange={(checked) => setFormData({...formData, showCorrectAnswers: checked})}
                        />
                        <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Questions</h3>
                      <Button onClick={addQuestion} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id} className="p-4 bg-card border border-border">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-foreground">Question {index + 1}</span>
                                <select
                                  value={question.type}
                                  onChange={(e) => updateQuestion(index, { type: e.target.value as any })}
                                  className="px-2 py-1 border border-border rounded text-sm bg-background"
                                >
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="true-false">True/False</option>
                                  <option value="short-answer">Short Answer</option>
                                  <option value="essay">Essay</option>
                                </select>
                                <Input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                                  placeholder="Points"
                                  className="w-20 h-8 text-sm"
                                  min="1"
                                />
                              </div>
                              
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                                placeholder="Enter your question"
                                className="mb-3"
                                rows={2}
                              />

                              {question.type === 'multiple-choice' && (
                                <div className="space-y-2">
                                  {question.options?.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options || [])]
                                          newOptions[optIndex] = e.target.value
                                          updateQuestion(index, { options: newOptions })
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1"
                                      />
                                      <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={question.correctAnswer === option}
                                        onChange={() => updateQuestion(index, { correctAnswer: option })}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === 'true-false' && (
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`tf-${index}`}
                                      checked={question.correctAnswer === 'true'}
                                      onChange={() => updateQuestion(index, { correctAnswer: 'true' })}
                                    />
                                    True
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`tf-${index}`}
                                      checked={question.correctAnswer === 'false'}
                                      onChange={() => updateQuestion(index, { correctAnswer: 'false' })}
                                    />
                                    False
                                  </label>
                                </div>
                              )}

                              {(question.type === 'short-answer' || question.type === 'essay') && (
                                <Textarea
                                  value={question.correctAnswer as string}
                                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                                  placeholder="Enter correct answer or grading criteria"
                                  rows={2}
                                />
                              )}
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssessment}>
                      {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Modal */}
          {showStats && selectedAssessment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedAssessment.title} - Statistics</h2>
                      <p className="text-muted-foreground">Performance analytics and insights</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowStats(false)}>
                      Close
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {(() => {
                    const stats = getStats(selectedAssessment.id)
                    return (
                      <div className="space-y-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="p-4 bg-card border border-border">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-foreground">{stats.totalSubmissions}</p>
                              <p className="text-sm text-muted-foreground">Total Submissions</p>
                            </div>
                          </Card>
                          <Card className="p-4 bg-card border border-border">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                              <p className="text-sm text-muted-foreground">Average Score</p>
                            </div>
                          </Card>
                          <Card className="p-4 bg-card border border-border">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-foreground">{stats.passRate}%</p>
                              <p className="text-sm text-muted-foreground">Pass Rate</p>
                            </div>
                          </Card>
                          <Card className="p-4 bg-card border border-border">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-foreground">{stats.averageTime}m</p>
                              <p className="text-sm text-muted-foreground">Avg Time</p>
                            </div>
                          </Card>
                        </div>

                        {/* Score Distribution */}
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-4">Score Distribution</h3>
                          <div className="space-y-3">
                            {stats.scoreDistribution.map((range, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground w-12">{range.range}</span>
                                <div className="flex-1">
                                  <Progress 
                                    value={stats.totalSubmissions > 0 ? (range.count / stats.totalSubmissions) * 100 : 0} 
                                    className="h-6"
                                  />
                                </div>
                                <span className="text-sm text-foreground w-8 text-right">{range.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
