import { DatabaseManager } from '../database/DatabaseManager'
import { GoogleCalendarService } from './integrations/GoogleCalendarService'
import { MeetingLinkDetector } from './MeetingLinkDetector'
import { DateTime } from 'luxon'

export class CalendarSync {
  private dbManager: DatabaseManager
  private googleService: GoogleCalendarService
  private meetingLinkDetector: MeetingLinkDetector
  private syncInterval: NodeJS.Timeout | null = null

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager
    this.googleService = new GoogleCalendarService()
    this.meetingLinkDetector = new MeetingLinkDetector()
  }

  async connectGoogle(): Promise<any> {
    return await this.googleService.authenticate()
  }

  async disconnect(provider: string): Promise<void> {
    // Clear OAuth tokens from database
    // Implementation depends on secure storage mechanism
  }

  startSync() {
    // Get sync interval from settings (default 5 minutes)
    const settings = this.dbManager.getSettings()
    const intervalMinutes = parseInt(settings['calendar.sync_interval'] || '5')

    // Sync immediately
    this.syncAll()

    // Then sync periodically
    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, intervalMinutes * 60 * 1000)
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncAll() {
    try {
      // Sync Google Calendar
      await this.syncGoogle()

      // Future: sync other providers (Outlook, iCloud, etc.)
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  private async syncGoogle() {
    try {
      const events = await this.googleService.getEvents()

      for (const gcalEvent of events) {
        // Detect meeting link
        const meetingUrl = this.meetingLinkDetector.detectLink(
          gcalEvent.description || '',
          gcalEvent.location || ''
        )

        // Determine event type
        let eventType: 'meeting' | 'event' = 'event'
        if (meetingUrl || gcalEvent.conferenceData) {
          eventType = 'meeting'
        }

        // Store in database
        this.dbManager.upsertEvent({
          id: `google_${gcalEvent.id}`,
          title: gcalEvent.summary || 'Untitled Event',
          description: gcalEvent.description || '',
          startTime: gcalEvent.start.dateTime || gcalEvent.start.date,
          endTime: gcalEvent.end.dateTime || gcalEvent.end.date,
          location: gcalEvent.location || '',
          meetingUrl: meetingUrl || this.extractConferenceLink(gcalEvent),
          provider: 'google',
          providerId: gcalEvent.id,
          calendarId: gcalEvent.organizer?.email || 'primary',
          eventType: eventType,
          status: gcalEvent.status === 'cancelled' ? 'cancelled' : 'active'
        })
      }

      console.log(`Synced ${events.length} events from Google Calendar`)
    } catch (error) {
      console.error('Google Calendar sync error:', error)
    }
  }

  private extractConferenceLink(gcalEvent: any): string | null {
    if (gcalEvent.conferenceData?.entryPoints) {
      const videoEntry = gcalEvent.conferenceData.entryPoints.find(
        (ep: any) => ep.entryPointType === 'video'
      )
      return videoEntry?.uri || null
    }
    return null
  }
}
