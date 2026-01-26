'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
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
  Activity,
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
  Video,
  Megaphone,
  PieChart,
  ChevronRight,
  Clipboard,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Upload,
  Zap,
  Globe,
  Shield,
  Heart,
  Trophy,
  Target as TargetIcon,
  UserPlus,
  UserMinus,
  Link,
  Edit,
  Trash2,
  Copy,
  FileSpreadsheet,
  Database,
  Lock,
  Unlock,
  Mail as MailIcon,
  MessageCircle,
  Smartphone,
  CreditCard,
  Layout,
  Palette,
  Image as ImageIcon,
  LogIn,
  Home,
  Tags as TagsIcon,
  Fingerprint,
  PlayCircle,
  Book,
  HelpCircle,
  Cpu,
  Wifi,
  MessageSquare as MessageIcon,
  Globe2,
  Video as VideoIcon,
  FileVideo,
  FileDown,
  FileUp,
  Layers,
  Grid3X3,
  List,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Award as AwardIcon,
  Target as TargetIcon2,
  Star as StarIcon,
  CheckSquare,
  Square,
  Menu,
  X,
  MoreVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  RefreshCw,
  Save,
  Printer,
  Share2,
  Filter as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Eye as EyeIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Mail as MailIcon2,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  TrendingUp as TrendingUpIcon2,
  Users as UsersIcon2,
  Award as AwardIcon2,
  Star as StarIcon2,
  Target as TargetIcon3,
  Heart as HeartIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  Building as BuildingIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  BookOpen as BookOpenIcon,
  FileText as FileTextIcon,
  MessageSquare as MessageSquareIcon,
  Video as VideoIcon2,
  Megaphone as MegaphoneIcon,
  PieChart as PieChartIcon2,
  ChevronRight as ChevronRightIcon,
  Clipboard as ClipboardIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  Eye as EyeIcon2,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Zap as ZapIcon2,
  Globe as GlobeIcon2,
  Shield as ShieldIcon2,
  Heart as HeartIcon2,
  Trophy as TrophyIcon,
  Target as TargetIcon4
} from 'lucide-react'
import { 
  getCurrentUser, 
  getCourses, 
  getAllUsers, 
  getMessages,
  getBadges,
  getActivities,
  initializeStorage,
  createMeeting,
  createAnnouncement
} from '@/lib/storage'
import type { User, Course, Message, Badge, Activity as ActivityType } from '@/lib/storage'

