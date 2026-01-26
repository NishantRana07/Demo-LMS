'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
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
  Menu,
  Video,
  ClipboardList,
  Megaphone,
  FileQuestion,
  PieChart,
  HelpCircle,
  Palette,
  Cog,
  Plug,
  Brush,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setCurrentUser } from '@/lib/storage'
import { useState } from 'react'

interface SidebarProps {
  userName: string
}

interface NavigationItem {
  href: string
  title?: string
  label?: string
  icon: any
}

interface NavigationSection {
  section: string
  label?: string
  title?: string
  icon: any
  href?: string
  items?: NavigationItem[]
}

export function HRSidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<string | null>('learning')

  const navigationSections: NavigationSection[] = [
    {
      section: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/hr/dashboard'
    },
    {
      section: 'assessments',
      title: 'Assessments',
      icon: FileText,
      items: [
        { href: '/hr/assessments', title: 'All Assessments', icon: FileText },
        { href: '/hr/assessments/analytics', title: 'Analytics', icon: BarChart3 },
        { href: '/hr/assessments/questions', title: 'Question Bank', icon: HelpCircle }
      ]
    },
    {
      section: 'learning',
      label: 'Learning Management',
      icon: BookOpen,
      items: [
        { href: '/hr/courses', label: 'Courses', icon: BookOpen },
        { href: '/hr/learning-objects', label: 'Learning Objects', icon: Layers },
        { href: '/hr/classroom-sessions', label: 'Classroom Sessions', icon: Building },
        { href: '/hr/webinars', label: 'Webinars/Meetings', icon: Video },
      ]
    },
    {
      section: 'people',
      label: 'People Management',
      icon: Users,
      items: [
        { href: '/hr/users', label: 'Users', icon: UserCheck },
        { href: '/hr/batches', label: 'Batches', icon: Users },
        { href: '/hr/evaluations', label: 'Evaluations', icon: ClipboardList },
      ]
    },
    {
      section: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      items: [
        { href: '/hr/announcements', label: 'Announcements', icon: Megaphone },
        { href: '/hr/forms', label: 'Forms', icon: FileQuestion },
      ]
    },
    {
      section: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      items: [
        { href: '/hr/reports', label: 'Reports', icon: PieChart },
        { href: '/hr/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      section: 'support',
      label: 'Support',
      icon: HelpCircle,
      href: '/hr/support'
    },
    {
      section: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/hr/settings'
    },
    {
      section: 'customization',
      label: 'Customization',
      icon: Palette,
      items: [
        { href: '/hr/customize', label: 'Customize', icon: Palette },
        { href: '/hr/configuration', label: 'Configuration', icon: Cog },
        { href: '/hr/integrations', label: 'Integrations', icon: Plug },
      ]
    },
    {
      section: 'design',
      label: 'Design',
      icon: Brush,
      items: [
        { href: '/hr/themes', label: 'Themes', icon: Palette },
        { href: '/hr/branding', label: 'Branding', icon: Brush },
      ]
    }
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  const isSectionActive = (section: string, items?: any[]) => {
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

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 h-screen z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-blue-600 to-blue-700">
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
      <div className="px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60">HR Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-2">
          {navigationSections.map((item) => {
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
                        ? 'bg-blue-600 text-white' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon
                        const active = subItem.href ? isActive(subItem.href) : false
                        
                        return (
                          <Link key={subItem.href} href={subItem.href || '#'}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start gap-3 text-sm ${
                                active 
                                  ? 'bg-blue-600 text-white' 
                                  : 'text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <SubIcon className="w-3 h-3" />
                              {subItem.title || subItem.label}
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
              const active = item.href ? isActive(item.href) : false
              
              return (
                <Link key={item.href} href={item.href || '#'}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      active 
                        ? 'bg-blue-600 text-white' 
                        : 'text-white hover:bg-white/10'
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
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white hover:bg-white/10"
            onClick={() => router.push('/hr/help')}
          >
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </Button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
