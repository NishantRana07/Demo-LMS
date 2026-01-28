'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  FileText, 
  Download,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  Eye,
  Target,
  Award,
  AlertCircle
} from 'lucide-react'
import { 
  getAssessments, 
  getAssessmentStats, 
  getAssessmentSubmissions,
  type Assessment
} from '@/lib/assessment-system'
import { getCurrentUser, getAllUsers } from '@/lib/storage'

export default function AssessmentAnalyticsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setAssessments(getAssessments())
    setUsers(getAllUsers())
    setLoading(false)
  }, [router])

  const getOverallStats = () => {
    const allSubmissions = assessments.flatMap(a => getAssessmentSubmissions(a.id))
    const totalAssessments = assessments.length
    const activeAssessments = assessments.filter(a => a.isActive).length
    const totalSubmissions = allSubmissions.length
    const averageScore = totalSubmissions > 0 
      ? Math.round(allSubmissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions)
      : 0
    const passRate = totalSubmissions > 0
      ? Math.round((allSubmissions.filter(s => s.passed).length / totalSubmissions) * 100)
      : 0
    const averageTime = totalSubmissions > 0
      ? Math.round(allSubmissions.reduce((sum, s) => sum + s.timeSpent, 0) / totalSubmissions)
      : 0

    return {
      totalAssessments,
      activeAssessments,
      totalSubmissions,
      averageScore,
      passRate,
      averageTime
    }
  }

  const getTopPerformers = () => {
    const userScores: { [key: string]: { score: number; count: number; user: any } } = {}
    
    assessments.forEach(assessment => {
      const submissions = getAssessmentSubmissions(assessment.id)
      submissions.forEach(submission => {
        if (!userScores[submission.userId]) {
          userScores[submission.userId] = { score: 0, count: 0, user: users.find(u => u.id === submission.userId) }
        }
        userScores[submission.userId].score += submission.percentage
        userScores[submission.userId].count++
      })
    })

    return Object.entries(userScores)
      .map(([userId, data]) => ({
        ...data,
        averageScore: Math.round(data.score / data.count)
      }))
      .filter(data => data.user)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10)
  }

  const getAssessmentPerformance = () => {
    return assessments.map(assessment => {
      const stats = getAssessmentStats(assessment.id)
      return {
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        submissions: stats.totalSubmissions,
        averageScore: stats.averageScore,
        passRate: stats.passRate,
        averageTime: stats.averageTime,
        difficulty: stats.averageScore >= 80 ? 'Easy' : stats.averageScore >= 60 ? 'Medium' : 'Hard'
      }
    }).sort((a, b) => b.submissions - a.submissions)
  }

  const getRecentActivity = () => {
    const allSubmissions = assessments.flatMap(a => 
      getAssessmentSubmissions(a.id).map(s => ({ ...s, assessmentTitle: a.title }))
    )
    return allSubmissions
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const stats = getOverallStats()
  const topPerformers = getTopPerformers()
  const assessmentPerformance = getAssessmentPerformance()
  const recentActivity = getRecentActivity()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'exam': return 'bg-red-100 text-red-800'
      case 'assignment': return 'bg-green-100 text-green-800'
      case 'survey': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <HRSidebar userName={currentUser?.name || ''} />
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Assessment Analytics</h1>
                <p className="text-muted-foreground mt-2">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalAssessments}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.activeAssessments}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.averageScore}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.passRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.averageTime}m</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assessment Performance */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Assessment Performance</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {assessmentPerformance.map((assessment) => (
                      <div key={assessment.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-foreground">{assessment.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTypeColor(assessment.type)}>
                                {assessment.type}
                              </Badge>
                              <Badge className={getDifficultyColor(assessment.difficulty)}>
                                {assessment.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/hr/assessments`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Submissions</p>
                            <p className="font-medium text-foreground">{assessment.submissions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Score</p>
                            <p className="font-medium text-foreground">{assessment.averageScore}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pass Rate</p>
                            <p className="font-medium text-foreground">{assessment.passRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-medium text-foreground">{assessment.averageTime}m</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="font-medium text-foreground">{assessment.averageScore}%</span>
                          </div>
                          <Progress value={assessment.averageScore} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Performers */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border mb-6">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {topPerformers.map((performer, index) => (
                      <div key={performer.user.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{performer.user.name}</p>
                          <p className="text-sm text-muted-foreground">{performer.count} assessments</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{performer.averageScore}%</p>
                          <p className="text-xs text-muted-foreground">avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {activity.passed ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.assessmentTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {activity.percentage}% • {activity.timeSpent}min
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
