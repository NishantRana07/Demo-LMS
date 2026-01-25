// LocalStorage utilities for QEdge LMS

export interface User {
  id: string
  email: string
  password: string
  role: 'hr' | 'employee' | 'candidate'
  name: string
  createdAt: string
  joined?: string
  department?: string
  isActive: boolean
  progress?: number
  attendance?: number
  points?: number
  badges?: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: string
  assignedTo: string[]
  lessons: Lesson[]
  points: number
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  badge?: string
  thumbnail?: string
  status?: 'active' | 'draft' | 'archived'
  duration?: number
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  type: 'video' | 'document' | 'text'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
  completed: boolean
  points?: number
  order: number
}

export interface Meeting {
  id: string
  title: string
  description: string
  scheduledAt: string
  participants: string[]
  createdBy: string
  meetingLink: string
  platform: 'teams' | 'meet' | 'zoom' | 'custom'
  duration: number // in minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  webinarMode: boolean
  maxParticipants?: number
  recordingUrl?: string
  createdAt: string
}

export interface Attendance {
  id: string
  meetingId: string
  userId: string
  joinedAt: string
  leftAt?: string
  duration: number // in minutes
  status: 'present' | 'absent' | 'late'
  engagementScore: number // 0-100
  notes?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'course_assigned' | 'meeting_scheduled' | 'course_completed' | 'reminder'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Points {
  id: string
  userId: string
  courseId: string
  points: number
  earnedAt: string
}

export interface CourseStat {
  userId: string
  courseId: string
  started: boolean
  lessonsCompleted: number
  totalLessons: number
  pointsEarned: number
}

export interface Email {
  id: string
  trackingId: string
  senderId: string
  recipientEmail: string
  recipientId?: string
  subject: string
  htmlContent: string
  sentAt: string
  opened: boolean
  openedAt?: string
  links: EmailLink[]
}

export interface EmailLink {
  id: string
  emailId: string
  originalUrl: string
  trackingUrl: string
  clicked: boolean
  clickedAt?: string
  clickCount: number
}

export interface Message {
  id: string
  senderId: string
  recipientType: 'all' | 'role' | 'individual'
  recipients?: string[]
  role?: User['role']
  subject: string
  content: string
  type: 'announcement' | 'email' | 'meeting_invite' | 'system'
  sentAt: string
  status: 'draft' | 'sent' | 'failed'
  readBy?: string[]
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: string
  pointsRequired: number
}

export interface Activity {
  id: string
  userId: string
  type: 'course_completed' | 'lesson_completed' | 'meeting_attended' | 'badge_earned' | 'user_joined'
  description: string
  timestamp: string
  metadata?: any
}

// Additional HR interfaces
export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  audience: 'all' | 'hr' | 'employee' | 'candidate'
  senderId: string
  createdAt: string
}

export interface LearningObject {
  id: string
  title: string
  description: string
  type: 'video' | 'document' | 'quiz' | 'interactive' | 'presentation'
  content: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  tags: string[]
  createdAt: string
}

export interface ClassroomSession {
  id: string
  title: string
  instructor: string
  location: string
  scheduledAt: string
  duration: number
  maxParticipants: number
  currentParticipants: string[]
  materials: string[]
  createdAt: string
}

export interface Batch {
  id: string
  name: string
  description: string
  courseIds: string[]
  participantIds: string[]
  instructorId: string
  startDate: string
  endDate: string
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Evaluation {
  id: string
  title: string
  description: string
  type: 'quiz' | 'assignment' | 'practical' | 'peer-review'
  courseId: string
  participantIds: string[]
  dueDate: string
  maxScore: number
  passingScore: number
  status: 'draft' | 'published' | 'closed'
  createdAt: string
}

export interface Form {
  id: string
  title: string
  description: string
  type: 'survey' | 'feedback' | 'application' | 'assessment'
  fields: FormField[]
  responses: FormResponse[]
  status: 'draft' | 'published' | 'closed'
  createdAt: string
}

export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  required: boolean
  options?: string[]
  validation?: string
}

export interface FormResponse {
  id: string
  formId: string
  userId: string
  answers: Record<string, any>
  submittedAt: string
}

