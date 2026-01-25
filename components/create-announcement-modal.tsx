'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Mail, Users } from 'lucide-react'

interface CreateAnnouncementModalProps {
  onClose: () => void
  onSubmit: (data: {
    title: string
    content: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    audience: 'all' | 'hr' | 'employee' | 'candidate'
    sendEmail: boolean
  }) => void
  sendingEmail: boolean
}

export function CreateAnnouncementModal({ onClose, onSubmit, sendingEmail }: CreateAnnouncementModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    audience: 'all' as 'all' | 'hr' | 'employee' | 'candidate',
    sendEmail: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const getAudienceDescription = (audience: string) => {
    switch (audience) {
      case 'all': return 'All users in the system'
      case 'hr': return 'HR staff only'
      case 'employee': return 'Current employees only'
      case 'candidate': return 'Training candidates only'
      default: return ''
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'normal': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create Announcement</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Announcement Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter your announcement content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className={`mt-2 px-3 py-2 rounded-lg border ${getPriorityColor(formData.priority)}`}>
                  <p className="text-sm font-medium">
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="hr">HR Staff</option>
                  <option value="employee">Employees</option>
                  <option value="candidate">Candidates</option>
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {getAudienceDescription(formData.audience)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="sendEmail"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="sendEmail" className="flex items-center gap-2 font-medium text-blue-900 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    Send Email Notification
                  </label>
                  <p className="text-sm text-blue-700 mt-1">
                    Send this announcement via email to all selected audience members. 
                    Email will be sent using the configured SMTP settings.
                  </p>
                </div>
              </div>
            </div>

            {sendingEmail && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-800">
                    Sending email notifications to {formData.audience} audience...
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={sendingEmail}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendingEmail}>
                {sendingEmail ? 'Sending...' : 'Create Announcement'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
