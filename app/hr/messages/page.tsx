'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRFallbackPage } from '@/components/hr-fallback-page'
import { getCurrentUser } from '@/lib/storage'

export default function HRMessages() {
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
      title="Messages & Communications"
      description="This is a demo environment. Pages will be created according to the client's needs. The Messages & Communications module will provide a comprehensive messaging system for internal communications, announcements, and team collaboration within the HR Learning Management System."
    />
  )
}
