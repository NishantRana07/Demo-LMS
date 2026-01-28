'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRFallbackPage } from '@/components/hr-fallback-page'
import { getCurrentUser } from '@/lib/storage'

export default function HRIntegrationsWebinars() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="animate-pulse bg-gray-200 h-full w-full"></div>
      </div>
    )
  }

  return (
    <HRFallbackPage 
      userName={currentUser?.name || ''}
      title="Webinar Integration"
      description="This is a demo environment. Pages will be created according to the client's needs. The Webinar Integration module will enable seamless connectivity with popular webinar platforms like Zoom, Microsoft Teams, and Google Meet, allowing you to schedule, manage, and track virtual training sessions directly within the HR Learning Management System."
    />
  )
}
