'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'
import type { User } from '@/lib/storage'

interface CreateUserModalProps {
  onClose: () => void
  onSubmit: (userData: Omit<User, 'id' | 'createdAt'>) => void
}

export function CreateUserModal({ onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'hr' | 'employee' | 'candidate',
    department: '',
    joined: new Date().toISOString().split('T')[0],
    isActive: true,
    progress: 0,
    attendance: 0,
    points: 0,
    badges: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    if (!formData.email.includes('@')) {
      alert('Please enter a valid email address')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New User</h2>
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
                <label className="block text-sm font-medium mb-2">Password *</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter department"
                />
              </div>

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
            </div>

            <div className="flex items-center gap-3">
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">User Permissions</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>HR Staff:</strong> Full access to user management, courses, announcements, and reports</p>
                <p><strong>Employee:</strong> Access to assigned courses, announcements, and personal progress</p>
                <p><strong>Candidate:</strong> Access to training courses and basic announcements</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create User
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
