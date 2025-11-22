import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { DateTime } from 'luxon'

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client | null = null
  private calendar: any = null

  // These would be stored in environment variables or secure config
  private readonly CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'
  private readonly CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET'
  private readonly REDIRECT_URI = 'http://localhost:3000/oauth/google/callback'

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    this.oauth2Client = new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      this.REDIRECT_URI
    )

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
  }

  async authenticate(): Promise<any> {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized')
    }

    // Generate auth URL
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly'
      ],
      prompt: 'consent'
    })

    // Return auth URL for the main process to open in browser
    return {
      authUrl,
      // The callback handler would be set up separately
    }
  }

  async setTokens(tokens: any) {
    if (!this.oauth2Client) return

    this.oauth2Client.setCredentials(tokens)
  }

  async getEvents(): Promise<any[]> {
    if (!this.calendar) {
      throw new Error('Calendar not initialized')
    }

    try {
      // Get events from now to 30 days in the future
      const timeMin = DateTime.now().toISO()
      const timeMax = DateTime.now().plus({ days: 30 }).toISO()

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      return []
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized')
    }

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()
    return credentials
  }
}
