export interface MicrosoftUser {
  id: string
  displayName: string
  mail: string
  userPrincipalName: string
  jobTitle?: string
  department?: string
  officeLocation?: string
}

export interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
  id_token: string
}

export class MicrosoftAuthService {
  private static instance: MicrosoftAuthService
  private readonly clientId: string
  private readonly tenantId: string
  private readonly redirectUri: string
  private readonly scope: string

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || ''
    this.tenantId = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common'
    this.redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || 
      (typeof window !== 'undefined' ? `${window.location.origin}/auth/microsoft/callback` : 'http://localhost:3000/auth/microsoft/callback')
    this.scope = 'openid profile email User.Read Mail.Read Calendars.Read'
  }

  static getInstance(): MicrosoftAuthService {
    if (!MicrosoftAuthService.instance) {
      MicrosoftAuthService.instance = new MicrosoftAuthService()
    }
    return MicrosoftAuthService.instance
  }

  getAuthorizationUrl(): string {
    const authUrl = new URL('https://login.microsoftonline.com/' + this.tenantId + '/oauth2/v2.0/authorize')
    
    authUrl.searchParams.append('client_id', this.clientId)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('redirect_uri', this.redirectUri)
    authUrl.searchParams.append('scope', this.scope)
    authUrl.searchParams.append('response_mode', 'query')
    authUrl.searchParams.append('state', this.generateState())
    authUrl.searchParams.append('nonce', this.generateNonce())

    return authUrl.toString()
  }

  async exchangeCodeForToken(code: string): Promise<MicrosoftTokenResponse> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        scope: this.scope,
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  async getUserInfo(accessToken: string): Promise<MicrosoftUser> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    return response.json()
  }

  async refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenResponse> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        scope: this.scope,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }

  async getCalendarEvents(accessToken: string, startDate: Date, endDate: Date): Promise<any[]> {
    const startTime = startDate.toISOString()
    const endTime = endDate.toISOString()
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${startTime}&endDateTime=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get calendar events')
    }

    const data = await response.json()
    return data.value || []
  }

  async createCalendarEvent(accessToken: string, eventData: {
    subject: string
    body: { contentType: string; content: string }
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    attendees?: Array<{ emailAddress: { address: string; name: string } }>
    isOnlineMeeting?: boolean
  }): Promise<any> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error('Failed to create calendar event')
    }

    return response.json()
  }

  async sendEmail(accessToken: string, emailData: {
    message: {
      subject: string
      body: { contentType: string; content: string }
      toRecipients: Array<{ emailAddress: { address: string; name: string } }>
    }
    saveToSentItems?: boolean
  }): Promise<any> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return response.json()
  }

  async getTeamsMeetings(accessToken: string): Promise<any[]> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Teams meetings')
    }

    const data = await response.json()
    return data.value || []
  }

  async createTeamsMeeting(accessToken: string, meetingData: {
    subject: string
    startDateTime: string
    endDateTime: string
    participants?: {
      attendees?: Array<{ upn: string; role: string }>
    }
  }): Promise<any> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDateTime: meetingData.startDateTime,
        endDateTime: meetingData.endDateTime,
        subject: meetingData.subject,
        participants: meetingData.participants || {
          attendees: []
        }
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Teams meeting')
    }

    return response.json()
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  validateState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState
  }

  async revokeToken(accessToken: string): Promise<void> {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to revoke token')
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && process.env.MICROSOFT_CLIENT_SECRET)
  }

  getConfigurationStatus(): {
    clientId: boolean
    clientSecret: boolean
    redirectUri: boolean
    fullyConfigured: boolean
  } {
    return {
      clientId: !!this.clientId,
      clientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      redirectUri: !!this.redirectUri,
      fullyConfigured: this.isConfigured()
    }
  }
}

export const microsoftAuth = MicrosoftAuthService.getInstance()
