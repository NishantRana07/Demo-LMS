'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  BookOpen,
  Zap,
  Shield,
  Crown,
  Medal,
  Gem
} from 'lucide-react'
import { getCurrentUser, getBadges } from '@/lib/storage'
import type { Badge } from '@/lib/storage'

export default function BadgesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setBadges(getBadges())
    setLoading(false)
  }, [router])

  const userBadges = (currentUser?.badges || []).map((badgeId: string) => 
    badges.find(b => b.id === badgeId)
  ).filter(Boolean)

  const availableBadges = badges.filter(badge => 
    !(currentUser?.badges || []).includes(badge.id)
  )

  const getBadgeIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'star': Star,
      'trophy': Trophy,
      'target': Target,
      'book': BookOpen,
      'zap': Zap,
      'shield': Shield,
      'crown': Crown,
      'medal': Medal,
      'gem': Gem
    }
    return iconMap[iconName] || Award
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
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
            <h1 className="text-3xl font-bold text-foreground">My Badges</h1>
            <p className="text-muted-foreground mt-2">Showcase your achievements and earned badges</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{userBadges.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {userBadges.reduce((sum: number, badge: Badge) => sum + (badge?.points || 0), 0)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Badge</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{availableBadges.length} available</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Earned Badges */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Earned Badges</h2>
            
            {userBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBadges.map((badge: Badge) => {
                  const Icon = getBadgeIcon(badge?.icon || 'star')
                  
                  return (
                    <Card key={badge?.id} className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                        <div className="absolute top-2 right-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-bold text-lg">{badge?.name}</h3>
                          <p className="text-white/80 text-sm">{badge?.points} points</p>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          {badge?.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Earned
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(badge?.earnedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-card border border-border">
                <div className="p-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No badges earned yet</h3>
                  <p className="text-muted-foreground mb-4">Complete courses and achieve milestones to earn badges</p>
                  <Button onClick={() => router.push('/courses')}>
                    Start Learning
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Available Badges */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Available Badges</h2>
            
            {availableBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBadges.map((badge) => {
                  const Icon = getBadgeIcon(badge?.icon || 'star')
                  
                  return (
                    <Card key={badge?.id} className="bg-card border border-border overflow-hidden opacity-75">
                      <div className="relative h-32 bg-gradient-to-r from-gray-400 to-gray-600 p-4">
                        <div className="absolute top-2 right-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-bold text-lg">{badge?.name}</h3>
                          <p className="text-white/80 text-sm">{badge?.points} points</p>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          {badge?.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Locked
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Complete requirements
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-card border border-border">
                <div className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">All badges earned!</h3>
                  <p className="text-muted-foreground">You've unlocked every available badge</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