// Initialize LocalStorage with demo data
export function initializeStorage() {
  // Demo users
  const demoUsers: User[] = [
    {
      id: 'user-hr-1',
      email: 'hr@company.com',
      password: 'admin123',
      role: 'hr',
      name: 'HR Admin',
      createdAt: new Date().toISOString(),
      joined: '2025-11-01',
      department: 'Human Resources',
      isActive: true,
      progress: 100,
      attendance: 95,
      points: 500,
      badges: ['hr_master', 'trainer']
    },
    // Candidates
    {
      id: 'user-candidate-1',
      email: 'aarav@demo.com',
      password: 'user123',
      role: 'candidate',
      name: 'Aarav Mehta',
      createdAt: new Date().toISOString(),
      joined: '2025-12-01',
      department: 'Training',
      isActive: true,
      progress: 25,
      attendance: 88,
      points: 150,
      badges: ['fast_learner']
    },
    {
      id: 'user-candidate-2',
      email: 'riya@demo.com',
      password: 'user123',
      role: 'candidate',
      name: 'Riya Sharma',
      createdAt: new Date().toISOString(),
      joined: '2025-12-02',
      department: 'Training',
      isActive: true,
      progress: 40,
      attendance: 92,
      points: 200,
      badges: ['dedicated']
    },
    {
      id: 'user-candidate-3',
      email: 'kabir@demo.com',
      password: 'user123',
      role: 'candidate',
      name: 'Kabir Singh',
      createdAt: new Date().toISOString(),
      joined: '2025-12-03',
      department: 'Training',
      isActive: true,
      progress: 60,
      attendance: 85,
      points: 300,
      badges: ['team_player']
    },
    {
      id: 'user-candidate-4',
      email: 'ananya@demo.com',
      password: 'user123',
      role: 'candidate',
      name: 'Ananya Verma',
      createdAt: new Date().toISOString(),
      joined: '2025-12-04',
      department: 'Training',
      isActive: true,
      progress: 35,
      attendance: 90,
      points: 175,
      badges: []
    },
    {
      id: 'user-candidate-5',
      email: 'rahul@demo.com',
      password: 'user123',
      role: 'candidate',
      name: 'Rahul Gupta',
      createdAt: new Date().toISOString(),
      joined: '2025-12-05',
      department: 'Training',
      isActive: true,
      progress: 80,
      attendance: 94,
      points: 400,
      badges: ['top_performer']
    },
    // Employees
    {
      id: 'user-employee-1',
      email: 'vikram@demo.com',
      password: 'user123',
      role: 'employee',
      name: 'Vikram Yadav',
      createdAt: new Date().toISOString(),
      joined: '2025-11-20',
      department: 'Engineering',
      isActive: true,
      progress: 75,
      attendance: 96,
      points: 450,
      badges: ['mentor', 'expert']
    },
    {
      id: 'user-employee-2',
      email: 'isha@demo.com',
      password: 'user123',
      role: 'employee',
      name: 'Isha Malhotra',
      createdAt: new Date().toISOString(),
      joined: '2025-11-22',
      department: 'Marketing',
      isActive: true,
      progress: 85,
      attendance: 98,
      points: 475,
      badges: ['leader']
    },
    {
      id: 'user-employee-3',
      email: 'rohit@demo.com',
      password: 'user123',
      role: 'employee',
      name: 'Rohit Arora',
      createdAt: new Date().toISOString(),
      joined: '2025-11-25',
      department: 'Sales',
      isActive: true,
      progress: 90,
      attendance: 92,
      points: 490,
      badges: ['sales_master']
    },
    {
      id: 'user-employee-4',
      email: 'kritika@demo.com',
      password: 'user123',
      role: 'employee',
      name: 'Kritika Bose',
      createdAt: new Date().toISOString(),
      joined: '2025-11-28',
      department: 'Operations',
      isActive: true,
      progress: 70,
      attendance: 89,
      points: 350,
      badges: ['process_expert']
    },
    {
      id: 'user-employee-5',
      email: 'sahil@demo.com',
      password: 'user123',
      role: 'employee',
      name: 'Sahil Khan',
      createdAt: new Date().toISOString(),
      joined: '2025-12-01',
      department: 'Finance',
      isActive: true,
      progress: 65,
      attendance: 91,
      points: 325,
      badges: ['analyst']
    }
  ]

  if (!localStorage.getItem('qedge_users')) {
    localStorage.setItem('qedge_users', JSON.stringify(demoUsers))
  }

  // Demo Courses
  if (!localStorage.getItem('qedge_courses')) {
    const demoCourses: Course[] = [
      {
        id: 'course-demo-1',
        title: 'Onboarding Essentials',
        description: 'Learn company policies, procedures, and get up to speed quickly with our onboarding program.',
        createdBy: 'user-admin-1',
        createdAt: new Date().toISOString(),
        assignedTo: ['user-emp-1'],
        lessons: [
          {
            id: 'lesson-1',
            courseId: 'course-demo-1',
            title: 'Welcome to Our Company',
            content: 'Welcome content',
            type: 'text',
            completed: false,
            order: 1,
          },
          {
            id: 'lesson-2',
            courseId: 'course-demo-1',
            title: 'Company Policies',
            content: 'Policies content',
            type: 'document',
            fileName: 'company-policies.pdf',
            completed: false,
            order: 2,
          },
          {
            id: 'lesson-3',
            courseId: 'course-demo-1',
            title: 'Team Introduction',
            content: 'Team intro video',
            type: 'video',
            completed: false,
            order: 3,
          },
        ],
        points: 100,
        category: 'Onboarding',
        difficulty: 'beginner',
        status: 'active',
        duration: 8,
      },
      {
        id: 'course-demo-2',
        title: 'Professional Development',
        description: 'Enhance your professional skills and advance your career within our organization.',
        createdBy: 'user-admin-1',
        createdAt: new Date().toISOString(),
        assignedTo: ['user-emp-1'],
        lessons: [
          {
            id: 'lesson-4',
            courseId: 'course-demo-2',
            title: 'Leadership Basics',
            content: 'Leadership content',
            type: 'text',
            completed: false,
            order: 1,
          },
          {
            id: 'lesson-5',
            courseId: 'course-demo-2',
            title: 'Communication Skills',
            content: 'Communication content',
            type: 'video',
            completed: false,
            order: 2,
          },
        ],
        points: 75,
        category: 'Professional Skills',
        difficulty: 'intermediate',
        status: 'active',
        duration: 6,
      },
      {
        id: 'course-demo-3',
        title: 'Compliance & Safety',
        description: 'Important compliance training and workplace safety protocols that all employees must complete.',
        createdBy: 'user-admin-1',
        createdAt: new Date().toISOString(),
        assignedTo: ['user-emp-1'],
        lessons: [
          {
            id: 'lesson-6',
            courseId: 'course-demo-3',
            title: 'Safety Regulations',
            content: 'Safety content',
            type: 'document',
            fileName: 'safety-guide.pdf',
            completed: false,
            order: 1,
          },
          {
            id: 'lesson-7',
            courseId: 'course-demo-3',
            title: 'Incident Reporting',
            content: 'Incident content',
            type: 'text',
            completed: false,
            order: 2,
          },
        ],
        points: 50,
        category: 'Compliance',
        difficulty: 'beginner',
        status: 'active',
        duration: 4,
      },
    ]
    localStorage.setItem('qedge_courses', JSON.stringify(demoCourses))
  }

  // Demo Meetings
  if (!localStorage.getItem('qedge_meetings')) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(10, 0, 0, 0)

    const demoCourses: Meeting[] = [
      {
        id: 'meeting-demo-1',
        title: 'Team Orientation',
        description: 'Welcome session to meet your team and learn about departmental goals.',
        scheduledAt: tomorrow.toISOString(),
        participants: ['user-emp-1', 'user-admin-1'],
        createdBy: 'user-admin-1',
        meetingLink: 'https://qedge.local/meeting/meeting-demo-1',
        platform: 'teams',
        duration: 60,
        status: 'scheduled',
        webinarMode: false,
        maxParticipants: 50,
        createdAt: new Date().toISOString()
      },
      {
        id: 'meeting-demo-2',
        title: 'Quarterly Strategy Review',
        description: 'Review company strategy and Q1 goals with the team.',
        scheduledAt: nextWeek.toISOString(),
        participants: ['user-emp-1', 'user-admin-1'],
        createdBy: 'user-admin-1',
        meetingLink: 'https://qedge.local/meeting/meeting-demo-2',
        platform: 'meet',
        duration: 90,
        status: 'scheduled',
        webinarMode: true,
        maxParticipants: 100,
        createdAt: new Date().toISOString()
      },
    ]
    localStorage.setItem('qedge_meetings', JSON.stringify(demoCourses))
  }

  if (!localStorage.getItem('qedge_notifications')) {
    localStorage.setItem('qedge_notifications', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_attendance')) {
    localStorage.setItem('qedge_attendance', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_points')) {
    localStorage.setItem('qedge_points', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_course_stats')) {
    localStorage.setItem('qedge_course_stats', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_emails')) {
    localStorage.setItem('qedge_emails', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_email_tracking')) {
    localStorage.setItem('qedge_email_tracking', JSON.stringify([]))
  }

  // Initialize new entities
  if (!localStorage.getItem('qedge_messages')) {
    localStorage.setItem('qedge_messages', JSON.stringify([]))
  }

  if (!localStorage.getItem('qedge_badges')) {
    const demoBadges: Badge[] = [
      {
        id: 'fast_learner',
        name: 'Fast Learner',
        description: 'Complete first course within 3 days',
        icon: '🚀',
        criteria: 'Complete course quickly',
        pointsRequired: 50
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Maintain 90%+ attendance for 30 days',
        icon: '💪',
        criteria: 'High attendance',
        pointsRequired: 100
      },
      {
        id: 'team_player',
        name: 'Team Player',
        description: 'Complete 5 group activities',
        icon: '🤝',
        criteria: 'Team collaboration',
        pointsRequired: 150
      },
      {
        id: 'top_performer',
        name: 'Top Performer',
        description: 'Achieve 95%+ in all courses',
        icon: '⭐',
        criteria: 'Excellent performance',
        pointsRequired: 300
      },
      {
        id: 'mentor',
        name: 'Mentor',
        description: 'Help 10+ users complete courses',
        icon: '👨‍🏫',
        criteria: 'Mentorship',
        pointsRequired: 200
      },
      {
        id: 'expert',
        name: 'Expert',
        description: 'Complete all advanced courses',
        icon: '🎓',
        criteria: 'Advanced completion',
        pointsRequired: 500
      },
      {
        id: 'leader',
        name: 'Leader',
        description: 'Lead 3+ team projects',
        icon: '👑',
        criteria: 'Leadership',
        pointsRequired: 400
      },
      {
        id: 'sales_master',
        name: 'Sales Master',
        description: 'Exceed sales targets for 6 months',
        icon: '💼',
        criteria: 'Sales excellence',
        pointsRequired: 350
      },
      {
        id: 'process_expert',
        name: 'Process Expert',
        description: 'Optimize 5+ operational processes',
        icon: '⚙️',
        criteria: 'Process improvement',
        pointsRequired: 250
      },
      {
        id: 'analyst',
        name: 'Analyst',
        description: 'Complete all financial courses',
        icon: '📊',
        criteria: 'Financial expertise',
        pointsRequired: 275
      },
      {
        id: 'hr_master',
        name: 'HR Master',
        description: 'Manage all HR functions effectively',
        icon: '👥',
        criteria: 'HR excellence',
        pointsRequired: 600
      },
      {
        id: 'trainer',
        name: 'Trainer',
        description: 'Conduct 10+ training sessions',
        icon: '📚',
        criteria: 'Training excellence',
        pointsRequired: 450
      }
    ]
    localStorage.setItem('qedge_badges', JSON.stringify(demoBadges))
  }

  if (!localStorage.getItem('qedge_activities')) {
    localStorage.setItem('qedge_activities', JSON.stringify([]))
  }

  // Initialize new HR features demo data
  if (!localStorage.getItem('qedge_announcements')) {
    localStorage.setItem('qedge_announcements', JSON.stringify(demoAnnouncements))
  }

  if (!localStorage.getItem('qedge_learning_objects')) {
    localStorage.setItem('qedge_learning_objects', JSON.stringify(demoLearningObjects))
  }

  if (!localStorage.getItem('qedge_classroom_sessions')) {
    localStorage.setItem('qedge_classroom_sessions', JSON.stringify(demoClassroomSessions))
  }

  if (!localStorage.getItem('qedge_batches')) {
    localStorage.setItem('qedge_batches', JSON.stringify(demoBatches))
  }

  if (!localStorage.getItem('qedge_evaluations')) {
    localStorage.setItem('qedge_evaluations', JSON.stringify(demoEvaluations))
  }

  if (!localStorage.getItem('qedge_forms')) {
    localStorage.setItem('qedge_forms', JSON.stringify(demoForms))
  }
}

// Auth functions
export function findUserByEmail(email: string): User | null {
  const users = JSON.parse(localStorage.getItem('qedge_users') || '[]') as User[]
  return users.find((u) => u.email === email) || null
}

export function validateCredentials(email: string, password: string): User | null {
  const user = findUserByEmail(email)
  if (user && user.password === password) {
    return user
  }
  return null
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem('qedge_current_user')
  return user ? JSON.parse(user) : null
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('qedge_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('qedge_current_user')
  }
}

// User management functions
export function getAllUsers(): User[] {
  return JSON.parse(localStorage.getItem('qedge_users') || '[]') as User[]
}

export function getUsersByRole(role: User['role']): User[] {
  const users = getAllUsers()
  return users.filter((u) => u.role === role)
}

export function getUsersByRoles(roles: User['role'][]): User[] {
  const users = getAllUsers()
  return users.filter((u) => roles.includes(u.role))
}

export function getUserEmailsByRole(role: User['role']): string[] {
  const users = getUsersByRole(role)
  return users.map((u) => u.email)
}

export function getUserEmailsByRoles(roles: User['role'][]): string[] {
  const users = getUsersByRoles(roles)
  return users.map((u) => u.email)
}

export function getAllUserEmails(): string[] {
  const users = getAllUsers()
  return users.map((u) => u.email)
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getAllUsers()
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isActive: true,
    progress: 0,
    attendance: 0,
    points: 0,
    badges: [],
  }
  users.push(newUser)
  localStorage.setItem('qedge_users', JSON.stringify(users))
  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getAllUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return null
  
  users[index] = { ...users[index], ...updates }
  localStorage.setItem('qedge_users', JSON.stringify(users))
  return users[index]
}

export function deactivateUser(id: string): boolean {
  return updateUser(id, { isActive: false }) !== null
}

export function deleteUser(id: string): boolean {
  const users = getAllUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return false
  
  users.splice(index, 1)
  localStorage.setItem('qedge_users', JSON.stringify(users))
  return true
}

// Course functions
export function getCourses(): Course[] {
  return JSON.parse(localStorage.getItem('qedge_courses') || '[]')
}

export function createCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
  const courses = getCourses()
  const newCourse: Course = {
    ...course,
    id: `course-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  courses.push(newCourse)
  localStorage.setItem('qedge_courses', JSON.stringify(courses))
  return newCourse
}

export function getCourseById(id: string): Course | null {
  const courses = getCourses()
  return courses.find((c) => c.id === id) || null
}

export function updateCourse(id: string, updates: Partial<Course>): Course | null {
  const courses = getCourses()
  const index = courses.findIndex((c) => c.id === id)
  if (index === -1) return null
  
  courses[index] = { ...courses[index], ...updates }
  localStorage.setItem('qedge_courses', JSON.stringify(courses))
  return courses[index]
}

export function deleteCourse(id: string): boolean {
  const courses = getCourses()
  const index = courses.findIndex((c) => c.id === id)
  if (index === -1) return false
  
  courses.splice(index, 1)
  localStorage.setItem('qedge_courses', JSON.stringify(courses))
  return true
}

// Meeting functions
export function getMeetings(): Meeting[] {
  return JSON.parse(localStorage.getItem('qedge_meetings') || '[]')
}

export function createMeeting(meeting: Omit<Meeting, 'id' | 'meetingLink'>): Meeting {
  const meetings = getMeetings()
  const newMeeting: Meeting = {
    ...meeting,
    id: `meeting-${Date.now()}`,
    meetingLink: `https://qedge.local/meeting/${`meeting-${Date.now()}`}`,
  }
  meetings.push(newMeeting)
  localStorage.setItem('qedge_meetings', JSON.stringify(meetings))
  return newMeeting
}

export function getMeetingById(id: string): Meeting | null {
  const meetings = getMeetings()
  return meetings.find((m) => m.id === id) || null
}

export function updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
  const meetings = getMeetings()
  const index = meetings.findIndex((m) => m.id === id)
  if (index === -1) return null
  
  meetings[index] = { ...meetings[index], ...updates }
  localStorage.setItem('qedge_meetings', JSON.stringify(meetings))
  return meetings[index]
}

export function deleteMeeting(id: string): boolean {
  const meetings = getMeetings()
  const index = meetings.findIndex((m) => m.id === id)
  if (index === -1) return false
  
  meetings.splice(index, 1)
  localStorage.setItem('qedge_meetings', JSON.stringify(meetings))
  return true
}

export function getAttendance(): Attendance[] {
  return JSON.parse(localStorage.getItem('qedge_attendance') || '[]')
}

export function createAttendance(attendance: Omit<Attendance, 'id' | 'createdAt'>): Attendance {
  const records = getAttendance()
  const newRecord: Attendance = {
    ...attendance,
    id: `attendance-${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  records.push(newRecord)
  localStorage.setItem('qedge_attendance', JSON.stringify(records))
  return newRecord
}

export function getAttendanceByMeetingAndUser(meetingId: string, userId: string): Attendance | null {
  const records = getAttendance()
  return records.find((a) => a.meetingId === meetingId && a.userId === userId) || null
}

export function getAttendanceByMeeting(meetingId: string): Attendance[] {
  const records = getAttendance()
  return records.filter((a) => a.meetingId === meetingId)
}

export function getAttendanceByUser(userId: string): Attendance[] {
  const records = getAttendance()
  return records.filter((a) => a.userId === userId)
}

export function updateAttendance(id: string, updates: Partial<Attendance>): Attendance | null {
  const records = getAttendance()
  const index = records.findIndex((a) => a.id === id)
  if (index === -1) return null
  
  records[index] = { ...records[index], ...updates }
  localStorage.setItem('qedge_attendance', JSON.stringify(records))
  return records[index]
}

export function joinMeeting(meetingId: string, userId: string): Attendance {
  const existing = getAttendanceByMeetingAndUser(meetingId, userId)
  
  if (existing) {
    // User is re-joining, update joinedAt
    return updateAttendance(existing.id, {
      joinedAt: new Date().toISOString(),
      status: 'present'
    })!
  } else {
    // First time joining
    return createAttendance({
      meetingId,
      userId,
      joinedAt: new Date().toISOString(),
      duration: 0,
      status: 'present',
      engagementScore: 0
    })
  }
}

export function leaveMeeting(meetingId: string, userId: string): Attendance | null {
  const attendance = getAttendanceByMeetingAndUser(meetingId, userId)
  if (!attendance) return null
  
  const joinedAt = new Date(attendance.joinedAt)
  const leftAt = new Date()
  const duration = Math.round((leftAt.getTime() - joinedAt.getTime()) / (1000 * 60)) // in minutes
  
  return updateAttendance(attendance.id, {
    leftAt: leftAt.toISOString(),
    duration,
    status: duration > 0 ? 'present' : 'absent'
  })
}

export function getMeetingStats(meetingId: string): {
  totalParticipants: number
  presentCount: number
  absentCount: number
  averageDuration: number
  averageEngagement: number
} {
  const attendance = getAttendanceByMeeting(meetingId)
  const present = attendance.filter(a => a.status === 'present')
  const absent = attendance.filter(a => a.status === 'absent')
  
  const averageDuration = present.length > 0 
    ? present.reduce((sum, a) => sum + a.duration, 0) / present.length 
    : 0
    
  const averageEngagement = present.length > 0 
    ? present.reduce((sum, a) => sum + a.engagementScore, 0) / present.length 
    : 0
  
  return {
    totalParticipants: attendance.length,
    presentCount: present.length,
    absentCount: absent.length,
    averageDuration,
    averageEngagement
  }
}

// Notification functions
export function getNotifications(userId: string): Notification[] {
  const all = JSON.parse(localStorage.getItem('qedge_notifications') || '[]') as Notification[]
  return all.filter((n) => n.userId === userId)
}

export function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const all = JSON.parse(localStorage.getItem('qedge_notifications') || '[]') as Notification[]
  const newNotification: Notification = {
    ...notification,
    id: `notification-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  all.push(newNotification)
  localStorage.setItem('qedge_notifications', JSON.stringify(all))
  return newNotification
}

// Points functions
export function addPoints(userId: string, courseId: string, points: number): Points {
  const all = JSON.parse(localStorage.getItem('qedge_points') || '[]') as Points[]
  const newPoints: Points = {
    id: `points-${Date.now()}`,
    userId,
    courseId,
    points,
    earnedAt: new Date().toISOString(),
  }
  all.push(newPoints)
  localStorage.setItem('qedge_points', JSON.stringify(all))
  return newPoints
}

export function getUserPoints(userId: string): number {
  const all = JSON.parse(localStorage.getItem('qedge_points') || '[]') as Points[]
  return all.filter((p) => p.userId === userId).reduce((sum, p) => sum + p.points, 0)
}

// Course stats
export function getCourseStat(userId: string, courseId: string): CourseStat | null {
  const all = JSON.parse(localStorage.getItem('qedge_course_stats') || '[]') as CourseStat[]
  return all.find((s) => s.userId === userId && s.courseId === courseId) || null
}

export function updateCourseStat(userId: string, courseId: string, updates: Partial<CourseStat>): CourseStat {
  const all = JSON.parse(localStorage.getItem('qedge_course_stats') || '[]') as CourseStat[]
  let stat = all.find((s) => s.userId === userId && s.courseId === courseId)
  
  if (!stat) {
    stat = {
      userId,
      courseId,
      started: false,
      lessonsCompleted: 0,
      totalLessons: 0,
      pointsEarned: 0,
    }
    all.push(stat)
  }
  
  const index = all.findIndex((s) => s.userId === userId && s.courseId === courseId)
  all[index] = { ...stat, ...updates }
  localStorage.setItem('qedge_course_stats', JSON.stringify(all))
  return all[index]
}

// Email functions
export function getEmails(userId?: string): Email[] {
  const all = JSON.parse(localStorage.getItem('qedge_emails') || '[]') as Email[]
  if (userId) {
    return all.filter((e) => e.senderId === userId)
  }
  return all
}

export function createEmail(email: Omit<Email, 'id' | 'sentAt' | 'opened'>): Email {
  const all = JSON.parse(localStorage.getItem('qedge_emails') || '[]') as Email[]
  const newEmail: Email = {
    ...email,
    id: `email-${Date.now()}`,
    sentAt: new Date().toISOString(),
    opened: false,
  }
  all.push(newEmail)
  localStorage.setItem('qedge_emails', JSON.stringify(all))
  return newEmail
}

export function getEmailByTrackingId(trackingId: string): Email | null {
  const all = JSON.parse(localStorage.getItem('qedge_emails') || '[]') as Email[]
  return all.find((e) => e.trackingId === trackingId) || null
}

export function recordEmailOpen(emailId: string): Email | null {
  const all = JSON.parse(localStorage.getItem('qedge_emails') || '[]') as Email[]
  const email = all.find((e) => e.id === emailId)
  if (!email) return null
  
  email.opened = true
  email.openedAt = new Date().toISOString()
  localStorage.setItem('qedge_emails', JSON.stringify(all))
  return email
}

export function recordEmailClick(emailId: string, linkId: string): Email | null {
  const all = JSON.parse(localStorage.getItem('qedge_emails') || '[]') as Email[]
  const email = all.find((e) => e.id === emailId)
  if (!email) return null
  
  const link = email.links.find((l) => l.id === linkId)
  if (link) {
    link.clicked = true
    link.clickedAt = new Date().toISOString()
    link.clickCount += 1
  }
  
  localStorage.setItem('qedge_emails', JSON.stringify(all))
  return email
}

export function getEmailStats(userId: string) {
  const emails = getEmails(userId)
  const totalSent = emails.length
  const totalOpened = emails.filter((e) => e.opened).length
  const totalClicks = emails.reduce((sum, e) => sum + e.links.filter((l) => l.clicked).length, 0)
  
  return {
    totalSent,
    totalOpened,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    totalClicks,
    clickRate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
  }
}

// Message functions
export function createMessage(message: Omit<Message, 'id' | 'sentAt' | 'readBy'>): Message {
  const messages = getMessages()
  const newMessage: Message = {
    id: `message-${Date.now()}`,
    ...message,
    sentAt: new Date().toISOString(),
    readBy: []
  }
  messages.push(newMessage)
  localStorage.setItem('qedge_messages', JSON.stringify(messages))
  return newMessage
}

export function getMessages(): Message[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('qedge_messages') || '[]')
}

// Additional HR functions
export function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'senderId'>): Announcement {
  const announcements = getAnnouncements()
  const currentUser = getCurrentUser()
  const newAnnouncement: Announcement = {
    id: `announcement-${Date.now()}`,
    ...announcement,
    createdAt: new Date().toISOString(),
    senderId: currentUser?.id || 'system'
  }
  announcements.push(newAnnouncement)
  localStorage.setItem('qedge_announcements', JSON.stringify(announcements))
  
  // Create activity
  createActivity({
    type: 'user_joined',
    description: `Announcement: ${announcement.title} - ${announcement.content.substring(0, 100)}`,
    userId: currentUser?.id || 'system'
  })
  
  return newAnnouncement
}

