export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent?: string
}

export class EmailTemplates {
  private static readonly baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  private static readonly logoUrl = `${EmailTemplates.baseUrl}/logo.png`
  private static readonly companyInfo = {
    name: 'QEdge',
    tagline: 'Enterprise HR Learning Management System',
    website: 'qedge.com',
    supportEmail: 'support@qedge.com'
  }

  private static getHeader(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
          }
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 15px;
          }
          .company-name {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin: 5px 0 0 0;
            font-weight: 400;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h1 {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
          }
          .content p {
            color: #4a5568;
            font-size: 16px;
            margin: 0 0 20px 0;
            line-height: 1.7;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            color: #6c757d;
            font-size: 14px;
            margin: 5px 0;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e9ecef, transparent);
            margin: 20px 0;
          }
          .highlight-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
            text-align: left;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6c757d;
            font-size: 20px;
            text-decoration: none;
          }
          .social-links a:hover {
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="${EmailTemplates.logoUrl}" alt="${EmailTemplates.companyInfo.name}" class="logo" />
            <h1 class="company-name">${EmailTemplates.companyInfo.name}</h1>
            <p class="tagline">${EmailTemplates.companyInfo.tagline}</p>
          </div>
          <div class="content">
    `
  }

  private static getFooter(): string {
    return `
          </div>
          <div class="footer">
            <div class="divider"></div>
            <p><strong>${EmailTemplates.companyInfo.name}</strong></p>
            <p>${EmailTemplates.companyInfo.tagline}</p>
            <div class="social-links">
              <a href="#">📧</a>
              <a href="#">💼</a>
              <a href="#">🌐</a>
            </div>
            <p>
              <a href="${EmailTemplates.baseUrl}">Website</a> | 
              <a href="mailto:${EmailTemplates.companyInfo.supportEmail}">Support</a>
            </p>
            <p style="font-size: 12px; margin-top: 20px;">
              © 2024 ${EmailTemplates.companyInfo.name}. All rights reserved.
            </p>
            <p style="font-size: 12px;">
              You received this email because you are registered with ${EmailTemplates.companyInfo.name}.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  static welcomeEmail(userName: string, userEmail: string): EmailTemplate {
    const loginUrl = `${EmailTemplates.baseUrl}/login`
    
    return {
      subject: `Welcome to ${EmailTemplates.companyInfo.name} - Your Learning Journey Begins!`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Welcome to QEdge, ${userName}! 🎉</h1>
        <p>We're thrilled to have you join our learning community. Your account has been successfully created and you're ready to start your professional development journey.</p>
        
        <div class="highlight-box">
          <p><strong>Your Account Details:</strong></p>
          <p>Email: ${userEmail}</p>
          <p>Status: Active</p>
        </div>

        <p>Get started by exploring our comprehensive course catalog, connecting with your team members, and tracking your progress.</p>
        
        <a href="${loginUrl}" class="button">Get Started Now</a>
        
        <p>If you have any questions, our support team is here to help you every step of the way.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `Welcome to QEdge! Your account has been created. Login at ${loginUrl} to start your learning journey.`
    }
  }

  static courseEnrollment(userName: string, courseTitle: string, courseUrl: string): EmailTemplate {
    return {
      subject: `Course Enrollment Confirmation - ${courseTitle}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Course Enrollment Successful! 📚</h1>
        <p>Hi ${userName},</p>
        <p>You have been successfully enrolled in <strong>${courseTitle}</strong>. Your learning journey begins now!</p>
        
        <div class="highlight-box">
          <p><strong>Course Details:</strong></p>
          <p>Course: ${courseTitle}</p>
          <p>Status: Enrolled</p>
          <p>Next Step: Start Learning</p>
        </div>

        <p>Access your course materials, track your progress, and connect with instructors and fellow learners.</p>
        
        <a href="${courseUrl}" class="button">Access Course</a>
        
        <p>Good luck with your learning! We're excited to see you achieve your goals.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `You've been enrolled in ${courseTitle}. Access the course at ${courseUrl}`
    }
  }

  static meetingInvitation(userName: string, meetingTitle: string, meetingTime: string, meetingUrl: string): EmailTemplate {
    return {
      subject: `Meeting Invitation: ${meetingTitle}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Meeting Invitation 📅</h1>
        <p>Hi ${userName},</p>
        <p>You've been invited to attend: <strong>${meetingTitle}</strong></p>
        
        <div class="highlight-box">
          <p><strong>Meeting Details:</strong></p>
          <p>Title: ${meetingTitle}</p>
          <p>Time: ${meetingTime}</p>
          <p>Location: Virtual Meeting</p>
        </div>

        <p>Join the meeting using the link below. The meeting room will open 15 minutes before the scheduled time.</p>
        
        <a href="${meetingUrl}" class="button">Join Meeting</a>
        
        <p>Please ensure you have a stable internet connection and your microphone/camera ready if needed.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `Meeting invitation: ${meetingTitle} at ${meetingTime}. Join at ${meetingUrl}`
    }
  }

  static achievementUnlocked(userName: string, badgeTitle: string, badgeDescription: string, profileUrl: string): EmailTemplate {
    return {
      subject: `🏆 Achievement Unlocked: ${badgeTitle}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Congratulations! 🎊</h1>
        <p>Amazing work, ${userName}!</p>
        <p>You've successfully unlocked the <strong>${badgeTitle}</strong> achievement!</p>
        
        <div class="highlight-box">
          <p><strong>Achievement Details:</strong></p>
          <p>Badge: ${badgeTitle}</p>
          <p>${badgeDescription}</p>
          <p>Status: Unlocked ✅</p>
        </div>

        <p>This achievement recognizes your dedication and hard work. Keep up the excellent momentum!</p>
        
        <a href="${profileUrl}" class="button">View Your Profile</a>
        
        <p>Share your success with your team and continue striving for excellence!</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `Congratulations! You've unlocked the ${badgeTitle} achievement. View your profile at ${profileUrl}`
    }
  }

  static courseCompletion(userName: string, courseTitle: string, certificateUrl: string): EmailTemplate {
    return {
      subject: `🎓 Course Completed: ${courseTitle}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Congratulations on Course Completion! 🎓</h1>
        <p>Fantastic achievement, ${userName}!</p>
        <p>You have successfully completed <strong>${courseTitle}</strong>. Your dedication to learning is truly commendable!</p>
        
        <div class="highlight-box">
          <p><strong>Completion Details:</strong></p>
          <p>Course: ${courseTitle}</p>
          <p>Status: Completed ✅</p>
          <p>Certificate: Available</p>
        </div>

        <p>Your certificate of completion is now available. You can download and share it with your network.</p>
        
        <a href="${certificateUrl}" class="button">Download Certificate</a>
        
        <p>Ready for your next challenge? Explore our course catalog for more learning opportunities.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `Congratulations! You've completed ${courseTitle}. Download your certificate at ${certificateUrl}`
    }
  }

  static announcementEmail(userName: string, announcementTitle: string, announcementContent: string, announcementUrl: string): EmailTemplate {
    return {
      subject: `📢 Important Announcement: ${announcementTitle}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Important Announcement 📢</h1>
        <p>Hi ${userName},</p>
        <p>We have an important update to share with you:</p>
        
        <div class="highlight-box">
          <p><strong>${announcementTitle}</strong></p>
          <p>${announcementContent}</p>
        </div>

        <p>For more details and to stay updated with all the latest news, please visit the announcements section.</p>
        
        <a href="${announcementUrl}" class="button">Read Full Announcement</a>
        
        <p>Thank you for being a valued member of our learning community.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `New announcement: ${announcementTitle}. Read more at ${announcementUrl}`
    }
  }

  static passwordReset(userName: string, resetUrl: string): EmailTemplate {
    return {
      subject: `Password Reset Request - ${EmailTemplates.companyInfo.name}`,
      htmlContent: `
        ${EmailTemplates.getHeader()}
        <h1>Password Reset 🔐</h1>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password for your ${EmailTemplates.companyInfo.name} account.</p>
        
        <div class="highlight-box">
          <p><strong>Security Notice:</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>This link will expire in 24 hours for your security.</p>
        </div>

        <p>Click the button below to reset your password:</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <p>If you have any questions or concerns, please contact our support team.</p>
        ${EmailTemplates.getFooter()}
      `,
      textContent: `Reset your password at ${resetUrl}. This link expires in 24 hours.`
    }
  }
}
