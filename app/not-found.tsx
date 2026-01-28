'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Search, 
  Home, 
  BookOpen, 
  Users, 
  Settings,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Zap,
  Wrench,
  Construction,
  AlertCircle
} from 'lucide-react'
import { getCurrentUser } from '@/lib/storage'

export default function NotFound() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  if (!mounted) {
    return null
  }

  const getDashboardLink = () => {
    if (!currentUser) return '/login'
    switch (currentUser.role) {
      case 'hr': return '/hr/dashboard'
      case 'admin': return '/admin/dashboard'
      case 'employee': return '/employee/dashboard'
      default: return '/login'
    }
  }

  const getRoleSpecificLinks = () => {
    if (!currentUser) return []
    
    switch (currentUser.role) {
      case 'hr':
        return [
          { href: '/hr/dashboard', label: 'HR Dashboard', icon: Home },
          { href: '/hr/courses', label: 'Courses', icon: BookOpen },
          { href: '/hr/users', label: 'Users', icon: Users },
          { href: '/hr/settings', label: 'Settings', icon: Settings },
        ]
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Admin Dashboard', icon: Home },
          { href: '/admin/courses', label: 'Courses', icon: BookOpen },
          { href: '/admin/users', label: 'Users', icon: Users },
        ]
      case 'employee':
        return [
          { href: '/employee/dashboard', label: 'My Dashboard', icon: Home },
          { href: '/employee/courses', label: 'My Courses', icon: BookOpen },
          { href: '/employee/meetings', label: 'Meetings', icon: Users },
        ]
      default:
        return [
          { href: '/login', label: 'Login', icon: Home },
        ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main 404 Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Icon Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white text-center">
                  <span className="text-5xl font-bold">404</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Demo Environment Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">
                    Demo Environment Notice
                  </h2>
                  <p className="text-blue-800 leading-relaxed">
                    This is a demo environment of the Learning Management System (LMS). 
                    Pages and features will be added and customized according to the specific needs of each client. 
                    The current implementation showcases the core functionality and design patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Status Indicators */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                <Construction className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">In Development</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Demo Mode</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Enterprise Ready</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href={getDashboardLink()}>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          {currentUser && getRoleSpecificLinks().length > 1 && (
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Quick Links
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getRoleSpecificLinks().map((link, index) => {
                  const Icon = link.icon
                  return (
                    <Link key={index} href={link.href}>
                      <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-gray-900">{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-sm text-gray-600">
                Enterprise-grade security with role-based access control
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <Zap className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Optimized performance for seamless learning experience
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <Wrench className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Customizable</h3>
              <p className="text-sm text-gray-600">
                Tailored solutions to meet your organization's needs
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">support@lms-demo.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">+91 989-229-9558</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Learning Management System. This is a demonstration platform.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Pages and features are customized based on client requirements
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