export function getAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('qedge_announcements') || '[]')
}

export function getBatches(): Batch[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('qedge_batches') || '[]')
}

// Demo data for new features
const demoAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Welcome to QEdge Learning Platform',
    content: 'We are excited to launch our new learning management system. Explore courses and start your learning journey!',
    priority: 'high',
    audience: 'all',
    senderId: 'user-hr-1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'announcement-2',
    title: 'New Course: Advanced Leadership Skills',
    content: 'A comprehensive course on leadership skills is now available for all employees.',
    priority: 'normal',
    audience: 'employee',
    senderId: 'user-hr-1',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]

const demoLearningObjects: LearningObject[] = [
  {
    id: 'lo-1',
    title: 'Introduction to Project Management',
    description: 'Learn the fundamentals of project management',
    type: 'video',
    content: 'Video content for project management basics',
    category: 'Management',
    difficulty: 'beginner',
    duration: 45,
    tags: ['project-management', 'basics', 'management'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'lo-2',
    title: 'Communication Skills Assessment',
    description: 'Interactive quiz to test communication skills',
    type: 'quiz',
    content: 'Quiz content with multiple choice questions',
    category: 'Soft Skills',
    difficulty: 'intermediate',
    duration: 30,
    tags: ['communication', 'assessment', 'soft-skills'],
    createdAt: new Date().toISOString()
  }
]

const demoClassroomSessions: ClassroomSession[] = [
  {
    id: 'session-1',
    title: 'Leadership Workshop',
    instructor: 'John Smith',
    location: 'Conference Room A',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    duration: 120,
    maxParticipants: 20,
    currentParticipants: ['user-employee-1', 'user-employee-2'],
    materials: ['presentation.pdf', 'handout.docx'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'session-2',
    title: 'Team Building Activities',
    instructor: 'Sarah Johnson',
    location: 'Training Room B',
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    duration: 90,
    maxParticipants: 15,
    currentParticipants: ['user-employee-3'],
    materials: ['activity-guide.pdf'],
    createdAt: new Date().toISOString()
  }
]

const demoBatches: Batch[] = [
  {
    id: 'batch-1',
    name: 'Q1 2024 New Hires',
    description: 'Onboarding batch for Q1 2024 new hires',
    courseIds: ['course-1', 'course-2'],
    participantIds: ['user-candidate-1', 'user-candidate-2'],
    instructorId: 'user-hr-1',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'batch-2',
    name: 'Leadership Development Program',
    description: 'Advanced leadership training for senior employees',
    courseIds: ['course-3'],
    participantIds: ['user-employee-1', 'user-employee-2', 'user-employee-3'],
    instructorId: 'user-hr-1',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    status: 'planned',
    createdAt: new Date().toISOString()
  }
]

const demoEvaluations: Evaluation[] = [
  {
    id: 'eval-1',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics',
    type: 'quiz',
    courseId: 'course-1',
    participantIds: ['user-candidate-1', 'user-candidate-2'],
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    maxScore: 100,
    passingScore: 70,
    status: 'published',
    createdAt: new Date().toISOString()
  },
  {
    id: 'eval-2',
    title: 'Project Management Assignment',
    description: 'Create a project plan for a given scenario',
    type: 'assignment',
    courseId: 'course-2',
    participantIds: ['user-employee-1'],
    dueDate: new Date(Date.now() + 1209600000).toISOString(),
    maxScore: 100,
    passingScore: 60,
    status: 'published',
    createdAt: new Date().toISOString()
  }
]

const demoForms: Form[] = [
  {
    id: 'form-1',
    title: 'Course Feedback Survey',
    description: 'Provide feedback on completed courses',
    type: 'feedback',
    fields: [
      {
        id: 'field-1',
        type: 'select',
        label: 'How would you rate this course?',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor']
      },
      {
        id: 'field-2',
        type: 'textarea',
        label: 'Additional comments',
        required: false
      }
    ],
    responses: [],
    status: 'published',
    createdAt: new Date().toISOString()
  },
  {
    id: 'form-2',
    title: 'Training Needs Assessment',
    description: 'Assess training requirements for the team',
    type: 'assessment',
    fields: [
      {
        id: 'field-1',
        type: 'checkbox',
        label: 'Areas needing improvement',
        required: true,
        options: ['Technical Skills', 'Soft Skills', 'Leadership', 'Communication']
      },
      {
        id: 'field-2',
        type: 'text',
        label: 'Specific skills to develop',
        required: true
      }
    ],
    responses: [],
    status: 'published',
    createdAt: new Date().toISOString()
  }
]

export function createBatch(batch: Omit<Batch, 'id' | 'createdAt'>): Batch {
  const batches = getBatches()
  const newBatch: Batch = {
    id: `batch-${Date.now()}`,
    ...batch,
    createdAt: new Date().toISOString()
  }
  batches.push(newBatch)
  localStorage.setItem('qedge_batches', JSON.stringify(batches))
  return newBatch
}

export function getBatchById(id: string): Batch | null {
  const batches = getBatches()
  return batches.find((b) => b.id === id) || null
}

// Evaluations functions
export function getEvaluations(): Evaluation[] {
  return JSON.parse(localStorage.getItem('qedge_evaluations') || '[]')
}

export function createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>): Evaluation {
  const evaluations = getEvaluations()
  const newEvaluation: Evaluation = {
    id: `evaluation-${Date.now()}`,
    ...evaluation,
    createdAt: new Date().toISOString()
  }
  evaluations.push(newEvaluation)
  localStorage.setItem('qedge_evaluations', JSON.stringify(evaluations))
  return newEvaluation
}

export function getEvaluationById(id: string): Evaluation | null {
  const evaluations = getEvaluations()
  return evaluations.find((e) => e.id === id) || null
}

// Forms functions
export function getForms(): Form[] {
  return JSON.parse(localStorage.getItem('qedge_forms') || '[]')
}

export function createForm(form: Omit<Form, 'id' | 'createdAt'>): Form {
  const forms = getForms()
  const newForm: Form = {
    id: `form-${Date.now()}`,
    ...form,
    createdAt: new Date().toISOString()
  }
  forms.push(newForm)
  localStorage.setItem('qedge_forms', JSON.stringify(forms))
  return newForm
}

export function getFormById(id: string): Form | null {
  const forms = getForms()
  return forms.find((f) => f.id === id) || null
}

// Badge functions
export function getBadges(): Badge[] {
  return JSON.parse(localStorage.getItem('qedge_badges') || '[]') as Badge[]
}

export function awardBadge(userId: string, badgeId: string): boolean {
  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return false
  
  const user = users[userIndex]
  if (!user.badges) user.badges = []
  if (!user.badges.includes(badgeId)) {
    user.badges.push(badgeId)
    localStorage.setItem('qedge_users', JSON.stringify(users))
    
    // Create activity
    createActivity({
      userId,
      type: 'badge_earned',
      description: `Earned badge: ${badgeId}`,
      metadata: { badgeId }
    })
    return true
  }
  return false
}

// Activity functions
export function getActivities(userId?: string): Activity[] {
  const all = JSON.parse(localStorage.getItem('qedge_activities') || '[]') as Activity[]
  if (userId) {
    return all.filter((a) => a.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
  const all = getActivities()
  const newActivity: Activity = {
    ...activity,
    id: `activity-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  all.push(newActivity)
  localStorage.setItem('qedge_activities', JSON.stringify(all))
  return newActivity
}
