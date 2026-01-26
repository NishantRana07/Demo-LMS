'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  PieChart, 
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  Filter,
  Activity,
  FileText,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  FileImage
} from 'lucide-react'
import { 
  getCurrentUser, 
  getCourses, 
  getAllUsers,
  getActivities,
  initializeStorage,
  getMeetings
} from '@/lib/storage'
import type { User, Course, Activity as ActivityType } from '@/lib/storage'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function HRReports() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<'overview' | 'users' | 'courses' | 'activities'>('overview')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

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
    setActivities(getActivities())
    setLoading(false)
  }

  const downloadUserData = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Progress', 'Attendance', 'Points', 'Joined Date'],
      ...users.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.department || 'N/A',
        user.isActive ? 'Active' : 'Inactive',
        `${user.progress || 0}%`,
        `${user.attendance || 0}%`,
        user.points || 0,
        user.joined || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCandidateData = () => {
    const candidates = users.filter(u => u.role === 'candidate')
    const csvContent = [
      ['ID', 'Name', 'Email', 'Department', 'Status', 'Progress', 'Attendance', 'Points', 'Joined Date', 'Badges'],
      ...candidates.map(candidate => [
        candidate.id,
        candidate.name,
        candidate.email,
        candidate.department || 'N/A',
        candidate.isActive ? 'Active' : 'Inactive',
        `${candidate.progress || 0}%`,
        `${candidate.attendance || 0}%`,
        candidate.points || 0,
        candidate.joined || 'N/A',
        (candidate.badges || []).join('; ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidates_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadFullReport = () => {
    const meetings = getMeetings()
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalCourses: courses.length,
        totalMeetings: meetings.length,
        totalActivities: activities.length
      },
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        status: u.isActive,
        progress: u.progress,
        attendance: u.attendance,
        points: u.points,
        badges: u.badges
      })),
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        status: c.status,
        assignedTo: c.assignedTo.length,
        difficulty: c.difficulty
      }))
    }

    const jsonContent = JSON.stringify(reportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `full_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDFReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('HR Reports & Analytics', pageWidth / 2, 20, { align: 'center' })
    
    // Generation date
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' })
    
    let yPosition = 50
    
    // Executive Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Executive Summary', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    const summaryData = [
      `Total Users: ${stats.users.total}`,
      `Active Users: ${stats.users.active}`,
      `Total Courses: ${stats.courses.total}`,
      `Completion Rate: ${stats.courses.completionRate}%`,
      `Average Progress: ${stats.performanceMetrics.avgProgress}%`,
      `Average Attendance: ${stats.performanceMetrics.avgAttendance}%`
    ]
    
    summaryData.forEach(line => {
      pdf.text(line, 25, yPosition)
      yPosition += 6
    })
    
    yPosition += 10
    
    // User Role Distribution
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('User Role Distribution', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`HR Staff: ${stats.roleDistribution.hr}`, 25, yPosition)
    yPosition += 6
    pdf.text(`Employees: ${stats.roleDistribution.employee}`, 25, yPosition)
    yPosition += 6
    pdf.text(`Candidates: ${stats.roleDistribution.candidate}`, 25, yPosition)
    yPosition += 6
    
    yPosition += 10
    
    // Course Status
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Course Status', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Active: ${stats.courseStatus.active}`, 25, yPosition)
    yPosition += 6
    pdf.text(`Draft: ${stats.courseStatus.draft}`, 25, yPosition)
    yPosition += 6
    pdf.text(`Archived: ${stats.courseStatus.archived}`, 25, yPosition)
    yPosition += 6
    
    yPosition += 10
    
    // Department Distribution
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Department Distribution', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    Object.entries(stats.departmentStats).forEach(([dept, count]) => {
      pdf.text(`${dept}: ${count} users`, 25, yPosition)
      yPosition += 6
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }
    })
    
    yPosition += 10
    
    // Performance Metrics
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Performance Metrics', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Average Progress: ${stats.performanceMetrics.avgProgress}%`, 25, yPosition)
    yPosition += 6
    pdf.text(`Average Attendance: ${stats.performanceMetrics.avgAttendance}%`, 25, yPosition)
    yPosition += 6
    pdf.text(`Average Points: ${stats.performanceMetrics.avgPoints}`, 25, yPosition)
    yPosition += 6
    pdf.text(`High Performers: ${stats.performanceMetrics.highPerformers}`, 25, yPosition)
    yPosition += 6
    pdf.text(`Low Performers: ${stats.performanceMetrics.lowPerformers}`, 25, yPosition)
    yPosition += 6
    
    // Add new page for detailed user data
    pdf.addPage()
    yPosition = 20
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('User Details', 20, yPosition)
    yPosition += 15
    
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    
    // Table headers
    const headers = ['Name', 'Email', 'Role', 'Department', 'Progress', 'Attendance', 'Points']
    const columnWidths = [30, 40, 20, 25, 15, 15, 15]
    let xPos = 20
    
    headers.forEach((header, index) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(header, xPos, yPosition)
      xPos += columnWidths[index]
    })
    
    yPosition += 8
    
    // User data
    pdf.setFont('helvetica', 'normal')
    users.forEach(user => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage()
        yPosition = 20
        
        // Repeat headers on new page
        xPos = 20
        headers.forEach((header, index) => {
          pdf.setFont('helvetica', 'bold')
          pdf.text(header, xPos, yPosition)
          xPos += columnWidths[index]
        })
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
      }
      
      xPos = 20
      const userData = [
        user.name.substring(0, 15),
        user.email.substring(0, 20),
        user.role,
        user.department || 'N/A',
        `${user.progress || 0}%`,
        `${user.attendance || 0}%`,
        `${user.points || 0}`
      ]
      
      userData.forEach((data, index) => {
        pdf.text(data, xPos, yPosition)
        xPos += columnWidths[index]
      })
      
      yPosition += 6
    })
    
    // Save the PDF
    pdf.save(`hr_reports_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const downloadChartsPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    
    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Visual Reports Dashboard', pageWidth / 2, 20, { align: 'center' })
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' })
    
    // Capture the charts section
    const chartsElement = document.getElementById('charts-section')
    if (chartsElement) {
      try {
        const canvas = await html2canvas(chartsElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pageWidth - 40
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, Math.min(imgHeight, 200))
      } catch (error) {
        console.error('Error capturing charts:', error)
        pdf.setFontSize(12)
        pdf.text('Charts could not be captured. Please try again.', pageWidth / 2, 100, { align: 'center' })
      }
    }
    
    pdf.save(`visual_reports_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getReportStats = () => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive).length
    const totalCourses = courses.length
    const totalEnrollments = courses.reduce((sum, course) => sum + course.assignedTo.length, 0)
    const completedCourses = users.filter(u => (u.progress || 0) >= 100).length
    const completionRate = totalUsers > 0 ? Math.round((completedCourses / totalUsers) * 100) : 0
    
    const roleDistribution = {
      hr: users.filter(u => u.role === 'hr').length,
      employee: users.filter(u => u.role === 'employee').length,
      candidate: users.filter(u => u.role === 'candidate').length
    }

    const courseStatus = {
      active: courses.filter(c => c.status === 'active').length,
      draft: courses.filter(c => c.status === 'draft').length,
      archived: courses.filter(c => c.status === 'archived').length
    }

    const departmentStats = users.reduce((acc, user) => {
      const dept = user.department || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const performanceMetrics = {
      avgProgress: Math.round(users.reduce((sum, u) => sum + (u.progress || 0), 0) / totalUsers),
      avgAttendance: Math.round(users.reduce((sum, u) => sum + (u.attendance || 0), 0) / totalUsers),
      avgPoints: Math.round(users.reduce((sum, u) => sum + (u.points || 0), 0) / totalUsers),
      highPerformers: users.filter(u => (u.progress || 0) >= 80).length,
      lowPerformers: users.filter(u => (u.progress || 0) < 30).length
    }

    const recentActivities = activities.slice(0, 10)

    return {
      users: { total: totalUsers, active: activeUsers, completed: completedCourses },
      courses: { total: totalCourses, enrollments: totalEnrollments, completionRate },
      roleDistribution,
      courseStatus,
      departmentStats,
      performanceMetrics,
      recentActivities
    }
  }

  const stats = getReportStats()

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-96 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <HRSidebar userName={currentUser?.name || ''} />
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive insights into your learning ecosystem
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="flex bg-muted rounded-lg p-1">
                {(['overview', 'users', 'courses', 'activities'] as const).map((report) => (
                  <Button
                    key={report}
                    variant={selectedReport === report ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                    className="capitalize"
                  >
                    {report}
                  </Button>
                ))}
              </div>
              
              <div className="flex bg-muted rounded-lg p-1">
                {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                  >
                    {range === 'all' ? 'All Time' : range}
                  </Button>
                ))}
              </div>
              
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Download Options */}
          <Card className="p-4 mb-8 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download user and candidate data in various formats</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={downloadUserData} className="gap-2">
                  <Users className="h-4 w-4" />
                  All Users CSV
                </Button>
                <Button variant="outline" onClick={downloadCandidateData} className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Candidates CSV
                </Button>
                <Button variant="outline" onClick={downloadPDFReport} className="gap-2">
                  <FileImage className="h-4 w-4" />
                  PDF Report
                </Button>
                <Button variant="outline" onClick={downloadChartsPDF} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Visual PDF
                </Button>
                <Button onClick={downloadFullReport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Full JSON
                </Button>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.users.total}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.users.active} active</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.total}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.courses.enrollments} enrollments</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.courses.completionRate}%</p>
                  <p className="text-xs text-purple-600 mt-1">{stats.users.completed} completed</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.performanceMetrics.avgProgress}%</p>
                  <p className="text-xs text-orange-600 mt-1">{stats.performanceMetrics.highPerformers} high performers</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activities</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{activities.length}</p>
                  <p className="text-xs text-orange-600 mt-1">total tracked</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* User Role Distribution */}
            <Card className="bg-card border border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  User Role Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-foreground">HR Staff</span>
                    </div>
                    <span className="text-sm font-medium">{stats.roleDistribution.hr}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Employees</span>
                    </div>
                    <span className="text-sm font-medium">{stats.roleDistribution.employee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Candidates</span>
                    </div>
                    <span className="text-sm font-medium">{stats.roleDistribution.candidate}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Status */}
            <Card className="bg-card border border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Course Status Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Active</span>
                    </div>
                    <span className="text-sm font-medium">{stats.courseStatus.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Draft</span>
                    </div>
                    <span className="text-sm font-medium">{stats.courseStatus.draft}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Archived</span>
                    </div>
                    <span className="text-sm font-medium">{stats.courseStatus.archived}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Department Distribution */}
            <Card className="bg-card border border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Department Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.departmentStats).slice(0, 5).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{dept}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / stats.users.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="bg-card border border-border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.performanceMetrics.avgProgress} className="flex-1" />
                    <span className="text-sm font-medium">{stats.performanceMetrics.avgProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Attendance</p>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.performanceMetrics.avgAttendance} className="flex-1" />
                    <span className="text-sm font-medium">{stats.performanceMetrics.avgAttendance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Points</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.performanceMetrics.avgPoints / 500) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{stats.performanceMetrics.avgPoints}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Performance Ratio</p>
                  <div className="flex gap-2">
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {stats.performanceMetrics.highPerformers} High
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {stats.performanceMetrics.lowPerformers} Low
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-card border border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activities
              </h3>
              <div className="space-y-3">
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity) => (
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
                  <p className="text-center text-muted-foreground py-8">No recent activities</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
