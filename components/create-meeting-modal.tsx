'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Users, Calendar, Clock, Video, Monitor, Phone, Link } from 'lucide-react'
import { getAllUsers } from '@/lib/storage'

interface CreateMeetingModalProps {
  onClose: () => void
  onSubmit: (meetingData: {
    title: string
    description: string
    scheduledAt: string
    participants: string[]
    platform: 'teams' | 'meet' | 'zoom' | 'custom'
    customUrl?: string
  }) => void
}

export function CreateMeetingModal({ onClose, onSubmit }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    platform: 'teams' as 'teams' | 'meet' | 'zoom' | 'custom',
    customUrl: '',
    participants: [] as string[]
  })

  const [availableUsers] = useState(getAllUsers())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.scheduledAt) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.platform === 'custom' && !formData.customUrl) {
      alert('Please provide a custom meeting URL')
      return
    }

    if (formData.participants.length === 0) {
      alert('Please select at least one participant')
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleParticipantToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }))
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'teams': return <Monitor className="h-5 w-5 text-blue-600" />
      case 'meet': return <Video className="h-5 w-5 text-green-600" />
      case 'zoom': return <Phone className="h-5 w-5 text-blue-500" />
      case 'custom': return <Link className="h-5 w-5 text-gray-600" />
      default: return <Video className="h-5 w-5" />
    }
  }

  const getPlatformDescription = (platform: string) => {
    switch (platform) {
      case 'teams': return 'Microsoft Teams meeting with chat, screen sharing, and recording'
      case 'meet': return 'Google Meet with simple video conferencing'
      case 'zoom': return 'Zoom meeting with advanced features and breakout rooms'
      case 'custom': return 'Use your own meeting link (WebEx, Skype, etc.)'
      default: return ''
    }
  }

  const setMinimumDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Schedule New Meeting</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date & Time *</label>
                <Input
                  name="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  min={setMinimumDateTime()}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter meeting description and agenda"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meeting Platform *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['teams', 'meet', 'zoom', 'custom'] as const).map((platform) => (
                  <div
                    key={platform}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      formData.platform === platform
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, platform }))}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={platform}
                      checked={formData.platform === platform}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      {getPlatformIcon(platform)}
                      <span className="mt-2 font-medium capitalize">{platform}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {platform === 'teams' && 'Microsoft'}
                        {platform === 'meet' && 'Google'}
                        {platform === 'zoom' && 'Zoom'}
                        {platform === 'custom' && 'Custom'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {getPlatformDescription(formData.platform)}
              </p>
            </div>

            {formData.platform === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Meeting URL *</label>
                <Input
                  name="customUrl"
                  type="url"
                  value={formData.customUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/meeting-room"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Participants ({formData.participants.length} selected)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={formData.participants.includes(user.id)}
                        onChange={() => handleParticipantToggle(user.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label htmlFor={`user-${user.id}`} className="font-medium cursor-pointer">
                          {user.name}
                        </label>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'hr' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Meeting Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Meeting invitations will be sent to all selected participants</p>
                <p>• Calendar invites will be automatically generated</p>
                <p>• Meeting link will be available for participants to join</p>
                {formData.platform === 'teams' && <p>• Teams meeting will include chat, screen sharing, and recording capabilities</p>}
                {formData.platform === 'meet' && <p>• Google Meet will be accessible via web browser and mobile app</p>}
                {formData.platform === 'zoom' && <p>• Zoom meeting will support breakout rooms and advanced features</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Schedule Meeting
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
