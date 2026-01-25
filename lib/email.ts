import { emailService } from './email-service'

export { emailService }
export type { EmailData, EmailAttachment, EmailTemplate } from './email-service'

// Legacy functions for backward compatibility
export async function sendAnnouncementEmail(data: {
  to: string[]
  subject: string
  htmlContent: string
  senderId: string
}) {
  return emailService.sendEmail(data)
}

export function generateAnnouncementEmailHTML(title: string, content: string, priority: string, senderName: string): string {
  return emailService.generateAnnouncementEmailHTML(title, content, priority, senderName)
}

export function getRecipientEmails(audience: string): string[] {
  return emailService.getRecipientEmails(audience)
}
