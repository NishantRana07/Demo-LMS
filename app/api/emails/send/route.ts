import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Initialize Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Fallback email storage for demo purposes
const emailStorage: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, senderId, recipientId } = await request.json()

    // Validate input
    if (!to || !subject || !htmlContent || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate tracking ID and pixel URL
    const trackingId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const pixelUrl = `${appUrl}/api/emails/track/${trackingId}`

    // Add tracking pixel to email content
    const emailWithPixel = `${htmlContent}<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`

    const sentAt = new Date().toISOString()

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('[v0] SMTP not configured, using fallback email storage')
      
      // Store email in fallback storage
      const emailData = {
        id: trackingId,
        to,
        subject,
        htmlContent: emailWithPixel,
        senderId,
        recipientId,
        sentAt,
        status: 'stored',
        method: 'fallback'
      }
      
      emailStorage.push(emailData)
      
      return NextResponse.json({
        success: true,
        message: 'Email stored successfully (SMTP not configured)',
        trackingId,
        pixelUrl,
        sentAt,
        method: 'fallback',
        storedEmails: emailStorage.length
      }, { status: 200 })
    }

    // Send email via Gmail SMTP
    const mailOptions = {
      from: process.env.HOST_EMAIL || process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: emailWithPixel,
    }

    console.log('[v0] Sending email to:', to)
    await transporter.sendMail(mailOptions)
    console.log('[v0] Email sent successfully to:', to)

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully',
        trackingId,
        pixelUrl,
        sentAt,
        method: 'smtp'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Email send error:', error)
    
    // Fallback to storage if SMTP fails
    try {
      const { to, subject, htmlContent, senderId, recipientId } = await request.json()
      const trackingId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
      const sentAt = new Date().toISOString()
      
      const emailData = {
        id: trackingId,
        to,
        subject,
        htmlContent,
        senderId,
        recipientId,
        sentAt,
        status: 'stored_after_error',
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      emailStorage.push(emailData)
      
      return NextResponse.json({
        success: true,
        message: 'Email stored successfully after SMTP error',
        trackingId,
        sentAt,
        method: 'fallback',
        storedEmails: emailStorage.length,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 200 })
    } catch (fallbackError) {
      console.error('[v0] Fallback storage also failed:', fallbackError)
      return NextResponse.json(
        {
          error: 'Failed to send email and fallback storage',
          details: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'
        },
        { status: 500 }
      )
    }
  }
}

// GET endpoint to view stored emails (for demo purposes)
export async function GET() {
  return NextResponse.json({
    message: 'Stored emails',
    count: emailStorage.length,
    emails: emailStorage
  })
}
