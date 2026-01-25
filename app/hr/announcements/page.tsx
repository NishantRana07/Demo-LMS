'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Megaphone,
  Calendar,
  Users,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Send,
  X
} from 'lucide-react'
import { 
  getCurrentUser, 
  getAnnouncements,
  createAnnouncement,
  initializeStorage
} from '@/lib/storage'
import { sendAnnouncementEmail, generateAnnouncementEmailHTML, getRecipientEmails } from '@/lib/email'
import type { User, Announcement } from '@/lib/storage'
import { CreateAnnouncementModal } from '@/components/create-announcement-modal'

export default function HRAnnouncements() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAudience, setFilterAudience] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setAnnouncements(getAnnouncements())
    setLoading(false)
  }, [router])

  const handleCreateAnnouncement = async (announcementData: {
    title: string
    content: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    audience: 'all' | 'hr' | 'employee' | 'candidate'
    sendEmail: boolean
  }) => {
    try {
      // Create announcement in storage
      const newAnnouncement = createAnnouncement({
        title: announcementData.title,
        content: announcementData.content,
        priority: announcementData.priority,
        audience: announcementData.audience
      })
      
      setAnnouncements(getAnnouncements())
      
      // Send email if requested
      if (announcementData.sendEmail) {
        setSendingEmail(true)
        const recipientEmails = getRecipientEmails(announcementData.audience)
        
        if (recipientEmails.length > 0) {
          const emailHTML = generateAnnouncementEmailHTML(
            announcementData.title,
            announcementData.content,
            announcementData.priority,
            currentUser?.name || 'HR Admin'
          )
          
          const emailResult = await sendAnnouncementEmail({
            to: recipientEmails,
            subject: `Announcement: ${announcementData.title}`,
            htmlContent: emailHTML,
            senderId: currentUser?.id || 'hr-admin'
          })
          
          setEmailStatus(emailResult)
        } else {
          setEmailStatus({ success: false, message: 'No recipients found for the selected audience' })
        }
        
        setSendingEmail(false)
      }
      
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating announcement:', error)
      setEmailStatus({ success: false, message: 'Failed to create announcement' })
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority
    const matchesAudience = filterAudience === 'all' || announcement.audience === filterAudience
    return matchesSearch && matchesPriority && matchesAudience
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

  const getAudienceColor = (audience: string) => {
    switch(audience) {
      case 'all': return 'bg-purple-100 text-purple-800'
      case 'hr': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      case 'candidate': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
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
              <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
              <p className="text-muted-foreground mt-2">
                Manage company-wide communications and notifications
              </p>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Create Announcement
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Announcements</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{announcements.length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {announcements.filter(a => a.priority === 'urgent').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {announcements.filter(a => a.priority === 'high').length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {announcements.filter(a => {
                      const created = new Date(a.createdAt)
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return created > weekAgo
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Audiences</option>
              <option value="all">All Users</option>
              <option value="hr">HR Staff</option>
              <option value="employee">Employees</option>
              <option value="candidate">Candidates</option>
            </select>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(announcement.priority)}
                            <h3 className="text-lg font-semibold text-foreground">{announcement.title}</h3>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                              {announcement.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(announcement.audience)}`}>
                              {announcement.audience}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {announcement.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                              <Send className="h-4 w-4" />
                              Resend
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
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
                <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No announcements found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterPriority !== 'all' || filterAudience !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by creating your first announcement'}
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              </Card>
            )}
          </div>

          {/* Email Status Notification */}
          {emailStatus && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              emailStatus.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {emailStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span>{emailStatus.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailStatus(null)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAnnouncement}
          sendingEmail={sendingEmail}
        />
      )}
    </div>
  )
}
