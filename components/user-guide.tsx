'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Info,
  BookOpen,
  Users,
  Award,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  Play,
  Target
} from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
  content?: React.ReactNode
  action?: string
  target?: string
}

interface Guide {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  steps: Step[]
  path: string
}

interface UserGuideProps {
  currentPath: string
  onComplete?: (guideId: string) => void
}

export function UserGuide({ currentPath, onComplete }: UserGuideProps) {
  const [showGuide, setShowGuide] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedGuides, setCompletedGuides] = useState<string[]>([])
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null)

  const guides: Guide[] = [
    {
      id: 'courses',
      title: 'Courses Overview',
      description: 'Learn how to navigate and use the courses section',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/courses',
      steps: [
        {
          id: 'courses-1',
          title: 'Browse Available Courses',
          description: 'Explore the catalog of courses available to you. Each course shows its title, description, difficulty level, and progress.',
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Beginner</Badge>
                <span>Difficulty levels help you choose appropriate courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Progress</Badge>
                <span>Track your completion status for each course</span>
              </div>
            </div>
          ),
          action: 'Browse through the course catalog to see available options'
        },
        {
          id: 'courses-2',
          title: 'Enroll in a Course',
          description: 'Click on any course to view details and enroll. You can see the curriculum, instructor info, and requirements.',
          content: (
            <div className="space-y-3">
              <p>When you click on a course, you'll see:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Course curriculum and lesson structure</li>
                <li>Instructor information and credentials</li>
                <li>Prerequisites and requirements</li>
                <li>Estimated completion time</li>
                <li>Available badges and certificates</li>
              </ul>
            </div>
          ),
          action: 'Click on any course card to view detailed information'
        },
        {
          id: 'courses-3',
          title: 'Track Your Progress',
          description: 'Monitor your learning journey with progress bars, completion percentages, and achievement badges.',
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Progress value={65} className="flex-1" />
                <span className="text-sm">65%</span>
              </div>
              <p className="text-sm">Your progress is automatically saved as you complete lessons and activities.</p>
            </div>
          ),
          action: 'Check your progress regularly to stay motivated'
        }
      ]
    },
    {
      id: 'team',
      title: 'Team Collaboration',
      description: 'Understand team features and collaboration tools',
      icon: <Users className="h-5 w-5" />,
      path: '/team',
      steps: [
        {
          id: 'team-1',
          title: 'View Team Members',
          description: 'See all team members, their roles, departments, and current status. Filter by department or search for specific members.',
          content: (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Away</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>In Meeting</span>
                </div>
              </div>
            </div>
          ),
          action: 'Explore team member profiles and their current status'
        },
        {
          id: 'team-2',
          title: 'Department Organization',
          description: 'Navigate through different departments to understand team structure and reporting lines.',
          content: (
            <div className="space-y-3">
              <p>Departments help organize teams by function:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Engineering - Technical development teams</li>
                <li>Marketing - Brand and marketing teams</li>
                <li>Sales - Revenue and customer teams</li>
                <li>HR - People and culture teams</li>
                <li>Training - Learning and development teams</li>
              </ul>
            </div>
          ),
          action: 'Click on department tabs to filter team members'
        }
      ]
    },
    {
      id: 'badges',
      title: 'Achievements & Badges',
      description: 'Learn about the badge system and how to earn achievements',
      icon: <Award className="h-5 w-5" />,
      path: '/badges',
      steps: [
        {
          id: 'badges-1',
          title: 'Badge Categories',
          description: 'Discover different types of badges: Learning, Performance, Collaboration, and Special achievements.',
          content: (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded">
                  <div className="font-medium text-sm">📚 Learning</div>
                  <div className="text-xs">Course completions</div>
                </div>
                <div className="p-2 border rounded">
                  <div className="font-medium text-sm">⭐ Performance</div>
                  <div className="text-xs">High scores</div>
                </div>
                <div className="p-2 border rounded">
                  <div className="font-medium text-sm">🤝 Collaboration</div>
                  <div className="text-xs">Team activities</div>
                </div>
                <div className="p-2 border rounded">
                  <div className="font-medium text-sm">🏆 Special</div>
                  <div className="text-xs">Unique achievements</div>
                </div>
              </div>
            </div>
          ),
          action: 'Explore different badge categories and their requirements'
        },
        {
          id: 'badges-2',
          title: 'Earn Points',
          description: 'Understand how points are calculated and how they contribute to your overall ranking.',
          content: (
            <div className="space-y-3">
              <p>Points are earned through:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Course completion: 50-200 points</li>
                <li>Assessment scores: 10-100 points</li>
                <li>Daily login: 5 points</li>
                <li>Team collaboration: 15-50 points</li>
                <li>Special achievements: 25-500 points</li>
              </ul>
            </div>
          ),
          action: 'Check your points total and ranking on the leaderboard'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      description: 'Master the communication tools and messaging system',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/communication',
      steps: [
        {
          id: 'communication-1',
          title: 'Message Inbox',
          description: 'Manage your messages, announcements, and notifications. Mark important messages and organize your inbox.',
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default">New</Badge>
                <span className="text-sm">Unread messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Important</Badge>
                <span className="text-sm">Priority announcements</span>
              </div>
            </div>
          ),
          action: 'Check your inbox for new messages and announcements'
        },
        {
          id: 'communication-2',
          title: 'Send Messages',
          description: 'Compose and send messages to individuals, teams, or entire departments. Use templates for common communications.',
          content: (
            <div className="space-y-3">
              <p>Message types:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Direct messages to individuals</li>
                <li>Team announcements</li>
                <li>Department-wide communications</li>
                <li>Meeting invitations and reminders</li>
              </ul>
            </div>
          ),
          action: 'Try composing a message to a team member'
        }
      ]
    },
    {
      id: 'meetings',
      title: 'Meeting Management',
      description: 'Schedule, join, and manage meetings with screen recording capabilities',
      icon: <Calendar className="h-5 w-5" />,
      path: '/meetings',
      steps: [
        {
          id: 'meetings-1',
          title: 'Schedule Meetings',
          description: 'Create new meetings, invite participants, set agendas, and configure meeting settings.',
          content: (
            <div className="space-y-3">
              <p>Meeting setup includes:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Title and description</li>
                <li>Date, time, and duration</li>
                <li>Participant invitations</li>
                <li>Meeting agenda and topics</li>
                <li>Recording preferences</li>
              </ul>
            </div>
          ),
          action: 'Create a new meeting to test the scheduling system'
        },
        {
          id: 'meetings-2',
          title: 'Screen Recording',
          description: 'Record meetings for future reference. Capture screen, audio, and video for comprehensive documentation.',
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording indicator</span>
              </div>
              <p className="text-sm">Recordings are automatically saved and can be downloaded after the meeting.</p>
            </div>
          ),
          action: 'Test the screen recording feature in a practice meeting'
        }
      ]
    }
  ]

  useEffect(() => {
    // Load completed guides from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completed_guides')
      if (saved) {
        setCompletedGuides(JSON.parse(saved))
      }
    }
  }, [])

  useEffect(() => {
    // Find current guide based on path
    const guide = guides.find(g => currentPath.includes(g.path))
    if (guide && !completedGuides.includes(guide.id)) {
      setCurrentGuide(guide)
      setShowGuide(true)
      setCurrentStep(0)
    }
  }, [currentPath, completedGuides])

  const handleNext = () => {
    if (currentGuide && currentStep < currentGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else if (currentGuide) {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (currentGuide) {
      const newCompleted = [...completedGuides, currentGuide.id]
      setCompletedGuides(newCompleted)
      localStorage.setItem('completed_guides', JSON.stringify(newCompleted))
      onComplete?.(currentGuide.id)
      setShowGuide(false)
      setCurrentGuide(null)
      setCurrentStep(0)
    }
  }

  const handleSkip = () => {
    setShowGuide(false)
    setCurrentGuide(null)
    setCurrentStep(0)
  }

  const restartGuide = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId)
    if (guide) {
      setCurrentGuide(guide)
      setShowGuide(true)
      setCurrentStep(0)
    }
  }

  if (!showGuide || !currentGuide) return null

  const currentStepData = currentGuide.steps[currentStep]
  const progress = ((currentStep + 1) / currentGuide.steps.length) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {currentGuide.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentGuide.title}</h2>
                <p className="text-sm text-muted-foreground">{currentGuide.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStep + 1} of {currentGuide.steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
            
            {currentStepData.content && (
              <div className="p-4 bg-muted/50 rounded-lg">
                {currentStepData.content}
              </div>
            )}
            
            {currentStepData.action && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Action Step:</p>
                    <p className="text-sm text-blue-700">{currentStepData.action}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentGuide.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={handleNext}>
              {currentStep === currentGuide.steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Help Button Component
export function HelpButton() {
  const [showMenu, setShowMenu] = useState(false)

  const quickGuides = [
    { id: 'courses', title: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'team', title: 'Team', icon: <Users className="h-4 w-4" /> },
    { id: 'badges', title: 'Badges', icon: <Award className="h-4 w-4" /> },
    { id: 'communication', title: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'meetings', title: 'Meetings', icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showMenu && (
        <Card className="absolute bottom-16 right-0 p-4 w-64">
          <h4 className="font-semibold mb-3">Quick Guides</h4>
          <div className="space-y-2">
            {quickGuides.map((guide) => (
              <Button
                key={guide.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  window.location.href = `/${guide.id}`
                  setShowMenu(false)
                }}
              >
                {guide.icon}
                <span className="ml-2">{guide.title}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}
      
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg"
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
