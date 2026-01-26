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
  Layers,
  UserPlus,
  Upload,
  Link as LinkIcon,
  Clipboard,
  FileSpreadsheet,
  Database,
  Shield,
  Save,
  Star,
  Trophy,
  PlayCircle,
  Globe,
  MessageCircle,
  Smartphone,
  ImageIcon,
  Home,
  LogIn as LoginIcon,
  Tags as TagsIcon,
  Fingerprint,
  Zap,
  Bell,
  Wifi,
  Cpu
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
      section: 'users',
      title: 'User Management',
      icon: Users,
      items: [
        { href: '/hr/users', title: 'View Users', icon: UserCheck },
        { href: '/hr/users/add', title: 'Add User', icon: UserPlus },
        { href: '/hr/users/import', title: 'Import/Bulk', icon: Upload },
        { href: '/hr/users/relationships', title: 'Trainee Relationships', icon: LinkIcon }
      ]
    },
    {
      section: 'batches',
      title: 'Batches',
      icon: Layers,
      items: [
        { href: '/hr/batches', title: 'All Batches', icon: Layers },
        { href: '/hr/batches/create', title: 'Create Batch', icon: UserPlus },
        { href: '/hr/batches/schedule', title: 'Schedule', icon: Calendar }
      ]
    },
    {
      section: 'evaluations',
      title: 'Evaluations',
      icon: Clipboard,
      items: [
        { href: '/hr/evaluations/exam', title: 'Exam', icon: Clipboard },
        { href: '/hr/evaluations/assignment', title: 'Assignment', icon: FileText },
        { href: '/hr/evaluations/question-bank', title: 'Question Bank', icon: HelpCircle },
        { href: '/hr/evaluations/skills', title: 'Skills', icon: Award }
      ]
    },
    {
      section: 'forms',
      title: 'Forms',
      icon: FileSpreadsheet,
      items: [
        { href: '/hr/forms', title: 'All Forms', icon: FileSpreadsheet },
        { href: '/hr/forms/create', title: 'Create Form', icon: UserPlus },
        { href: '/hr/forms/responses', title: 'Responses', icon: MessageSquare }
      ]
    },
    {
      section: 'reports',
      title: 'Reports',
      icon: BarChart3,
      items: [
        { href: '/hr/reports/course', title: 'Course', icon: BookOpen },
        { href: '/hr/reports/trainees', title: 'Trainees', icon: Users },
        { href: '/hr/reports/branch', title: 'Branch', icon: Building },
        { href: '/hr/reports/department', title: 'Department', icon: Briefcase },
        { href: '/hr/reports/designation', title: 'Designation', icon: GraduationCap },
        { href: '/hr/reports/batch', title: 'Batch', icon: Layers },
        { href: '/hr/reports/exams', title: 'Exams', icon: Clipboard },
        { href: '/hr/reports/skills', title: 'Skills', icon: Award },
        { href: '/hr/reports/engagement', title: 'Engagement Analytics', icon: BarChart3 },
        { href: '/hr/reports/enrollment', title: 'Enrollment Report', icon: Target },
        { href: '/hr/reports/leaderboard', title: 'Leaderboard', icon: Trophy },
        { href: '/hr/reports/badges', title: 'Badges', icon: Star },
        { href: '/hr/reports/learning-path', title: 'Learning Path', icon: BookOpen },
        { href: '/hr/reports/classrooms', title: 'Classrooms', icon: Building },
        { href: '/hr/reports/mail-activity', title: 'Mail Activity', icon: Mail },
        { href: '/hr/reports/active-users', title: 'Active User Report', icon: Users },
        { href: '/hr/reports/logs', title: 'Log', icon: FileText },
        { href: '/hr/reports/audit-trail', title: 'Audit Trail', icon: Shield },
        { href: '/hr/reports/transactions', title: 'Transaction', icon: Database },
        { href: '/hr/reports/saved', title: 'Saved Reports', icon: Save },
        { href: '/hr/reports/custom', title: 'Custom Reports', icon: Settings }
      ]
    },
    {
      section: 'customize',
      title: 'Customize',
      icon: Palette,
      items: [
        { href: '/hr/customize/logo', title: 'Logo', icon: ImageIcon },
        { href: '/hr/customize/favicon', title: 'Favicon', icon: ImageIcon },
        { href: '/hr/customize/home', title: 'Home Page', icon: Home },
        { href: '/hr/customize/login', title: 'Login Page', icon: LoginIcon },
        { href: '/hr/customize/ui', title: 'User Interface', icon: LayoutDashboard },
        { href: '/hr/customize/labels', title: 'Labels', icon: TagsIcon },
        { href: '/hr/customize/email', title: 'Email Address', icon: Mail },
        { href: '/hr/customize/email-templates', title: 'Email Templates', icon: FileText },
        { href: '/hr/customize/whatsapp-templates', title: 'Whatsapp Templates', icon: MessageCircle },
        { href: '/hr/customize/trainee-profile', title: 'Trainee Profile', icon: UserCheck },
        { href: '/hr/customize/custom-fields', title: 'Custom User Fields', icon: UserPlus },
        { href: '/hr/customize/sso', title: 'SSO', icon: Fingerprint },
        { href: '/hr/customize/quick-start', title: 'Quick Start Guide', icon: HelpCircle }
      ]
    },
    {
      section: 'settings',
      title: 'Settings',
      icon: Cog,
      items: [
        { href: '/hr/settings/features', title: 'Manage Features', icon: Settings },
        { href: '/hr/settings/automation', title: 'Automation', icon: Zap },
        { href: '/hr/settings/branch', title: 'Branch', icon: Building },
        { href: '/hr/settings/department', title: 'Department', icon: Briefcase },
        { href: '/hr/settings/designation', title: 'Designation', icon: GraduationCap },
        { href: '/hr/settings/skills', title: 'Skills', icon: Award },
        { href: '/hr/settings/venue', title: 'Venue', icon: Building },
        { href: '/hr/settings/zone', title: 'Zone', icon: Wifi },
        { href: '/hr/settings/reminders', title: 'Reminders', icon: Bell },
        { href: '/hr/settings/tags', title: 'Tags', icon: TagsIcon },
        { href: '/hr/settings/ai-credits', title: 'AI Credits', icon: Cpu }
      ]
    },
    {
      section: 'gamification',
      title: 'Gamification',
      icon: Trophy,
      items: [
        { href: '/hr/gamification/leaderboard', title: 'Leaderboard', icon: Trophy },
        { href: '/hr/gamification/badges', title: 'Badges', icon: Star },
        { href: '/hr/gamification/points', title: 'Points System', icon: Target },
        { href: '/hr/gamification/achievements', title: 'Achievements', icon: Award }
      ]
    },
    {
      section: 'integrations',
      title: 'Integrations',
      icon: Plug,
      items: [
        { href: '/hr/integrations/webinars', title: 'Webinars/Meetings', icon: Video },
        { href: '/hr/integrations/vimeo', title: 'Vimeo', icon: PlayCircle },
        { href: '/hr/integrations/go1', title: 'Go1', icon: Globe },
        { href: '/hr/integrations/sms', title: 'SMS', icon: MessageCircle },
        { href: '/hr/integrations/whatsapp', title: 'Whatsapp', icon: Smartphone }
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
      section: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      items: [
        { href: '/hr/announcements', title: 'Announcements', icon: Megaphone },
        { href: '/hr/meetings', title: 'Meetings', icon: Video },
        { href: '/hr/messages', title: 'Messages', icon: Mail }
      ]
    },
    {
      section: 'support',
      title: 'Support',
      icon: HelpCircle,
      items: [
        { href: '/hr/help', title: 'Help Center', icon: HelpCircle },
        { href: '/hr/support', title: 'Support Tickets', icon: MessageSquare }
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
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen z-50">
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
                    <span className="flex-1 text-left">{item.title || item.label}</span>
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
                    {item.title || item.label}
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
