'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Users, Target, Clock, Search, Filter } from 'lucide-react'
import { getCurrentUser, getCourses } from '@/lib/storage'
import type { Course } from '@/lib/storage'

export default function CoursesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Courses</h1>
              <p className="text-muted-foreground mt-2">Explore available courses and enhance your skills</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isAssigned = course.assignedTo.includes(currentUser?.id || '')
              const enrollmentCount = course.assignedTo.length
              
              return (
                <Card key={course.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 p-4">
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

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{enrollmentCount} enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{course.duration || '2h'}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      variant={isAssigned ? "default" : "outline"}
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      {isAssigned ? 'Continue Learning' : 'View Course'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
