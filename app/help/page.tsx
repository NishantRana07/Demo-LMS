'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Phone,
  Users,
  FileText,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react'
import { getCurrentUser } from '@/lib/storage'

export default function HelpPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setLoading(false)
  }, [router])

  const helpCategories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of the platform',
      icon: BookOpen,
      articles: [
        'Creating your account',
        'Navigating the dashboard',
        'Understanding your role',
        'First steps guide'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Courses & Learning',
      description: 'Everything about courses and progress',
      icon: Video,
      articles: [
        'Finding and enrolling in courses',
        'Tracking your progress',
        'Completing lessons',
        'Earning certificates'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Account & Settings',
      description: 'Manage your profile and preferences',
      icon: Users,
      articles: [
        'Updating your profile',
        'Notification settings',
        'Privacy and security',
        'Changing your password'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Communication',
      description: 'Messages and team collaboration',
      icon: MessageSquare,
      articles: [
        'Using the messaging system',
        'Scheduling meetings',
        'Team collaboration tools',
        'Announcements and updates'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const popularArticles = [
    {
      title: 'How to enroll in your first course',
      category: 'Getting Started',
      views: '2.3k',
      rating: 4.8,
      time: '5 min read'
    },
    {
      title: 'Understanding your learning progress',
      category: 'Courses & Learning',
      views: '1.8k',
      rating: 4.7,
      time: '3 min read'
    },
    {
      title: 'Setting up your profile',
      category: 'Account & Settings',
      views: '1.5k',
      rating: 4.9,
      time: '4 min read'
    },
    {
      title: 'Joining team meetings',
      category: 'Communication',
      views: '1.2k',
      rating: 4.6,
      time: '6 min read'
    }
  ]

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Security > Change Password. You\'ll need to enter your current password and then create a new one.'
    },
    {
      question: 'Can I download course materials?',
      answer: 'Yes, most courses include downloadable resources. Look for the Download Resources button in the course page.'
    },
    {
      question: 'How do I contact my instructor?',
      answer: 'You can message your instructor through the Communication tab or directly from the course page.'
    },
    {
      question: 'What happens when I complete a course?',
      answer: 'You\'ll receive a certificate and earn points. The course will be marked as completed in your progress.'
    }
  ]

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
      
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
            <p className="text-muted-foreground mt-2">Find answers and get support</p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs, and more..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold text-foreground">Live Chat</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Chat with our support team</p>
              <Button size="sm" className="w-full">Start Chat</Button>
            </Card>

            <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold text-foreground">Email Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Get help via email</p>
              <Button size="sm" variant="outline" className="w-full">Send Email</Button>
            </Card>

            <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-6 w-6 text-purple-500" />
                <h3 className="font-semibold text-foreground">Phone Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Call us Mon-Fri, 9-5</p>
              <Button size="sm" variant="outline" className="w-full">Call Now</Button>
            </Card>

            <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-6 w-6 text-orange-500" />
                <h3 className="font-semibold text-foreground">Video Tutorials</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Watch helpful videos</p>
              <Button size="sm" variant="outline" className="w-full">Watch Now</Button>
            </Card>
          </div>

          {/* Help Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Card key={index} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <div key={articleIndex} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
                            <span className="text-sm text-foreground">{article}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Popular Articles</h2>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="bg-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground flex-1">{article.title}</h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{article.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                      <span>{article.views} views</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              <Card className="bg-card border border-border">
                <div className="p-6">
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0">
                        <h3 className="font-medium text-foreground mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full gap-2">
                      <FileText className="h-4 w-4" />
                      View All FAQs
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Resources & Downloads</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <h3 className="font-semibold text-foreground">User Guide</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Complete user manual</p>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </Card>

              <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="h-6 w-6 text-green-500" />
                  <h3 className="font-semibold text-foreground">Video Tutorials</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Step-by-step videos</p>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Watch Videos
                </Button>
              </Card>

              <Card className="bg-card border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                  <h3 className="font-semibold text-foreground">API Documentation</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Developer resources</p>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Docs
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
