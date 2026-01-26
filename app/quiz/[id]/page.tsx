'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Flag,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  getAssessment, 
  submitAssessment, 
  getAssessmentSubmissions,
  type Assessment,
  type Question,
  type AssessmentSubmission
} from '@/lib/assessment-system'
import { getCurrentUser } from '@/lib/storage'

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; answer: string | string[] }[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string>('')
  const [showResults, setShowResults] = useState(false)
  const [submission, setSubmission] = useState<AssessmentSubmission | null>(null)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [reviewMode, setReviewMode] = useState(false)

  const resolvedParams = Promise.resolve(params).then(p => p.id)
  const assessmentId = resolvedParams.then(id => id)

  useEffect(() => {
    const initQuiz = async () => {
      const user = getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      const id = await assessmentId
      const assessmentData = getAssessment(id)
      
      if (!assessmentData) {
        router.push('/dashboard')
        return
      }

      setAssessment(assessmentData)
      
      // Initialize answers
      const initialAnswers = assessmentData.questions.map(q => ({
        questionId: q.id,
        answer: q.type === 'multiple-choice' ? '' : ''
      }))
      setAnswers(initialAnswers)

      // Set time limit
      if (assessmentData.settings.timeLimit) {
        setTimeLeft(assessmentData.settings.timeLimit * 60) // Convert to seconds
      }

      setStartTime(new Date().toISOString())
      setLoading(false)
    }

    initQuiz()
  }, [router, assessmentId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, answer } : a)
    )
  }

  const handleNext = () => {
    if (assessment && currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const toggleFlag = (index: number) => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(index)) {
      newFlagged.delete(index)
    } else {
      newFlagged.add(index)
    }
    setFlaggedQuestions(newFlagged)
  }

  const calculateScore = () => {
    if (!assessment) return { score: 0, maxScore: 0, percentage: 0, passed: false }

    let score = 0
    let maxScore = 0

    assessment.questions.forEach((question, index) => {
      maxScore += question.points
      const userAnswer = answers[index]?.answer
      
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          score += question.points
        }
      } else if (question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          score += question.points
        }
      } else if (question.type === 'short-answer') {
        // Simple string matching for short answers
        if (userAnswer && userAnswer.toString().toLowerCase().trim() === 
            question.correctAnswer.toString().toLowerCase().trim()) {
          score += question.points
        }
      }
      // Essay questions would need manual grading
    })

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    const passed = percentage >= assessment.settings.passingScore

    return { score, maxScore, percentage, passed }
  }

  const handleSubmit = async () => {
    if (!assessment || !currentUser) return

    const endTime = new Date().toISOString()
    const timeSpent = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))

    const { score, maxScore, percentage, passed } = calculateScore()

    // Get attempt number
    const previousSubmissions = getAssessmentSubmissions(assessment.id, currentUser.id)
    const attemptNumber = previousSubmissions.length + 1

    const submissionData: Omit<AssessmentSubmission, 'id' | 'submittedAt'> = {
      assessmentId: assessment.id,
      userId: currentUser.id,
      answers,
      score,
      maxScore,
      percentage,
      passed,
      timeSpent,
      startedAt: startTime,
      attemptNumber
    }

    const newSubmission = submitAssessment(submissionData)
    setSubmission(newSubmission)
    setShowResults(true)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Assessment not found</h3>
            <p className="text-muted-foreground mb-4">The assessment you're looking for doesn't exist</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (showResults && submission) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 overflow-auto ml-64">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border border-border">
                <div className="p-8 text-center">
                  <div className="mb-6">
                    {submission.passed ? (
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    ) : (
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    )}
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {submission.passed ? 'Congratulations!' : 'Assessment Completed'}
                    </h1>
                    <p className="text-muted-foreground">
                      {submission.passed 
                        ? 'You have successfully passed this assessment.' 
                        : 'You did not meet the passing score. Please review and try again.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{submission.score}/{submission.maxScore}</p>
                      <p className="text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{submission.percentage}%</p>
                      <p className="text-muted-foreground">Percentage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{submission.timeSpent}m</p>
                      <p className="text-muted-foreground">Time Spent</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push('/dashboard')}>
                      Back to Dashboard
                    </Button>
                    {assessment.settings.allowReview && (
                      <Button 
                        variant="outline" 
                        onClick={() => setReviewMode(true)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review Answers
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {reviewMode && (
                <Card className="bg-card border border-border mt-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Answer Review</h2>
                    <div className="space-y-6">
                      {assessment.questions.map((question, index) => {
                        const userAnswer = answers[index]?.answer
                        const isCorrect = userAnswer === question.correctAnswer
                        
                        return (
                          <div key={question.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {isCorrect ? '✓' : '✗'}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground mb-2">
                                  Question {index + 1} ({question.points} points)
                                </h3>
                                <p className="text-muted-foreground mb-3">{question.question}</p>
                                
                                {question.type === 'multiple-choice' && (
                                  <div className="space-y-2">
                                    {question.options?.map((option, optIndex) => (
                                      <div 
                                        key={optIndex}
                                        className={`p-2 rounded border ${
                                          option === question.correctAnswer 
                                            ? 'bg-green-50 border-green-200' 
                                            : option === userAnswer 
                                              ? 'bg-red-50 border-red-200'
                                              : 'bg-muted/30 border-border'
                                        }`}
                                      >
                                        {option}
                                        {option === question.correctAnswer && (
                                          <Badge className="ml-2 bg-green-100 text-green-800">Correct</Badge>
                                        )}
                                        {option === userAnswer && option !== question.correctAnswer && (
                                          <Badge className="ml-2 bg-red-100 text-red-800">Your Answer</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {question.explanation && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-blue-800">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const question = assessment.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{assessment.title}</h1>
              <p className="text-muted-foreground">Question {currentQuestion + 1} of {assessment.questions.length}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlag(currentQuestion)}
                className={`gap-2 ${flaggedQuestions.has(currentQuestion) ? 'bg-orange-100 text-orange-800' : ''}`}
              >
                <Flag className="h-4 w-4" />
                {flaggedQuestions.has(currentQuestion) ? 'Flagged' : 'Flag'}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question */}
            <div className="lg:col-span-3">
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline">{question.type}</Badge>
                      <span className="text-sm text-muted-foreground">{question.points} points</span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {question.question}
                    </h2>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {question.type === 'multiple-choice' && question.options?.map((option, index) => (
                      <label key={index} className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option}
                          checked={answers[currentQuestion]?.answer === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-foreground">{option}</span>
                      </label>
                    ))}

                    {question.type === 'true-false' && (
                      <>
                        <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value="true"
                            checked={answers[currentQuestion]?.answer === 'true'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-foreground">True</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value="false"
                            checked={answers[currentQuestion]?.answer === 'false'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-foreground">False</span>
                        </label>
                      </>
                    )}

                    {(question.type === 'short-answer' || question.type === 'essay') && (
                      <textarea
                        value={answers[currentQuestion]?.answer as string || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Enter your answer here..."
                        className="w-full p-4 border border-border rounded-lg resize-none"
                        rows={question.type === 'essay' ? 8 : 4}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Question Navigator */}
              <Card className="bg-card border border-border mb-6">
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Question Navigator</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {assessment.questions.map((_, index) => {
                      const isAnswered = answers[index]?.answer !== ''
                      const isFlagged = flaggedQuestions.has(index)
                      const isCurrent = index === currentQuestion
                      
                      return (
                        <button
                          key={index}
                          onClick={() => goToQuestion(index)}
                          className={`w-10 h-10 rounded-lg border-2 font-medium text-sm transition-colors ${
                            isCurrent 
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : isFlagged
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : isAnswered
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => {
                        const confirmed = window.confirm('Are you sure you want to reset your answers?')
                        if (confirmed) {
                          const resetAnswers = assessment.questions.map(q => ({
                            questionId: q.id,
                            answer: ''
                          }))
                          setAnswers(resetAnswers)
                        }
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Answers
                    </Button>
                    
                    <Button 
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={!answers[currentQuestion]?.answer}
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={currentQuestion === assessment.questions.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
