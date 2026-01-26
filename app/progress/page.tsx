'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen,
  Calendar,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import { getCurrentUser, getCourses, getActivities } from '@/lib/storage'
import { getCourseProgress, getUserProgressStats, type CourseProgress } from '@/lib/progress-tracking'
import type { Course, Activity } from '@/lib/storage'

export default function ProgressPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    const allCourses = getCourses()
    setCourses(allCourses)
    setActivities(getActivities())
    
    // Load course progress for this user
    const userAssignedCourses = allCourses.filter(course => 
      course.assignedTo.includes(user.id)
    )
    
    const userProgress: CourseProgress[] = []
    userAssignedCourses.forEach(course => {
      const progress = getCourseProgress(course.id, user.id)
      if (progress) {
        userProgress.push(progress)
      }
    })
    setCourseProgress(userProgress)
    
    setLoading(false)
  }, [router])

  const assignedCourses = courses.filter(course => 
    course.assignedTo.includes(currentUser?.id || '')
  )

  const calculateOverallProgress = () => {
    if (courseProgress.length === 0) return 0
    const totalProgress = courseProgress.reduce((sum, progress) => sum + progress.overallProgress, 0)
    return Math.floor(totalProgress / courseProgress.length)
  }

  const getRecentActivities = () => {
    return activities
      .filter(activity => activity.userId === currentUser?.id)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  const overallProgress = calculateOverallProgress()
  const recentActivities = getRecentActivities()

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
            <p className="text-muted-foreground mt-2">Track your learning journey and achievements</p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{overallProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{assignedCourses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {Math.floor((courseProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 60))}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{currentUser?.badges?.length || 0}</p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Progress */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Course Progress</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {assignedCourses.map((course) => {
                      const progress = courseProgress.find(p => p.courseId === course.id)
                      const progressPercentage = progress?.overallProgress || 0
                      const completedLessons = progress?.completedLessons.length || 0
                      
                      return (
                        <div key={course.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-foreground">{course.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {completedLessons} of {course.lessons.length} lessons completed
                              </p>
                            </div>
                            <span className="text-sm font-medium text-foreground">{progressPercentage}%</span>
                          </div>
                          
                          <Progress value={progressPercentage} className="h-2 mb-3" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{course.points} points</span>
                              <span>{progress?.timeSpent || 0}min spent</span>
                              <span>{course.duration || '2h'}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/courses/${course.id}`)}
                              className="gap-2"
                            >
                              Continue
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {assignedCourses.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No courses enrolled</h3>
                      <p className="text-muted-foreground mb-4">Start your learning journey by enrolling in courses</p>
                      <Button onClick={() => router.push('/courses')}>
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{activity.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No recent activity</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Achievement Progress */}
              <Card className="bg-card border border-border mt-6">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Achievement Progress</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">First Course</span>
                      <span className="text-sm font-medium text-green-600">✓ Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Week Streak</span>
                      <span className="text-sm font-medium">3/7 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Course Master</span>
                      <span className="text-sm font-medium">2/5 courses</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
