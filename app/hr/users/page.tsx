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
  Calendar,
  Award,
  BookOpen,
  TrendingUp
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
                <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
                <p className="text-muted-foreground mt-2">
                  Manage learners, staff, and candidates
                </p>
              </div>
              
              <Button 
                className="gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">HR Staff</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {users.filter(u => u.role === 'hr').length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {users.filter(u => u.role === 'employee').length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidates</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {users.filter(u => u.role === 'candidate').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Roles</option>
                <option value="hr">HR</option>
                <option value="employee">Employee</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>

            {/* Users List */}
            <Card className="bg-card border border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">All Users</h3>
                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </main>

        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
          />
        )}

        {editingUser && (
          <EditUserModal
            onClose={() => setEditingUser(null)}
            onSubmit={handleEditUser}
            user={editingUser}
          />
        )}
      </div>
    </div>
  )
}
