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
    
    // Get courses and add sample assigned courses if none exist
    const allCourses = getCourses()
    
    // If no courses are assigned to current user, add sample data
    const hasAssignedCourses = allCourses.some(course => 
      course.assignedTo.includes(user.id)
    )
    
    if (!hasAssignedCourses) {
      // Create sample assigned courses for the current user
      const sampleAssignedCourses = [
        {
          id: 'sample-1',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming including variables, functions, and control structures.',
          createdBy: 'hr@company.com',
          createdAt: new Date().toISOString(),
          category: 'Programming',
          points: 100,
          duration: 270, // 4h 30m in minutes
          lessons: [
            { 
              id: '1', 
              courseId: 'sample-1',
              title: 'Introduction to JavaScript', 
              content: 'Learn the basics of JavaScript programming', 
              type: 'video' as const,
              duration: 45, 
              completed: true, 
              order: 1 
            },
            { 
              id: '2', 
              courseId: 'sample-1',
              title: 'Variables and Data Types', 
              content: 'Understanding variables and data types in JavaScript', 
              type: 'video' as const,
              duration: 30, 
              completed: true, 
              order: 2 
            },
            { 
              id: '3', 
              courseId: 'sample-1',
              title: 'Functions and Scope', 
              content: 'Deep dive into JavaScript functions and scope', 
              type: 'video' as const,
              duration: 60, 
              completed: false, 
              order: 3 
            },
            { 
              id: '4', 
              courseId: 'sample-1',
              title: 'Control Structures', 
              content: 'Learn about if statements, loops, and control flow', 
              type: 'video' as const,
              duration: 45, 
              completed: false, 
              order: 4 
            },
            { 
              id: '5', 
              courseId: 'sample-1',
              title: 'Arrays and Objects', 
              content: 'Working with arrays and objects in JavaScript', 
              type: 'video' as const,
              duration: 90, 
              completed: false, 
              order: 5 
            }
          ],
          assignedTo: [user.id],
          instructor: { name: 'John Smith', title: 'Senior Developer', bio: 'JavaScript expert with 10+ years experience' },
          difficulty: 'beginner' as const
        },
        {
          id: 'sample-2',
          title: 'React Development',
          description: 'Master React.js from basics to advanced concepts including hooks, state management, and routing.',
          createdBy: 'hr@company.com',
          createdAt: new Date().toISOString(),
          category: 'Web Development',
          points: 150,
          duration: 375, // 6h 15m in minutes
          lessons: [
            { 
              id: '1', 
              courseId: 'sample-2',
              title: 'React Basics', 
              content: 'Introduction to React and its core concepts', 
              type: 'video' as const,
              duration: 60, 
              completed: true, 
              order: 1 
            },
            { 
              id: '2', 
              courseId: 'sample-2',
              title: 'Components and Props', 
              content: 'Understanding React components and props', 
              type: 'video' as const,
              duration: 45, 
              completed: true, 
              order: 2 
            },
            { 
              id: '3', 
              courseId: 'sample-2',
              title: 'State and Lifecycle', 
              content: 'Managing component state and lifecycle methods', 
              type: 'video' as const,
              duration: 75, 
              completed: true, 
              order: 3 
            },
            { 
              id: '4', 
              courseId: 'sample-2',
              title: 'Hooks Deep Dive', 
              content: 'Advanced React hooks and custom hooks', 
              type: 'video' as const,
              duration: 90, 
              completed: false, 
              order: 4 
            },
            { 
              id: '5', 
              courseId: 'sample-2',
              title: 'React Router', 
              content: 'Client-side routing with React Router', 
              type: 'video' as const,
              duration: 60, 
              completed: false, 
              order: 5 
            },
            { 
              id: '6', 
              courseId: 'sample-2',
              title: 'State Management', 
              content: 'Advanced state management patterns', 
              type: 'video' as const,
              duration: 105, 
              completed: false, 
              order: 6 
            }
          ],
          assignedTo: [user.id],
          instructor: { name: 'Sarah Johnson', title: 'React Specialist', bio: 'Frontend expert focusing on React ecosystem' },
          difficulty: 'intermediate' as const
        },
        {
          id: 'sample-3',
          title: 'Python for Data Science',
          description: 'Learn Python programming with focus on data analysis, visualization, and machine learning basics.',
          category: 'Data Science',
          points: 200,
          duration: 525, // 8h 45m in minutes
          lessons: [
            { 
              id: '1', 
              courseId: 'sample-3',
              title: 'Python Basics', 
              content: 'Introduction to Python programming language', 
              type: 'video' as const,
              duration: 90, 
              completed: true, 
              order: 1 
            },
            { 
              id: '2', 
              courseId: 'sample-3',
              title: 'NumPy and Pandas', 
              content: 'Data manipulation with NumPy and Pandas', 
              type: 'video' as const,
              duration: 120, 
              completed: false, 
              order: 2 
            },
            { 
              id: '3', 
              courseId: 'sample-3',
              title: 'Data Visualization', 
              content: 'Creating visualizations with Matplotlib and Seaborn', 
              type: 'video' as const,
              duration: 105, 
              completed: false, 
              order: 3 
            },
            { 
              id: '4', 
              courseId: 'sample-3',
              title: 'Machine Learning Intro', 
              content: 'Introduction to machine learning concepts', 
              type: 'video' as const,
              duration: 150, 
              completed: false, 
              order: 4 
            },
            { 
              id: '5', 
              courseId: 'sample-3',
              title: 'Real-world Projects', 
              content: 'Apply your knowledge to real data science projects', 
              type: 'video' as const,
              duration: 180, 
              completed: false, 
              order: 5 
            }
          ],
          assignedTo: [user.id],
          instructor: { name: 'Dr. Michael Chen', title: 'Data Science Expert', bio: 'PhD in Computer Science with 15+ years in data science and ML' },
          difficulty: 'advanced' as const
        }
      ]
      
      // Add sample courses to the existing courses
      const updatedCourses = [...allCourses, ...sampleAssignedCourses] as Course[]
      setCourses(updatedCourses)
      
      // Save to localStorage for persistence
      localStorage.setItem('qedge_courses', JSON.stringify(updatedCourses))
    } else {
      setCourses(allCourses)
    }
    
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
                  // Calculate actual progress based on completed lessons
                  const completedLessons = course.lessons?.filter(lesson => lesson.completed).length || 0
                  const totalLessons = course.lessons?.length || 1
                  const progress = Math.round((completedLessons / totalLessons) * 100)
                  
                  // Get difficulty color
                  const getDifficultyColor = (difficulty: string) => {
                    switch(difficulty?.toLowerCase()) {
                      case 'beginner': return 'bg-green-100 text-green-800'
                      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
                      case 'advanced': return 'bg-red-100 text-red-800'
                      default: return 'bg-gray-100 text-gray-800'
                    }
                  }
                  
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
                              {totalLessons} lessons
                            </span>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty || 'beginner')}`}>
                              {course.difficulty || 'Beginner'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Instructor</span>
                            <span className="font-medium">{course.instructor?.name || 'Staff'}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Enrolled</span>
                            <span className="font-medium">Recently</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{completedLessons}/{totalLessons} lessons ({progress}%)</span>
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
                  <p className="text-muted-foreground mb-4">You haven't been assigned any courses yet. Contact your HR administrator to get started with your learning journey.</p>
                  <Button onClick={() => router.push('/courses')}>
                    Browse Available Courses
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
