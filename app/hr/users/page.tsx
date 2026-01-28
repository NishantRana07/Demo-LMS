'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Award,
  BookOpen,
  TrendingUp,
  Building,
  CheckCircle
} from 'lucide-react'
import { 
  getCurrentUser, 
  getAllUsers, 
  initializeStorage,
  updateUser,
  deleteUser,
  createUser
} from '@/lib/storage'
import type { User } from '@/lib/storage'
import { CreateUserModal } from '@/components/create-user-modal'
import { EditUserModal } from '@/components/edit-user-modal'

export default function HRUsers() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setUsers(getAllUsers())
    setLoading(false)
  }, [router])

  const handleCreateUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = createUser(userData)
    setUsers(getAllUsers())
    setShowCreateModal(false)
  }

  const handleEditUser = (userData: Partial<User>) => {
    if (editingUser) {
      updateUser(editingUser.id, userData)
      setUsers(getAllUsers())
      setEditingUser(null)
    }
  }

  const toggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      updateUser(userId, { isActive: !user.isActive })
      setUsers(getAllUsers())
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId)
      setUsers(getAllUsers())
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'hr': return 'bg-purple-100 text-purple-800'
      case 'employee': return 'bg-blue-100 text-blue-800'
      case 'candidate': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <HRSidebar userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
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
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your personal information and preferences
                </p>
              </div>
            </div>

            {/* Personal Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-2xl font-bold text-foreground mt-1 capitalize">{currentUser?.role}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="text-2xl font-bold text-foreground mt-1">HR</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold text-foreground mt-1">Active</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-2xl font-bold text-foreground mt-1">2024</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Profile Information */}
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-800">
                    {currentUser?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentUser?.name}</h2>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role || '')}`}>
                      {currentUser?.role}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{currentUser?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      Notification Settings
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
