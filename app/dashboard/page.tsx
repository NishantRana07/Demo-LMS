'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Mail, 
  TrendingUp,
  Award,
  Activity as ActivityIcon,
  Clock,
  Target,
  Star,
  Plus,
  Search,
  Filter,
  Bell,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  UserCheck,
  Briefcase,
  GraduationCap,
  Building,
  ChevronRight
} from 'lucide-react'
import { 
  getCurrentUser, 
  getCourses, 
  getAllUsers, 
  getMessages,
  getBadges,
  getActivities,
  initializeStorage
} from '@/lib/storage'
import type { User, Course, Message, Badge, Activity } from '@/lib/storage'

// Add CSS for auto-scrolling animation
const autoScrollStyles = `
  @keyframes scroll {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }
  
  .animate-scroll {
    animation: scroll 20s linear infinite;
  }
  
  .animate-scroll:hover {
    animation-play-state: paused;
  }
`

export default function UnifiedDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Inject CSS styles for auto-scrolling
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = autoScrollStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users' | 'communication' | 'analytics'>('overview')

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = () => {
    setCourses(getCourses())
    setUsers(getAllUsers())
    setMessages(getMessages())
    setBadges(getBadges())
    setActivities(getActivities())
    setLoading(false)
  }

  const getDashboardStats = () => {
    const totalUsers = users.length
    const hrUsers = users.filter(u => u.role === 'hr').length
    const employeeUsers = users.filter(u => u.role === 'employee').length
    const candidateUsers = users.filter(u => u.role === 'candidate').length
    const activeUsers = users.filter(u => u.isActive).length
    
    const totalCourses = courses.length
    const assignedCourses = courses.reduce((sum, course) => sum + course.assignedTo.length, 0)
    const completedCourses = users.filter(u => (u.progress || 0) >= 100).length
    const totalPoints = courses.reduce((sum, course) => sum + course.points, 0)
    
    const totalMessages = messages.length
    const unreadMessages = messages.filter(m => 
      m.senderId !== currentUser?.id && !m.readBy?.includes(currentUser!.id)
    ).length
    
    const recentActivities = activities.slice(0, 5)

    return {
      users: { total: totalUsers, hr: hrUsers, employee: employeeUsers, candidate: candidateUsers, active: activeUsers },
      courses: { total: totalCourses, assigned: assignedCourses, completed: completedCourses, points: totalPoints },
      messages: { total: totalMessages, unread: unreadMessages },
      activities: recentActivities
    }
  }

  const getAssignedCourses = () => {
    if (!currentUser) return []
    return courses.filter(course => course.assignedTo.includes(currentUser.id))
  }

  const getMyProgress = () => {
    if (!currentUser) return 0
    return currentUser.progress || 0
  }

  const getMyBadges = () => {
    if (!currentUser) return []
    return (currentUser.badges || []).map(badgeId => 
      badges.find(b => b.id === badgeId)
    ).filter(Boolean)
  }

  const stats = getDashboardStats()
  const assignedCourses = getAssignedCourses()
  const myProgress = getMyProgress()
  const myBadges = getMyBadges()

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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name}!</h2>
        <p className="text-blue-100">
          {currentUser?.role === 'hr' ? 'Manage your team and track progress' : 
           currentUser?.role === 'employee' ? 'Continue your learning journey' : 
           'Explore courses and grow your skills'}
        </p>
      </div>

      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.users.total}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.users.active} active</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.total}</p>
              <p className="text-xs text-green-600 mt-1">{stats.courses.assigned} enrolled</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.messages.total}</p>
              <p className="text-xs text-orange-600 mt-1">{stats.messages.unread} unread</p>
            </div>
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Progress</p>
              <p className="text-2xl font-bold text-foreground mt-1">{myProgress}%</p>
              <p className="text-xs text-purple-600 mt-1">{myBadges.length} badges</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.activities.length > 0 ? (
                  stats.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ActivityIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="bg-card border border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">My Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                {myBadges.length > 0 ? (
                  myBadges.map((badge) => (
                    <div key={badge?.id} className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl mb-1">{badge?.icon}</div>
                      <p className="text-xs text-muted-foreground">{badge?.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8 col-span-3">No badges earned yet</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Courses</h2>
        {currentUser?.role === 'hr' && (
          <Button onClick={() => router.push('/admin/dashboard')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
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
                  {isAssigned && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Assigned</span>
                    </div>
                  )}
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
    </div>
  )

  const renderUsersTab = () => {
    if (currentUser?.role !== 'hr') {
      return (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Access restricted to HR users</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Users Management</h2>
          <Button onClick={() => router.push('/admin/users')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.users.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">HR Staff</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.users.hr}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.users.employee}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidates</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.users.candidate}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        <Card className="bg-card border border-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Users</h3>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'employee' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderCommunicationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Communication</h2>
        <Button onClick={() => router.push('/admin/communication')} className="gap-2">
          <Plus className="h-4 w-4" />
          Compose Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.messages.total}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.messages.unread}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.users.active}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      <Card className="bg-card border border-border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{message.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.sentAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  message.type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                  message.type === 'email' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {message.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.users.total > 0 ? Math.round((stats.courses.completed / stats.users.total) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Progress</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.progress || 0), 0) / users.length) : 0}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.points}</p>
            </div>
            <Award className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border border-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">User Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">HR Staff</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stats.users.total > 0 ? (stats.users.hr / stats.users.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.users.hr}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Employees</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.users.total > 0 ? (stats.users.employee / stats.users.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.users.employee}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Candidates</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${stats.users.total > 0 ? (stats.users.candidate / stats.users.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.users.candidate}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-card border border-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Course Engagement</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Enrollments</span>
                <span className="text-sm font-medium">{stats.courses.assigned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium text-green-600">{stats.courses.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-medium text-orange-600">{stats.courses.assigned - stats.courses.completed}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Unified Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                {currentUser?.role === 'hr' ? 'Manage your entire learning platform' : 
                 currentUser?.role === 'employee' ? 'Track your progress and achievements' : 
                 'Explore learning opportunities'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                {stats.messages.unread > 0 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mb-8 bg-muted/30 p-1 rounded-lg w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'communication', label: 'Communication', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'courses' && renderCoursesTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'communication' && renderCommunicationTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </main>
    </div>
  )
}

