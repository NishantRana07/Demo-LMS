'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Briefcase,
  MessageSquare,
  UserCheck,
  Clock,
  Star,
  Award
} from 'lucide-react'
import { getCurrentUser, getAllUsers } from '@/lib/storage'
import type { User as UserType } from '@/lib/storage'

export default function TeamPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setUsers(getAllUsers())
    setLoading(false)
  }, [router])

  const teamMembers = users.filter(user => 
    user.isActive && user.id !== currentUser?.id
  )

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment
    
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(teamMembers.map(member => member.department).filter(Boolean)))

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'hr': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      case 'candidate': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

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
              <h1 className="text-3xl font-bold text-foreground">Team</h1>
              <p className="text-muted-foreground mt-2">Connect with your team members</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{teamMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online Now</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {teamMembers.filter(m => m.status === 'online').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{departments.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold text-foreground mt-1">3</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Department Filter */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDepartment === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepartment('all')}
              >
                All Departments
              </Button>
              {departments.map(dept => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeamMembers.map((member) => (
              <Card key={member.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status || 'offline')} rounded-full border-2 border-background`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    
                    {member.department && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{member.department}</span>
                      </div>
                    )}
                    
                    {member.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{member.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 bg-gray-200 rounded-full border-2 border-background flex items-center justify-center">
                            <span className="text-xs">+{i}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 10) + 5} connections
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2 flex-1">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTeamMembers.length === 0 && (
            <Card className="bg-card border border-border">
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </Card>
          )}

          {/* Team Activity */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Team Activity</h2>
            <Card className="bg-card border border-border">
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { user: 'Sarah Johnson', action: 'completed course', target: 'Advanced React Patterns', time: '2 hours ago' },
                    { user: 'Mike Chen', action: 'joined meeting', target: 'Team Standup', time: '3 hours ago' },
                    { user: 'Emily Davis', action: 'earned badge', target: 'Quick Learner', time: '5 hours ago' },
                    { user: 'Alex Wilson', action: 'started course', target: 'JavaScript Fundamentals', time: '1 day ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
