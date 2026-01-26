import { NextRequest, NextResponse } from 'next/server'
import { EmailTemplates } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { templateType, userEmail, userName } = await request.json()

    if (!templateType || !userEmail) {
      return NextResponse.json({ error: 'Template type and user email are required' }, { status: 400 })
    }

    let template
    const testUserName = userName || 'Test User'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    switch (templateType) {
      case 'welcome':
        template = EmailTemplates.welcomeEmail(testUserName, userEmail)
        break
      case 'courseEnrollment':
        template = EmailTemplates.courseEnrollment(
          testUserName,
          'Advanced JavaScript Development',
          `${baseUrl}/courses/js-advanced`
        )
        break
      case 'meetingInvitation':
        template = EmailTemplates.meetingInvitation(
          testUserName,
          'Weekly Team Standup',
          '2024-01-30 at 10:00 AM EST',
          `${baseUrl}/meetings/weekly-standup`
        )
        break
      case 'achievementUnlocked':
        template = EmailTemplates.achievementUnlocked(
          testUserName,
          'Fast Learner',
          'Completed 5 courses in your first month',
          `${baseUrl}/badges`
        )
        break
      case 'courseCompletion':
        template = EmailTemplates.courseCompletion(
          testUserName,
          'React Fundamentals',
          `${baseUrl}/certificates/react-fundamentals`
        )
        break
      case 'announcement':
        template = EmailTemplates.announcementEmail(
          testUserName,
          'New Course Launch',
          'We are excited to announce the launch of our new Advanced React course. Enroll now to enhance your skills!',
          `${baseUrl}/announcements/new-react-course`
        )
        break
      case 'passwordReset':
        template = EmailTemplates.passwordReset(
          testUserName,
          `${baseUrl}/reset-password?token=abc123`
        )
        break
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email template generated successfully',
      template: {
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[v0] Email template test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to list available templates
export async function GET() {
  return NextResponse.json({
    message: 'Available email templates',
    templates: [
      {
        type: 'welcome',
        name: 'Welcome Email',
        description: 'Sent when a new user joins the platform'
      },
      {
        type: 'courseEnrollment',
        name: 'Course Enrollment',
        description: 'Sent when a user enrolls in a course'
      },
      {
        type: 'meetingInvitation',
        name: 'Meeting Invitation',
        description: 'Sent when a user is invited to a meeting'
      },
      {
        type: 'achievementUnlocked',
        name: 'Achievement Unlocked',
        description: 'Sent when a user earns a new badge/achievement'
      },
      {
        type: 'courseCompletion',
        name: 'Course Completion',
        description: 'Sent when a user completes a course'
      },
      {
        type: 'announcement',
        name: 'Announcement',
        description: 'Sent for company announcements'
      },
      {
        type: 'passwordReset',
        name: 'Password Reset',
        description: 'Sent when a user requests password reset'
      }
    ]
  })
}
