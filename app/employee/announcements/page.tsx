'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { EmployeeSidebar } from '@/components/employee-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Megaphone,
  Calendar,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Users,
  Eye
} from 'lucide-react'
import { getAnnouncements } from '@/lib/storage'
import type { User, Announcement } from '@/lib/storage'

export default function EmployeeAnnouncements() {
  const { user, loading } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'employee') {
      const allAnnouncements = getAnnouncements()
      // Filter announcements for employees and all users
      const relevant = allAnnouncements.filter(announcement => 
        announcement.audience === 'all' || 
        announcement.audience === 'employee'
      )
      setAnnouncements(relevant)
    }
  }, [user])

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'normal': return 'bg-gray-100 text-gray-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'low': return <Info className="h-4 w-4" />
      case 'normal': return <Bell className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'urgent': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const isRecent = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffHours = Math.abs(now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }

  if (loading) return null
  if (!user || user.role !== 'employee') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 text-sm mt-1">Stay updated with company news and important information</p>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Announcements</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{announcements.length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {announcements.filter(a => a.priority === 'urgent').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {announcements.filter(a => a.priority === 'high').length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {announcements.filter(a => isRecent(a.createdAt)).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(announcement.priority)}
                            <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                            {isRecent(announcement.createdAt) && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                              {announcement.priority}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {announcement.audience}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-gray-700 leading-relaxed">
                          {expandedAnnouncement === announcement.id ? (
                            <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
                          ) : (
                            <div>
                              <p className="line-clamp-3">{announcement.content.replace(/<[^>]*>/g, '')}</p>
                              {announcement.content.length > 200 && (
                                <button
                                  onClick={() => setExpandedAnnouncement(announcement.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                                >
                                  Read more...
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {expandedAnnouncement === announcement.id && announcement.content.length > 200 && (
                          <button
                            onClick={() => setExpandedAnnouncement(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Show less
                          </button>
                        )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{getTimeAgo(announcement.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Audience: {announcement.audience}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterPriority !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No announcements available at the moment'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
