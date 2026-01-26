'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Target, Clock, Search, Filter, PlayCircle, CheckCircle, Lock, Plus, Download, Upload, Star, FileText, FileImage, Calendar, Building, User, Tag, Bell } from 'lucide-react'
import { getCurrentUser, getCourses } from '@/lib/storage'
import type { Course } from '@/lib/storage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function CoursesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'import' | 'export' | 'recommended'>('view')
  
  // Learning Object Form State
  const [learningObject, setLearningObject] = useState({
    objectType: 'pdf',
    title: '',
    code: '',
    description: '',
    duration: '',
    department: '',
    designation: '',
    branch: '',
    courseLibrary: '',
    expiryReminder: false,
    daysBeforeExpiry: '',
    tags: '',
    status: 'draft'
  })

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
          {/* Step-by-Step Guide */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">How to Use Courses</h3>
                <p className="text-sm text-blue-700">Follow these steps to make the most of your learning experience</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <h4 className="font-medium text-blue-900">Browse Courses</h4>
                  <p className="text-sm text-blue-700">Explore available courses and filter by category or difficulty</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <h4 className="font-medium text-blue-900">View Details</h4>
                  <p className="text-sm text-blue-700">Click on any course to see curriculum, requirements, and instructor info</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <h4 className="font-medium text-blue-900">Enroll & Start</h4>
                  <p className="text-sm text-blue-700">Enroll in courses that match your goals and begin learning</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <div>
                  <h4 className="font-medium text-blue-900">Track Progress</h4>
                  <p className="text-sm text-blue-700">Monitor your completion and earn badges and certificates</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Object</h1>
              <p className="text-muted-foreground mt-2">Manage courses, content, and learning resources</p>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-6 p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('view')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'view'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="flex-1 text-left">View Courses</span>
              </button>
              
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="flex-1 text-left">Add Courses</span>
              </button>
              
              <button
                onClick={() => setActiveTab('import')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="flex-1 text-left">Import Courses</span>
              </button>
              
              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'export'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="flex-1 text-left">Export Courses</span>
              </button>
              
              <button
                onClick={() => setActiveTab('recommended')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'recommended'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="flex-1 text-left">Recommended</span>
              </button>
            </div>
          </div>

          {/* Search Bar - Only show on view tab */}
          {activeTab === 'view' && (
            <div className="flex gap-2 mb-8">
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
          )}

          {/* Tab Content */}
          {activeTab === 'view' && (
            <div>
              {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isAssigned = course.assignedTo.includes(currentUser?.id || '')
              const enrollmentCount = course.assignedTo.length
              const userProgress = isAssigned ? (currentUser?.progress || 0) : 0
              const isCompleted = userProgress >= 100
              
              return (
                <Card key={course.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-6 w-6 text-white bg-green-500 rounded-full p-1" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {course.points} pts
                        </Badge>
                        <Badge variant="outline" className="text-xs text-white border-white/20">
                          {course.lessons.length} lessons
                        </Badge>
                        <Badge variant={course.difficulty === 'beginner' ? 'default' : course.difficulty === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {isAssigned && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">Your Progress</span>
                          <span>{userProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${userProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

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
          )}

          {activeTab === 'add' && (
            <Card className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Learning Object Details</h3>
                <p className="text-muted-foreground">Create a new learning object with detailed information</p>
              </div>
              
              <div className="space-y-6">
                {/* Object Type */}
                <div>
                  <Label className="text-base font-medium">Object Type</Label>
                  <div className="mt-2">
                    <Select value={learningObject.objectType} onValueChange={(value) => setLearningObject({...learningObject, objectType: value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select object type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="scorm">SCORM</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title and Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">Learning Object Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter learning object title"
                      value={learningObject.title}
                      onChange={(e) => setLearningObject({...learningObject, title: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code" className="text-base font-medium">Learning Object Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter learning object code"
                      value={learningObject.code}
                      onChange={(e) => setLearningObject({...learningObject, code: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Type your text here..."
                    value={learningObject.description}
                    onChange={(e) => setLearningObject({...learningObject, description: e.target.value})}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                {/* Duration and Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">Duration</Label>
                    <Select value={learningObject.duration} onValueChange={(value) => setLearningObject({...learningObject, duration: value})}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Please Select Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                        <SelectItem value="2hours">2 hours</SelectItem>
                        <SelectItem value="4hours">4 hours</SelectItem>
                        <SelectItem value="8hours">8 hours</SelectItem>
                        <SelectItem value="1day">1 day</SelectItem>
                        <SelectItem value="1week">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Department</Label>
                    <Select value={learningObject.department} onValueChange={(value) => setLearningObject({...learningObject, department: value})}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="it">Information Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Designation and Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">Designation</Label>
                    <Select value={learningObject.designation} onValueChange={(value) => setLearningObject({...learningObject, designation: value})}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="lead">Team Lead</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="vp">Vice President</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Branch</Label>
                    <Select value={learningObject.branch} onValueChange={(value) => setLearningObject({...learningObject, branch: value})}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="headquarters">Headquarters</SelectItem>
                        <SelectItem value="north">North Branch</SelectItem>
                        <SelectItem value="south">South Branch</SelectItem>
                        <SelectItem value="east">East Branch</SelectItem>
                        <SelectItem value="west">West Branch</SelectItem>
                        <SelectItem value="central">Central Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <Label className="text-base font-medium">Thumbnail</Label>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <FileImage className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">1 file selected</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* Course Library */}
                <div>
                  <Label className="text-base font-medium">Add To Course Library</Label>
                  <Select value={learningObject.courseLibrary} onValueChange={(value) => setLearningObject({...learningObject, courseLibrary: value})}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="library1">Main Library</SelectItem>
                      <SelectItem value="library2">Technical Library</SelectItem>
                      <SelectItem value="library3">Soft Skills Library</SelectItem>
                      <SelectItem value="library4">Compliance Library</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expiry Reminder */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="expiryReminder"
                      checked={learningObject.expiryReminder}
                      onChange={(e) => setLearningObject({...learningObject, expiryReminder: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="expiryReminder" className="text-base font-medium">
                      Send Expiry Reminder Email & Show Pop-up
                    </Label>
                  </div>
                  
                  {learningObject.expiryReminder && (
                    <div>
                      <Label className="text-base font-medium">Days Before End of Learning Object</Label>
                      <Input
                        type="number"
                        placeholder="Enter number of days"
                        value={learningObject.daysBeforeExpiry}
                        onChange={(e) => setLearningObject({...learningObject, daysBeforeExpiry: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-base font-medium">Tags</Label>
                  <Input
                    placeholder="Enter tags separated by commas"
                    value={learningObject.tags}
                    onChange={(e) => setLearningObject({...learningObject, tags: e.target.value})}
                    className="mt-2"
                  />
                </div>

                {/* Status */}
                <div>
                  <Label className="text-base font-medium">Status</Label>
                  <Select value={learningObject.status} onValueChange={(value) => setLearningObject({...learningObject, status: value})}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Learning Object
                  </Button>
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'import' && (
            <Card className="p-8">
              <div className="text-center">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Import Courses</h3>
                <p className="text-muted-foreground mb-6">Upload courses from SCORM packages or other formats</p>
                <div className="space-y-4">
                  <Button variant="outline" className="gap-2 w-full">
                    <Upload className="h-4 w-4" />
                    Upload SCORM Package
                  </Button>
                  <Button variant="outline" className="gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Import from CSV/Excel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'export' && (
            <Card className="p-8">
              <div className="text-center">
                <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Export Courses</h3>
                <p className="text-muted-foreground mb-6">Download course data and content in various formats</p>
                <div className="space-y-4">
                  <Button variant="outline" className="gap-2 w-full">
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="gap-2 w-full">
                    <Download className="h-4 w-4" />
                    Export SCORM Packages
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'recommended' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Recommended for You</h3>
                <p className="text-muted-foreground">Personalized course recommendations based on your learning history and goals</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.slice(0, 3).map((course) => (
                  <Card key={`recommended-${course.id}`} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-32 bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                      <div className="absolute top-2 right-2">
                        <Star className="h-6 w-6 text-white fill-current" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
