'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedSidebar } from '@/components/unified-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  Search, 
  Filter, 
  MessageSquare,
  Bell,
  Calendar,
  User,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react'
import { getCurrentUser, getMessages, getAllUsers } from '@/lib/storage'
import type { Message, User as UserType } from '@/lib/storage'

export default function CommunicationPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setMessages(getMessages())
    setUsers(getAllUsers())
    setLoading(false)
  }, [router])

  const inboxMessages = messages.filter(msg => 
    msg.recipients?.includes(currentUser?.id) && !msg.isDeleted
  )

  const sentMessages = messages.filter(msg => 
    msg.senderId === currentUser?.id && !msg.isDeleted
  )

  const unreadCount = inboxMessages.filter(msg => !msg.readBy?.includes(currentUser?.id)).length

  const filteredInbox = inboxMessages.filter(msg =>
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSent = sentMessages.filter(msg =>
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedMessage) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser?.id || '',
      recipientType: 'individual',
      recipients: [selectedMessage.senderId],
      subject: `Re: ${selectedMessage.subject}`,
      content: replyText,
      type: 'email',
      sentAt: new Date().toISOString(),
      status: 'sent',
      readBy: [],
      isDeleted: false
    }

    setMessages(prev => [...prev, newMessage])
    setReplyText('')
    setSelectedMessage(null)
    setActiveTab('sent')
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true, readBy: [...(msg.readBy || []), currentUser?.id] } : msg
    ))
  }

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isDeleted: true } : msg
    ))
    setSelectedMessage(null)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <UnifiedSidebar userRole={currentUser?.role || 'candidate'} userName={currentUser?.name || ''} />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Communication</h1>
              <p className="text-muted-foreground mt-2">Messages and announcements</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{unreadCount}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{messages.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{users.filter(u => u.isActive).length}</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mb-6 bg-muted/30 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'inbox' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('inbox')}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Inbox
              {unreadCount > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sent')}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Sent
            </Button>
            <Button
              variant={activeTab === 'compose' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('compose')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Compose
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">
                    {activeTab === 'inbox' ? 'Inbox' : activeTab === 'sent' ? 'Sent' : 'Compose'}
                  </h2>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'inbox' && (
                    <div className="divide-y divide-border">
                      {filteredInbox.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedMessage?.id === message.id ? 'bg-muted/50' : ''
                          } ${!message.readBy?.includes(currentUser?.id) ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            setSelectedMessage(message)
                            markAsRead(message.id)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {!message.readBy?.includes(currentUser?.id) && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <span className="text-sm font-medium text-foreground truncate">
                                {users.find(u => u.id === message.senderId)?.name || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1 truncate">{message.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'sent' && (
                    <div className="divide-y divide-border">
                      {filteredSent.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedMessage?.id === message.id ? 'bg-muted/50' : ''
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              To: {users.find(u => message.recipients?.includes(u.id))?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1 truncate">{message.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'compose' && (
                    <div className="p-4">
                      <p className="text-center text-muted-foreground py-8">
                        Select recipients and compose your message
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Message Content */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                {selectedMessage ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{selectedMessage.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {activeTab === 'inbox' 
                              ? `From: ${users.find(u => u.id === selectedMessage.senderId)?.name || 'Unknown'}`
                              : `To: ${users.find(u => selectedMessage.recipients?.includes(u.id))?.name || 'Unknown'}`
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(selectedMessage.sentAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => deleteMessage(selectedMessage.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>

                    {activeTab === 'inbox' && (
                      <div className="border-t border-border pt-6">
                        <h4 className="font-medium text-foreground mb-3">Reply</h4>
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-3"
                          rows={4}
                        />
                        <Button onClick={handleSendMessage} disabled={!replyText.trim()} className="gap-2">
                          <Send className="h-4 w-4" />
                          Send Reply
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a message</h3>
                    <p className="text-muted-foreground">Choose a message from the list to view its content</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
