import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('[v0] SMTP not configured, returning demo mode')
      return NextResponse.json({
        success: true,
        message: 'Email service running in demo mode (SMTP not configured)',
        demoMode: true,
        smtpConfigured: false
      }, { status: 200 })
    }

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

    // Test connection
    await transporter.verify()

    return NextResponse.json(
      {
        success: true,
        message: 'Email configuration is working correctly',
        smtpConfigured: true,
        demoMode: false
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Email configuration test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Email configuration test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        smtpConfigured: false,
        demoMode: false
      },
      { status: 500 }
    )
  }
}
