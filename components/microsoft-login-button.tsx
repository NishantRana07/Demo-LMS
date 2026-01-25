'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { microsoftAuth } from '@/lib/microsoft-auth'
import { Loader2 } from 'lucide-react'

interface MicrosoftLoginButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function MicrosoftLoginButton({ 
  className = '', 
  variant = 'outline',
  size = 'default'
}: MicrosoftLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true)
      
      // Check if Microsoft auth is configured
      const config = microsoftAuth.getConfigurationStatus()
      if (!config.fullyConfigured) {
        alert('Microsoft authentication is not properly configured. Please contact your administrator.')
        return
      }

      // Redirect to Microsoft login
      const authUrl = microsoftAuth.getAuthorizationUrl()
      window.location.href = authUrl
      
    } catch (error) {
      console.error('Microsoft login error:', error)
      alert('Failed to initiate Microsoft login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleMicrosoftLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.4 10.8H0V0h11.4v10.8zM12.6 0H24v10.8H12.6V0zM0 12h11.4V24H0V12zM12.6 12H24V24H12.6V12z"
            fill="#F3F2F1"
          />
          <path
            d="M11.4 10.8H0V0h11.4v10.8z"
            fill="#F35325"
          />
          <path
            d="M12.6 0H24v10.8H12.6V0z"
            fill="#81BC06"
          />
          <path
            d="M0 12h11.4V24H0V12z"
            fill="#05A6F0"
          />
          <path
            d="M12.6 12H24V24H12.6V12z"
            fill="#FFBA08"
          />
        </svg>
      )}
      {isLoading ? 'Connecting...' : 'Sign in with Microsoft'}
    </Button>
  )
}
