'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'
import type { User } from '@/lib/storage'

interface EditUserModalProps {
  onClose: () => void
  onSubmit: (userData: Partial<User>) => void
  user: User | null
}

export function EditUserModal({ onClose, onSubmit, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'hr' | 'employee' | 'candidate',
    department: '',
    joined: '',
    isActive: true,
    progress: 0,
    attendance: 0,
    points: 0
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        joined: user.joined || '',
        isActive: user.isActive,
        progress: user.progress || 0,
        attendance: user.attendance || 0,
        points: user.points || 0
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit User</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Staff</option>
                  <option value="candidate">Candidate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter department"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Join Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="joined"
                    type="date"
                    value={formData.joined}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex items-center gap-3 h-10">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active User
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Progress (%)</label>
                <Input
                  name="progress"
                  type="number"
                  value={formData.progress}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Attendance (%)</label>
                <Input
                  name="attendance"
                  type="number"
                  value={formData.attendance}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <Input
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Badges:</strong> {user.badges?.join(', ') || 'None'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Update User
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
