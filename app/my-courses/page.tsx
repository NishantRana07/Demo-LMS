'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Target, Clock, Play, Award } from 'lucide-react'
import { getCurrentUser, getCourses } from '@/lib/storage'
import type { Course } from '@/lib/storage'

export default function MyCoursesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setCourses(getCourses())
    setLoading(false)
  }, [router])

  const assignedCourses = courses.filter(course => 
    course.assignedTo.includes(currentUser?.id || '')
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
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
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-2">Track your progress and continue learning</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{assignedCourses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{currentUser?.progress || 0}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{currentUser?.badges?.length || 0}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Assigned Courses */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Enrolled Courses</h2>
            
            {assignedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignedCourses.map((course) => {
                  const progress = Math.floor(Math.random() * 100) // Mock progress
                  
                  return (
                    <Card key={course.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-32 bg-gradient-to-r from-green-500 to-blue-600 p-4">
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white">
                              {course.points} pts
                            </span>
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white">
                              {course.lessons.length} lessons
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{course.duration || '2h'}</span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => router.push(`/courses/${course.id}`)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              {progress > 0 ? 'Continue' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-card border border-border">
                <div className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses enrolled yet</h3>
                  <p className="text-muted-foreground mb-4">Browse available courses and start your learning journey</p>
                  <Button onClick={() => router.push('/courses')}>
                    Browse Courses
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
