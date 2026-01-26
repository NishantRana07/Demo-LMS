'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect - let individual pages handle auth
    try {
      const userStr = localStorage.getItem('qedge_current_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        // Redirect HR users to HR dashboard, others to unified dashboard
        router.push(user.role === 'hr' ? '/hr/dashboard' : '/dashboard')
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-8 bg-white rounded-2xl shadow-xl mb-6">
          <img src="/logo.png" alt="QEdge" className="w-48 h-auto rounded-lg" />
        </div>
        <p className="text-muted-foreground text-lg">Unified HR Learning Platform</p>
        <p className="text-sm text-muted-foreground/60 mt-4">Initializing...</p>
      </div>
    </div>
  )
}