export default function HRDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [showNotifications, setShowNotifications] = useState(false)

  // Quick action forms
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    participants: [] as string[]
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    audience: 'all' as 'all' | 'hr' | 'employee' | 'candidate'
  })

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
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
    const newUsersThisMonth = users.filter(u => {
      const userDate = new Date(u.createdAt)
      const thisMonth = new Date()
      return userDate.getMonth() === thisMonth.getMonth() && 
             userDate.getFullYear() === thisMonth.getFullYear()
    }).length
    
    const totalCourses = courses.length
    const activeCourses = courses.filter(c => c.status === 'active').length
    const assignedCourses = courses.reduce((sum, course) => sum + course.assignedTo.length, 0)
    const completedCourses = users.filter(u => (u.progress || 0) >= 100).length
    const totalPoints = courses.reduce((sum, course) => sum + course.points, 0)
    const avgProgress = users.reduce((sum, u) => sum + (u.progress || 0), 0) / users.length
    
    const totalMessages = messages.length
    const unreadMessages = messages.filter(m => 
      m.senderId !== currentUser?.id && !m.readBy?.includes(currentUser!.id)
    ).length
    const messagesToday = messages.filter(m => {
      const msgDate = new Date(m.sentAt)
      const today = new Date()
      return msgDate.toDateString() === today.toDateString()
    }).length
    
    const recentActivities = activities.slice(0, 5)

    // Additional HR-specific stats
    const upcomingMeetings = activities.filter(a => 
      a.type === 'meeting_attended' && new Date(a.timestamp) > new Date()
    ).length
    
    const pendingEvaluations = users.filter(u => 
      u.role === 'candidate' && (u.progress || 0) < 50
    ).length
    
    const topPerformers = users
      .filter(u => u.points && u.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 5)
    
    const recentCompletions = activities.filter(a => 
      a.type === 'course_completed' && 
      new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    return {
      users: { 
        total: totalUsers, 
        hr: hrUsers, 
        employee: employeeUsers, 
        candidate: candidateUsers, 
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      },
      courses: { 
        total: totalCourses, 
        active: activeCourses,
        assigned: assignedCourses, 
        completed: completedCourses, 
        points: totalPoints,
        avgProgress: Math.round(avgProgress)
      },
      messages: { 
        total: totalMessages, 
        unread: unreadMessages,
        today: messagesToday
      },
      activities: recentActivities,
      meetings: { upcoming: upcomingMeetings },
      evaluations: { pending: pendingEvaluations },
      topPerformers,
      recentCompletions
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const meeting = createMeeting({
        title: meetingForm.title,
        description: `Scheduled meeting for ${meetingForm.date} at ${meetingForm.time}`,
        scheduledAt: `${meetingForm.date}T${meetingForm.time}`,
        participants: meetingForm.participants,
        createdBy: currentUser!.id,
        createdAt: new Date().toISOString(),
        status: 'scheduled',
        duration: 60,
        platform: 'teams',
        webinarMode: false
      })

      // Reset form
      setMeetingForm({
        title: '',
        date: '',
        time: '',
        participants: []
      })

      loadData()
      alert('Meeting scheduled successfully!')
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to schedule meeting')
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const announcement = createAnnouncement({
        title: announcementForm.title,
        content: announcementForm.content,
        priority: announcementForm.priority,
        audience: announcementForm.audience
      })

      // Reset form
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 'normal',
        audience: 'all'
      })

      loadData()
      alert('Announcement created successfully!')
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('Failed to create announcement')
    }
  }

  const stats = getDashboardStats()

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <HRSidebar userName={currentUser?.name || ''} />
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
        
        {/* Right Sidebar */}
        <aside className="w-80 bg-card border-l border-border p-6 space-y-6">
          {/* Quick Stats */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium text-green-600">{stats.users.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pending Tasks</span>
                  <span className="text-sm font-medium text-orange-600">{stats.evaluations.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Unread Messages</span>
                  <span className="text-sm font-medium text-blue-600">{stats.messages.unread}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <UserPlus className="h-3 w-3" />
                  Add User
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-3 w-3" />
                  Create Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Calendar className="h-3 w-3" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Megaphone className="h-3 w-3" />
                  Send Announcement
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">New user registration</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Course completed</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">System update available</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">System Health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">API Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Database</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-yellow-600">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h3>
              <div className="space-y-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Today, 3:00 PM</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Training Session</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Review Deadline</p>
                  <p className="text-xs text-muted-foreground">Dec 28, 5:00 PM</p>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <HRSidebar userName={currentUser?.name || ''} />
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your entire learning ecosystem
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>System Status: </span>
                  <span className="text-green-600 font-medium">All Systems Operational</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {stats.messages.unread > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-medium text-foreground">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {stats.messages.unread > 0 ? (
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-foreground">{stats.messages.unread} unread messages</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            View All Messages
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Actions
              </Button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <Card className="p-6 bg-card border border-border mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Schedule Meeting */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Meeting
                  </h4>
                  <form onSubmit={handleCreateMeeting} className="space-y-3">
                    <div>
                      <Label htmlFor="meeting-title">Title</Label>
                      <Input
                        id="meeting-title"
                        value={meetingForm.title}
                        onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                        placeholder="Meeting title"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="meeting-date">Date</Label>
                        <Input
                          id="meeting-date"
                          type="date"
                          value={meetingForm.date}
                          onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="meeting-time">Time</Label>
                        <Input
                          id="meeting-time"
                          type="time"
                          value={meetingForm.time}
                          onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="w-full">
                      Schedule Meeting
                    </Button>
                  </form>
                </div>

                {/* Create Announcement */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Create Announcement
                  </h4>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                    <div>
                      <Label htmlFor="announcement-title">Title</Label>
                      <Input
                        id="announcement-title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        placeholder="Announcement title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-content">Message</Label>
                      <textarea
                        id="announcement-content"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                        placeholder="Announcement content"
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        rows={3}
                        required
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full">
                      Send Announcement
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.users.total}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{stats.users.newThisMonth} this month</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{stats.users.active} active</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.active}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-600">{stats.courses.assigned} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{stats.courses.avgProgress}% avg progress</span>
                  </div>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.users.total > 0 ? Math.round((stats.courses.completed / stats.users.total) * 100) : 0}%
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">{stats.recentCompletions} completions this week</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.meetings.upcoming + stats.evaluations.pending}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">{stats.meetings.upcoming} meetings</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clipboard className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">{stats.evaluations.pending} evaluations</span>
                  </div>
                </div>
                <TargetIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Enhanced Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/courses')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Courses</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage training programs</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-blue-600">{stats.courses.total} total courses</div>
                  <div className="text-xs text-muted-foreground">{stats.courses.active} active</div>
                </div>
              </div>
            </Card>

            {/* Users Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/users')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Users</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage user accounts</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-green-600">{stats.users.total} total users</div>
                  <div className="text-xs text-muted-foreground">{stats.users.active} active</div>
                </div>
              </div>
            </Card>

            {/* Batches Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/batches')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="h-8 w-8 text-purple-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Batches</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage training batches</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-purple-600">12 active batches</div>
                  <div className="text-xs text-muted-foreground">240 trainees</div>
                </div>
              </div>
            </Card>

            {/* Evaluations Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/evaluations')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clipboard className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Evaluations</h3>
                <p className="text-sm text-muted-foreground mt-1">Assessments & exams</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-orange-600">{stats.evaluations.pending} pending</div>
                  <div className="text-xs text-muted-foreground">0 completed</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Forms Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/forms')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-cyan-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Forms</h3>
                <p className="text-sm text-muted-foreground mt-1">Custom forms & surveys</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-cyan-600">8 forms created</div>
                  <div className="text-xs text-muted-foreground">245 responses</div>
                </div>
              </div>
            </Card>

            {/* Reports Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/reports')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8 text-red-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Reports</h3>
                <p className="text-sm text-muted-foreground mt-1">Analytics & insights</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-red-600">25 report types</div>
                  <div className="text-xs text-muted-foreground">Generated daily</div>
                </div>
              </div>
            </Card>

            {/* Settings Section */}
            <Card className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/hr/settings')}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Settings className="h-8 w-8 text-gray-500" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">System configuration</p>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-gray-600">12 categories</div>
                  <div className="text-xs text-muted-foreground">System config</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Features Section */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Advanced Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Gamification */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Gamification
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Award className="h-4 w-4" />
                      Leaderboard
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Star className="h-4 w-4" />
                      Badges
                    </Button>
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Link className="h-5 w-5 text-blue-500" />
                    Integrations
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Video className="h-4 w-4" />
                      Webinars/Meetings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Vimeo
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Smartphone className="h-4 w-4" />
                      SMS/Whatsapp
                    </Button>
                  </div>
                </div>

                {/* Frontend */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-500" />
                    Frontend
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Globe className="h-4 w-4" />
                      Microsite
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course Category
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Blog/FAQ
                    </Button>
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Tools
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Database className="h-4 w-4" />
                      Data Management
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Help Center
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* User Management Actions */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">User Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Users
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Users
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import/Bulk
                </Button>
                <Button variant="outline" className="gap-2">
                  <Link className="h-4 w-4" />
                  Trainee Relationships
                </Button>
              </div>
            </div>
          </Card>

          {/* Evaluation Sub-buttons */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Evaluations</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <Clipboard className="h-4 w-4" />
                  Exam
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Assignment
                </Button>
                <Button variant="outline" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Question Bank
                </Button>
                <Button variant="outline" className="gap-2">
                  <Award className="h-4 w-4" />
                  Skills
                </Button>
              </div>
            </div>
          </Card>

          {/* Comprehensive Reports Section */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Learning Reports</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" />
                    Course
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Trainees
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Layers className="h-4 w-4" />
                    Batch
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Trophy className="h-4 w-4" />
                    Learning Path
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Assessment Reports</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Clipboard className="h-4 w-4" />
                    Exams
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Award className="h-4 w-4" />
                    Skills
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Star className="h-4 w-4" />
                    Badges
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Target className="h-4 w-4" />
                    Leaderboard
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Analytics Reports</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Engagement Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Enrollment Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Mail Activity
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Activity className="h-4 w-4" />
                    Active User Report
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">System Reports</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Log
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    Audit Trail
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Database className="h-4 w-4" />
                    Transaction
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Save className="h-4 w-4" />
                    Saved Reports
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Reports
                </Button>
              </div>
            </div>
          </Card>

          {/* Settings & Customize Section */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Settings & Customize</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Customization</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Logo
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Favicon
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Home className="h-4 w-4" />
                    Home Page
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <LogIn className="h-4 w-4" />
                    Login Page
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">UI Settings</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Layout className="h-4 w-4" />
                    User Interface
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <TagsIcon className="h-4 w-4" />
                    Labels
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MailIcon className="h-4 w-4" />
                    Email Address
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Email Templates
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">User Management</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Whatsapp Templates
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <UserCheck className="h-4 w-4" />
                    Trainee Profile
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <UserPlus className="h-4 w-4" />
                    Custom User Fields
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Fingerprint className="h-4 w-4" />
                    SSO
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">System Settings</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Quick Start Guide
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Features
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Zap className="h-4 w-4" />
                    Automation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Bell className="h-4 w-4" />
                    Reminders
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Gamification Section */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Gamification</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
                <Button variant="outline" className="gap-2">
                  <Award className="h-4 w-4" />
                  Badges
                </Button>
                <Button variant="outline" className="gap-2">
                  <Star className="h-4 w-4" />
                  Points System
                </Button>
                <Button variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  Achievements
                </Button>
              </div>
            </div>
          </Card>

          {/* Integrations Section */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Communication</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Video className="h-4 w-4" />
                    Webinars / Meetings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MessageCircle className="h-4 w-4" />
                    SMS
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Smartphone className="h-4 w-4" />
                    Whatsapp
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Content Platforms</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Vimeo
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Globe className="h-4 w-4" />
                    Go1
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" />
                    Content Library
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Organization</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Building className="h-4 w-4" />
                    Branch
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Briefcase className="h-4 w-4" />
                    Department
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Designation
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Learning Resources</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Layers className="h-4 w-4" />
                    Venue
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Wifi className="h-4 w-4" />
                    Zone
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <TagsIcon className="h-4 w-4" />
                    Tags
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Cpu className="h-4 w-4" />
                    AI Credits
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {stats.activities.length > 0 ? (
                    stats.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.type}</p>
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

            <Card className="bg-card border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  {stats.topPerformers.length > 0 ? (
                    stats.topPerformers.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-bold text-yellow-800">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{user.points} pts</p>
                          <p className="text-xs text-muted-foreground">{user.progress || 0}%</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No performers data</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-card border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
                  <Settings className="h-5 w-5 text-gray-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">System Health</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Storage Used</span>
                    <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Security</span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Secured</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.users.total > 0 ? Math.round((stats.courses.completed / stats.users.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                    <span className="text-sm font-medium">124ms</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </main>
        
        {/* Right Sidebar */}
        <aside className="w-80 bg-card border-l border-border p-6 space-y-6">
          {/* Quick Stats */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium text-green-600">{stats.users.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pending Tasks</span>
                  <span className="text-sm font-medium text-orange-600">{stats.evaluations.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Unread Messages</span>
                  <span className="text-sm font-medium text-blue-600">{stats.messages.unread}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <UserPlus className="h-3 w-3" />
                  Add User
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-3 w-3" />
                  Create Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Calendar className="h-3 w-3" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Megaphone className="h-3 w-3" />
                  Send Announcement
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">New user registration</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Course completed</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">System update available</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">System Health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">API Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Database</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-yellow-600">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-muted/30 border border-border">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h3>
              <div className="space-y-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Today, 3:00 PM</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Training Session</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Review Deadline</p>
                  <p className="text-xs text-muted-foreground">Dec 28, 5:00 PM</p>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
