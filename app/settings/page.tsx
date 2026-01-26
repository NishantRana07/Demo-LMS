'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Lock,
  Smartphone,
  Globe,
  HelpCircle,
  LogOut
} from 'lucide-react'
import { getCurrentUser, setCurrentUser } from '@/lib/storage'

export default function SettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'en'
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUserState(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      notifications: true,
      emailNotifications: true,
      darkMode: false,
      language: 'en'
    })
    setLoading(false)
  }, [router])

  const handleSave = () => {
    const updatedUser = {
      ...currentUser,
      name: formData.name,
      email: formData.email
    }
    setCurrentUser(updatedUser)
    setCurrentUserState(updatedUser)
    // Show success message (you could add a toast notification here)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                    <Shield className="h-4 w-4" />
                    Security
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                    <Smartphone className="h-4 w-4" />
                    Devices
                  </Button>
                  <Separator />
                  <Button variant="ghost" className="w-full justify-start gap-3 text-left text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    Help & Support
                  </Button>
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={currentUser?.role || ''}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                    </div>
                    <Switch
                      checked={formData.notifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                </div>
              </Card>

              {/* Appearance Settings */}
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme across the platform</p>
                    </div>
                    <Switch
                      checked={formData.darkMode}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="mt-1 w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
              </div>

              {/* Danger Zone */}
              <Card className="bg-card border border-border p-6 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <LogOut className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-foreground">Account Actions</h2>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
