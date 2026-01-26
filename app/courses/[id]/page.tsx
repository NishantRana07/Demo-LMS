'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Target, 
  Play, 
  CheckCircle,
  ArrowLeft,
  Star,
  Calendar,
  Award,
  Download
} from 'lucide-react'
import { getCurrentUser, getCourses } from '@/lib/storage'
import type { Course } from '@/lib/storage'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)

  const resolvedParams = await params
  const courseId = resolvedParams.id

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    const courses = getCourses()
    const foundCourse = courses.find(c => c.id === courseId)
    
    if (!foundCourse) {
      router.push('/courses')
      return
    }
    
    setCourse(foundCourse)
    setEnrolled(foundCourse.assignedTo.includes(user.id))
    setLoading(false)
  }, [router, courseId])

  const handleEnroll = () => {
    if (!course || !currentUser) return
    
    // Update course to include current user
    const courses = getCourses()
    const updatedCourses = courses.map(c => 
      c.id === course.id 
        ? { ...c, assignedTo: [...c.assignedTo, currentUser.id] }
        : c
    )
    
    // Update localStorage (in a real app, this would be an API call)
    localStorage.setItem('qedge_courses', JSON.stringify(updatedCourses))
    setEnrolled(true)
    setCourse({ ...course, assignedTo: [...course.assignedTo, currentUser.id] })
  }

  const calculateProgress = () => {
    // Mock progress calculation
    return enrolled ? Math.floor(Math.random() * 100) : 0
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist</p>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const progress = calculateProgress()
  const completedLessons = Math.floor((progress / 100) * course.lessons.length)

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.push('/courses')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>

          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {course.category || 'General'}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {course.points} points
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'fill-current' : ''}`} />
                    ))}
                    <span className="text-sm ml-1">4.0</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-blue-100 text-lg mb-6">{course.description}</p>
                
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration || '2 hours'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{course.assignedTo.length} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Updated {new Date(course.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {enrolled ? (
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-sm mb-2">Your Progress</p>
                    <p className="text-2xl font-bold">{progress}%</p>
                    <Progress value={progress} className="h-2 mt-2 bg-white/30" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleEnroll}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-white/90"
                  >
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Content */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Course Content</h2>
                  
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => {
                      const isCompleted = enrolled && index < completedLessons
                      const isCurrent = enrolled && index === completedLessons
                      
                      return (
                        <div 
                          key={lesson.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : isCurrent 
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">{lesson.title}</h3>
                                <p className="text-sm text-muted-foreground">{lesson.duration || '15 min'}</p>
                              </div>
                            </div>
                            
                            {enrolled && (
                              <Button 
                                size="sm" 
                                variant={isCompleted ? "outline" : "default"}
                                className="gap-2"
                              >
                                {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>

              {/* Course Description */}
              <Card className="bg-card border border-border mt-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">About this course</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-foreground mb-3">What you'll learn</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Understand core concepts and fundamentals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Apply practical skills in real-world scenarios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Build confidence through hands-on exercises</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Earn certification upon completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Instructor Info */}
              <Card className="bg-card border border-border mb-6">
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Instructor</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{course.instructor?.name || 'Expert Instructor'}</p>
                      <p className="text-sm text-muted-foreground">{course.instructor?.title || 'Industry Professional'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor?.bio || 'Experienced professional with years of industry expertise and passion for teaching.'}
                  </p>
                </div>
              </Card>

              {/* Course Stats */}
              <Card className="bg-card border border-border mb-6">
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Course Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant="outline">{course.difficulty || 'Intermediate'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <span className="text-foreground">English</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate</span>
                      <Badge className="bg-green-100 text-green-800">Yes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access</span>
                      <span className="text-foreground">Lifetime</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                  <div className="space-y-3">
                    {enrolled ? (
                      <>
                        <Button className="w-full gap-2">
                          <Play className="h-4 w-4" />
                          Continue Learning
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                          <Download className="h-4 w-4" />
                          Download Resources
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEnroll} className="w-full">
                        Enroll in this Course
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full gap-2">
                      <Award className="h-4 w-4" />
                      View Certificate
                    </Button>
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
