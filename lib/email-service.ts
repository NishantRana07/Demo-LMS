import { getUserEmailsByRole, getAllUserEmails, getCurrentUser } from './storage'

export interface EmailData {
  to: string[]
  subject: string
  htmlContent: string
  senderId: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  variables: string[]
}

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        return { success: false, message: 'User not authenticated' }
      }

      // Send email to each recipient
      const emailPromises = data.to.map(async (email) => {
        const response = await fetch('/api/emails/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: data.subject,
            htmlContent: data.htmlContent,
            senderId: data.senderId,
            recipientId: email,
            attachments: data.attachments
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to send email to ${email}`)
        }

        return response.json()
      })

      const results = await Promise.allSettled(emailPromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (failed > 0) {
        return { 
          success: false, 
          message: `Email sent to ${successful} recipients, failed for ${failed} recipients` 
        }
      }

      return { 
        success: true, 
        message: `Email sent successfully to ${successful} recipients`,
        messageId: results[0].status === 'fulfilled' ? results[0].value.trackingId : undefined
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<{ success: boolean; message: string; results: any[] }> {
    const results = []
    
    for (const emailData of emails) {
      const result = await this.sendEmail(emailData)
      results.push(result)
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const successful = results.filter(r => r.success).length
    return {
      success: successful === emails.length,
      message: `Processed ${emails.length} emails, ${successful} successful`,
      results
    }
  }

  generateAnnouncementEmailHTML(title: string, content: string, priority: string, senderName: string): string {
    const priorityColors = {
      low: '#3B82F6',
      normal: '#6B7280',
      high: '#F97316',
      urgent: '#EF4444'
    }

    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Announcement: ${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 10px 0;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: ${priorityColor};
            color: white;
          }
          .content {
            margin: 20px 0;
          }
          .content h1, .content h2, .content h3 {
            color: #1f2937;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .content p {
            margin-bottom: 15px;
          }
          .content ul, .content ol {
            margin: 15px 0;
            padding-left: 30px;
          }
          .content li {
            margin-bottom: 5px;
          }
          .content strong {
            font-weight: 600;
          }
          .content em {
            font-style: italic;
          }
          .content a {
            color: #3b82f6;
            text-decoration: none;
          }
          .content a:hover {
            text-decoration: underline;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6b7280;
          }
          .logo {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .action-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .action-button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">QEdge Learning Platform</div>
            <h1 class="title">${title}</h1>
            <span class="priority-badge">${priority} priority</span>
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/announcements" class="action-button">
              View All Announcements
            </a>
          </div>
          
          <div class="footer">
            <p>This announcement was sent by ${senderName} from QEdge Learning Platform.</p>
            <p>If you have any questions, please contact your HR department.</p>
            <p style="margin-top: 10px; font-size: 12px;">
              © 2024 QEdge Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateCourseAssignmentEmailHTML(courseTitle: string, courseDescription: string, senderName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Course Assignment: ${courseTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 10px 0;
          }
          .course-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background-color: #10b981;
            color: white;
          }
          .content {
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6b7280;
          }
          .logo {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .action-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .action-button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">QEdge Learning Platform</div>
            <h1 class="title">New Course Assignment</h1>
            <span class="course-badge">Course Assigned</span>
          </div>
          
          <div class="content">
            <h2>${courseTitle}</h2>
            <p>${courseDescription}</p>
            <p>You have been assigned to this new course. Please log in to the QEdge Learning Platform to start your training.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses" class="action-button">
              Start Course
            </a>
          </div>
          
          <div class="footer">
            <p>This course assignment was sent by ${senderName} from QEdge Learning Platform.</p>
            <p>If you have any questions, please contact your HR department.</p>
            <p style="margin-top: 10px; font-size: 12px;">
              © 2024 QEdge Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getRecipientEmails(audience: string): string[] {
    switch (audience) {
      case 'all':
        return getAllUserEmails()
      case 'hr':
        return getUserEmailsByRole('hr')
      case 'employee':
        return getUserEmailsByRole('employee')
      case 'candidate':
        return getUserEmailsByRole('candidate')
      default:
        return []
    }
  }

  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Email configuration test failed')
      }

      const result = await response.json()
      return { 
        success: true, 
        message: 'Email configuration is working correctly' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Email configuration test failed' 
      }
    }
  }
}

export const emailService = EmailService.getInstance()
