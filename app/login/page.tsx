'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MicrosoftLoginButton } from '@/components/microsoft-login-button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Initialize storage on mount
    if (typeof window !== 'undefined') {
      try {
        // Demo users - only initialize if no users exist
        const demoUsers = [
          {
            id: 'user-hr-1',
            email: 'hr@company.com',
            password: 'admin123',
            role: 'hr',
            name: 'Sarah Johnson',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'user-emp-1',
            email: 'user@company.com',
            password: 'user123',
            role: 'employee',
            name: 'John Smith',
            createdAt: new Date().toISOString(),
          },
        ]

        if (!localStorage.getItem('qedge_users')) {
          localStorage.setItem('qedge_users', JSON.stringify(demoUsers))
        } else {
          // Ensure HR user exists with correct role
          const existingUsers = JSON.parse(localStorage.getItem('qedge_users') || '[]')
          const hrUser = existingUsers.find((u: any) => u.email === 'hr@company.com')
          if (!hrUser || hrUser.role !== 'hr') {
            // Update or add HR user with correct role
            const updatedUsers = existingUsers.filter((u: any) => u.email !== 'hr@company.com')
            updatedUsers.push({
              id: 'user-hr-1',
              email: 'hr@company.com',
              password: 'admin123',
              role: 'hr',
              name: 'Sarah Johnson',
              createdAt: new Date().toISOString(),
            })
            localStorage.setItem('qedge_users', JSON.stringify(updatedUsers))
          }
        }

        // Initialize other storage if needed
        if (!localStorage.getItem('qedge_courses')) {
          localStorage.setItem('qedge_courses', JSON.stringify([]))
        }
        if (!localStorage.getItem('qedge_meetings')) {
          localStorage.setItem('qedge_meetings', JSON.stringify([]))
        }
        if (!localStorage.getItem('qedge_notifications')) {
          localStorage.setItem('qedge_notifications', JSON.stringify([]))
        }
        if (!localStorage.getItem('qedge_emails')) {
          localStorage.setItem('qedge_emails', JSON.stringify([]))
        }
      } catch (e) {
        console.error('[v0] Error initializing storage:', e)
      }
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const usersStr = localStorage.getItem('qedge_users')
      const users = usersStr ? JSON.parse(usersStr) : []
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (user) {
        localStorage.setItem('qedge_current_user', JSON.stringify(user))
        // Redirect HR users to HR dashboard, others to unified dashboard
        router.push(user.role === 'hr' ? '/hr/dashboard' : '/dashboard')
      } else {
        setError('Invalid email or password. Try hr@company.com/admin123 or user@company.com/user123')
      }
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-6 bg-white rounded-2xl shadow-xl mb-6">
            <img 
              src="/logo.png" 
              alt="QEdge" 
              className="w-40 h-auto rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QEdge</h1>
          <p className="text-gray-600">HR Learning Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Demo Credentials Hint */}
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 border border-blue-200">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <p className="mb-1">
                  HR Admin: <span className="font-mono text-xs">hr@company.com/admin123</span>
                </p>
                <p>
                  Employee: <span className="font-mono text-xs">user@company.com/user123</span>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <MicrosoftLoginButton className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">This is a demo environment. All data is stored locally.</p>
      </div>
    </div>
  )
}
