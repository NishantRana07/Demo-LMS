'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { EmployeeSidebar } from '@/components/employee-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCourses, getCourseStat, updateCourseStat } from '@/lib/storage'
import { BookOpen, Clock, Zap, ArrowRight, Play, CheckCircle, Lock, Award } from 'lucide-react'
import Link from 'next/link'
import type { Course, User } from '@/lib/storage'

export default function CoursesPage() {
  const { user, loading } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [courseStats, setCourseStats] = useState<Map<string, any>>(new Map())

  const handleStartCourse = (courseId: string) => {
    if (!user) return
    
    updateCourseStat(user.id, courseId, {
      started: true,
      lessonsCompleted: 0,
      totalLessons: courses.find(c => c.id === courseId)?.lessons.length || 0,
      pointsEarned: 0,
    })
    
    // Refresh stats
    const stats = new Map(courseStats)
    const courseStat = stats.get(courseId)
    if (courseStat) {
      courseStat.started = true
      stats.set(courseId, courseStat)
      setCourseStats(stats)
    }
  }

  const handleCompleteLesson = (courseId: string, lessonId: string) => {
    if (!user) return
    
    const stat = getCourseStat(user.id, courseId) || {
      started: false,
      lessonsCompleted: 0,
      totalLessons: 0,
      pointsEarned: 0,
    }
    
    updateCourseStat(user.id, courseId, {
      ...stat,
      lessonsCompleted: stat.lessonsCompleted + 1,
      pointsEarned: stat.pointsEarned + 10,
    })
    
    // Refresh stats
    const stats = new Map(courseStats)
    const courseStat = stats.get(courseId)
    if (courseStat) {
      courseStat.lessonsCompleted += 1
      courseStat.pointsEarned += 10
      stats.set(courseId, courseStat)
      setCourseStats(stats)
    }
  }

  useEffect(() => {
    if (user?.role === 'employee') {
      const allCourses = getCourses()
      const assigned = allCourses.filter((c) => c.assignedTo.includes(user.id))
      setCourses(assigned)

      // Get stats for each course
      const stats = new Map()
      assigned.forEach((course) => {
        const stat = getCourseStat(user.id, course.id) || {
          started: false,
          lessonsCompleted: 0,
          totalLessons: course.lessons.length,
          pointsEarned: 0,
        }
        stats.set(course.id, stat)
      })
      setCourseStats(stats)
    }
  }, [user])

  if (loading) return null
  if (!user || user.role !== 'employee') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 text-sm mt-1">Complete courses to earn points and grow</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const stat = courseStats.get(course.id) || {}
                const progress = stat.totalLessons > 0 ? (stat.lessonsCompleted / stat.totalLessons) * 100 : 0
                
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      {/* Course Info */}
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        {stat.started && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{stat.lessonsCompleted}/{stat.totalLessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Zap className="w-4 h-4" />
                            <span>{stat.pointsEarned}/{course.points} pts</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {stat.started ? (
                          <div className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            In Progress
                          </div>
                        ) : (
                          <div className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            Not Started
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link href={`/employee/course/${course.id}`} className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                          {stat.started ? 'Continue' : 'Start'} Course
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-600 mb-4">No courses assigned yet</p>
                <p className="text-sm text-gray-500">Ask your HR admin to assign courses to you</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
