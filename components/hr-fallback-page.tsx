'use client'

import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Construction, 
  AlertCircle, 
  ArrowLeft,
  Settings,
  Wrench,
  Shield,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/storage'

interface HRFallbackPageProps {
  userName?: string
  title?: string
  description?: string
}

export function HRFallbackPage({ 
  userName = '', 
  title = 'Feature Coming Soon',
  description = 'Please note this is a demo environment. Certain features are shown in preview mode and will be fully enabled and customized during implementation based on requirements.'
}: HRFallbackPageProps) {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToDashboard = () => {
    router.push('/hr/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      <HRSidebar userName={userName} />
      
      <main className="flex-1 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {/* Main Card */}
            <Card className="p-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
              {/* Icon Section */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Construction className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Wrench className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {title}
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {description}
                </p>

                {/* Feature Status Indicators */}
                <div className="flex justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">In Development</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Preview Mode</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
                  <p className="text-sm text-gray-600">Enterprise-grade security</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Fast</h3>
                  <p className="text-sm text-gray-600">Optimized performance</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <Wrench className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Customizable</h3>
                  <p className="text-sm text-gray-600">Tailored to your needs</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGoToDashboard}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Demo Environment Notice</h4>
                    <p className="text-sm text-blue-800">
                      This is a demonstration of the HR Learning Management System. 
                      The feature you're trying to access is currently under development 
                      and will be available in the full implementation.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Footer Note */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Need help? Contact your system administrator for more information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
