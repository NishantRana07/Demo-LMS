// Simple test to verify email configuration
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'nishantelite007@gmail.com',
        pass: process.env.SMTP_PASS || 'qpkwezdzhhacbecm',
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection verified successfully');

    // Test email
    const mailOptions = {
      from: process.env.HOST_EMAIL || 'nishantelite007@gmail.com',
      to: 'nishantelite007@gmail.com',
      subject: 'Test Email from QEdge LMS',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the NodeMailer configuration is working correctly.</p>
        <p>If you receive this email, the email functionality is ready to use!</p>
        <br>
        <p>Best regards,<br>QEdge LMS Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testEmail();
