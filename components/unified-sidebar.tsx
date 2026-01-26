'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Mail, 
  BarChart3, 
  MessageSquare,
  Settings,
  FileText,
  Award,
  Target,
  Building,
  UserCheck,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setCurrentUser } from '@/lib/storage'
import { useState } from 'react'

interface NavigationItem {
  href?: string
  label: string
  icon: any
  section: string
  items?: NavigationItem[]
}

interface SidebarProps {
  userRole: 'hr' | 'employee' | 'candidate'
  userName: string
}

export function UnifiedSidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { 
        href: '/dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard,
        section: 'main'
      }
    ]

    const roleSpecificItems = {
      hr: [
        {
          section: 'management',
          label: 'Management',
          icon: Users,
          items: [
            { href: '/admin/users', label: 'Users', icon: UserCheck, section: 'users' },
            { href: '/admin/courses', label: 'Courses', icon: BookOpen, section: 'courses' },
            { href: '/admin/communication', label: 'Communication', icon: MessageSquare, section: 'communication' },
            { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, section: 'analytics' },
          ]
        },
        {
          section: 'learning',
          label: 'Learning',
          icon: GraduationCap,
          items: [
            { href: '/admin/courses', label: 'Course Management', icon: BookOpen, section: 'course-mgmt' },
            { href: '/admin/badges', label: 'Badges & Awards', icon: Award, section: 'badges' },
            { href: '/admin/reports', label: 'Reports', icon: FileText, section: 'reports' },
          ]
        },
        {
          section: 'organization',
          label: 'Organization',
          icon: Building,
          items: [
            { href: '/admin/calendar', label: 'Calendar', icon: Calendar, section: 'calendar' },
            { href: '/admin/meetings', label: 'Meetings', icon: Calendar, section: 'meetings' },
            { href: '/admin/settings', label: 'Settings', icon: Settings, section: 'settings' },
          ]
        }
      ],
      employee: [
        {
          section: 'learning',
          label: 'My Learning',
          icon: BookOpen,
          items: [
            { href: '/courses', label: 'All Courses', icon: BookOpen, section: 'all-courses' },
            { href: '/my-courses', label: 'My Courses', icon: Target, section: 'my-courses' },
            { href: '/progress', label: 'Progress', icon: BarChart3, section: 'progress' },
            { href: '/badges', label: 'My Badges', icon: Award, section: 'my-badges' },
          ]
        },
        {
          section: 'collaboration',
          label: 'Collaboration',
          icon: MessageSquare,
          items: [
            { href: '/communication', label: 'Messages', icon: Mail, section: 'messages' },
            { href: '/meetings', label: 'Meetings', icon: Calendar, section: 'emp-meetings' },
            { href: '/team', label: 'Team', icon: Users, section: 'team' },
          ]
        }
      ],
      candidate: [
        {
          section: 'learning',
          label: 'Learning',
          icon: BookOpen,
          items: [
            { href: '/courses', label: 'Browse Courses', icon: BookOpen, section: 'browse-courses' },
            { href: '/my-courses', label: 'My Progress', icon: Target, section: 'my-progress' },
            { href: '/badges', label: 'Achievements', icon: Award, section: 'achievements' },
          ]
        },
        {
          section: 'resources',
          label: 'Resources',
          icon: FileText,
          items: [
            { href: '/resources', label: 'Learning Materials', icon: FileText, section: 'materials' },
            { href: '/support', label: 'Support', icon: MessageSquare, section: 'support' },
          ]
        }
      ]
    }

    return [...baseItems, ...(roleSpecificItems[userRole] || [])]
  }

  const navItems = getNavigationItems()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname === href
  }

  const isSectionActive = (section: string, items?: NavigationItem[]) => {
    if (!items) return false
    return items.some(item => item.href && isActive(item.href))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getRoleColor = () => {
    switch (userRole) {
      case 'hr':
        return 'from-slate-900 to-slate-800'
      case 'employee':
        return 'from-blue-900 to-blue-800'
      case 'candidate':
        return 'from-purple-900 to-purple-800'
      default:
        return 'from-gray-900 to-gray-800'
    }
  }

  const getRoleAccentColor = () => {
    switch (userRole) {
      case 'hr':
        return 'bg-blue-500'
      case 'employee':
        return 'bg-green-500'
      case 'candidate':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'hr':
        return UserCheck
      case 'employee':
        return Briefcase
      case 'candidate':
        return GraduationCap
      default:
        return Users
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b ${getRoleColor()} text-white flex flex-col z-50`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-center">
          <div className="p-3 bg-white rounded-lg shadow-lg">
            <img 
              src="/logo.png" 
              alt="QEdge" 
              className="w-24 h-auto rounded"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${getRoleAccentColor()} rounded-full flex items-center justify-center`}>
            <RoleIcon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-white/60 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="space-y-2">
          {navItems.map((item) => {
            if (item.items) {
              const isExpanded = expandedSection === item.section
              const isSectionActiveState = isSectionActive(item.section, item.items)
              const ItemIcon = item.icon

              return (
                <div key={item.section}>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection(item.section)}
                    className={`w-full justify-start gap-3 mb-1 ${
                      isSectionActiveState 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {item.items?.map((subItem) => {
                        const SubIcon = subItem.icon
                        const active = subItem.href ? isActive(subItem.href) : false
                        
                        return (
                          <Link key={subItem.section} href={subItem.href || '#'}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start gap-3 text-sm ${
                                active 
                                  ? 'bg-white/20 text-white' 
                                  : 'text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <SubIcon className="w-3 h-3" />
                              {subItem.label}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            } else {
              const Icon = item.icon
              const active = isActive(item.href || '')
              
              return (
                <Link key={item.href} href={item.href || '#'}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      active 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            }
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/80 hover:bg-white/10"
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/80 hover:bg-white/10"
            onClick={() => router.push('/help')}
          >
            <FileText className="w-4 h-4" />
            Help & Support
          </Button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
