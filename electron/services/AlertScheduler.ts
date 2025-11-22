import { EventEmitter } from 'events'
import { DatabaseManager, Event } from '../database/DatabaseManager'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export class AlertScheduler extends EventEmitter {
  private dbManager: DatabaseManager
  private checkInterval: NodeJS.Timeout | null = null
  private enabled: boolean = true

  constructor(dbManager: DatabaseManager) {
    super()
    this.dbManager = dbManager
  }

  start() {
    // Check for alerts every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkForAlerts()
    }, 30000)

    // Also check immediately on start
    this.checkForAlerts()
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  private checkForAlerts() {
    if (!this.enabled) return

    const pendingAlerts = this.dbManager.getPendingAlerts()

    for (const alert of pendingAlerts) {
      const now = DateTime.now()
      const scheduledTime = DateTime.fromISO(alert.scheduledTime)

      // If it's time to show the alert (within 1 minute window)
      if (scheduledTime <= now) {
        const event = this.dbManager.getEventById(alert.eventId)
        if (event) {
          this.triggerAlert(alert.id, event)
        }
      }
    }
  }

  private triggerAlert(alertId: string, event: Event) {
    // Update alert status
    this.dbManager.updateAlertStatus(alertId, 'shown')

    // Emit event to create alert window
    this.emit('trigger-alert', {
      alertId,
      event,
      timestamp: DateTime.now().toISO()
    })

    // Record in statistics
    this.dbManager.recordAction(event.id, alertId, event.eventType, 'shown')
  }

  dismissAlert(alertId: string) {
    this.dbManager.updateAlertStatus(alertId, 'dismissed', 'dismiss')

    const alert = this.dbManager.getPendingAlerts().find(a => a.id === alertId)
    if (alert) {
      const event = this.dbManager.getEventById(alert.eventId)
      if (event) {
        this.dbManager.recordAction(event.id, alertId, event.eventType, 'dismissed')
      }
    }
  }

  snoozeAlert(alertId: string, minutes: number) {
    this.dbManager.updateAlertStatus(alertId, 'snoozed', 'snooze')

    // Create new alert for snoozed time
    const alert = this.dbManager.getPendingAlerts().find(a => a.id === alertId)
    if (alert) {
      const newScheduledTime = DateTime.now().plus({ minutes }).toISO()

      this.dbManager.createAlert({
        id: uuidv4(),
        eventId: alert.eventId,
        scheduledTime: newScheduledTime,
        status: 'pending',
        snoozeCount: alert.snoozeCount + 1
      })

      const event = this.dbManager.getEventById(alert.eventId)
      if (event) {
        this.dbManager.recordAction(event.id, alertId, event.eventType, 'snoozed')
      }
    }
  }

  joinMeeting(alertId: string, meetingUrl: string) {
    this.dbManager.updateAlertStatus(alertId, 'joined', 'join')

    const alert = this.dbManager.getPendingAlerts().find(a => a.id === alertId)
    if (alert) {
      const event = this.dbManager.getEventById(alert.eventId)
      if (event) {
        this.dbManager.recordAction(event.id, alertId, event.eventType, 'joined')
      }
    }
  }

  scheduleAlertForEvent(event: Event) {
    // Get lead time from settings
    const settings = this.dbManager.getSettings()
    let leadTimeMinutes = 5 // default

    if (event.eventType === 'meeting' || event.meetingUrl) {
      leadTimeMinutes = parseInt(settings['alert.default_lead_time_meeting'] || '5')
    } else {
      leadTimeMinutes = parseInt(settings['alert.default_lead_time_event'] || '3')
    }

    // Calculate alert time
    const eventStart = DateTime.fromISO(event.startTime)
    const alertTime = eventStart.minus({ minutes: leadTimeMinutes })

    // Only schedule if in the future
    if (alertTime > DateTime.now()) {
      this.dbManager.createAlert({
        id: uuidv4(),
        eventId: event.id,
        scheduledTime: alertTime.toISO(),
        status: 'pending',
        snoozeCount: 0
      })
    }
  }
}
