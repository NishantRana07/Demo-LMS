'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { microsoftAuth } from '@/lib/microsoft-auth'
import { getCurrentUser, setCurrentUser, createUser } from '@/lib/storage'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function MicrosoftCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        if (error) {
          setStatus('error')
          setMessage(`Authentication error: ${error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          return
        }

        // Exchange code for token
        const tokenResponse = await microsoftAuth.exchangeCodeForToken(code)
        
        // Get user info
        const userInfo = await microsoftAuth.getUserInfo(tokenResponse.access_token)
        
        // Check if user exists in our system
        let existingUser = getCurrentUser()
        
        if (!existingUser || existingUser.email !== userInfo.mail) {
          // Create new user or update existing
          const userData = {
            name: userInfo.displayName,
            email: userInfo.mail || userInfo.userPrincipalName,
            password: 'microsoft_sso', // Placeholder for SSO users
            role: 'employee' as const, // Default role, can be overridden by admin
            department: userInfo.department || '',
            joined: new Date().toISOString().split('T')[0],
            isActive: true,
            progress: 0,
            attendance: 0,
            points: 0,
            badges: []
          }

          const newUser = createUser(userData)
          setCurrentUser(newUser)
        } else {
          // Update existing user with Microsoft info
          setCurrentUser(existingUser)
        }

        // Store Microsoft tokens (in a real app, you'd store these securely)
        if (typeof window !== 'undefined') {
          localStorage.setItem('microsoft_access_token', tokenResponse.access_token)
          localStorage.setItem('microsoft_refresh_token', tokenResponse.refresh_token || '')
          localStorage.setItem('microsoft_expires_at', 
            (Date.now() + tokenResponse.expires_in * 1000).toString())
        }

        setStatus('success')
        setMessage('Successfully authenticated with Microsoft!')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Microsoft auth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating</h2>
              <p className="text-gray-600">Connecting with Microsoft...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function MicrosoftCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </Card>
      </div>
    }>
      <MicrosoftCallbackContent />
    </Suspense>
  )
}
