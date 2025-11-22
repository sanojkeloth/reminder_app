import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

export interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  meetingUrl?: string
  provider: string // 'google', 'outlook', etc.
  providerId: string // External event ID
  calendarId: string
  eventType: 'meeting' | 'event' | 'reminder' | 'task'
  status: 'active' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  eventId: string
  scheduledTime: string
  status: 'pending' | 'shown' | 'dismissed' | 'snoozed' | 'joined'
  action?: 'dismiss' | 'snooze' | 'join'
  actionTime?: string
  snoozeCount: number
  createdAt: string
}

export interface Settings {
  id: number
  key: string
  value: string
  updatedAt: string
}

export class DatabaseManager {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'fullscreen-alert.db')
  }

  initialize() {
    this.db = new Database(this.dbPath)
    this.createTables()
    this.setDefaultSettings()
  }

  private createTables() {
    if (!this.db) return

    // Events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        location TEXT,
        meeting_url TEXT,
        provider TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        calendar_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_id)
      )
    `)

    // Alerts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        action TEXT,
        action_time TEXT,
        snooze_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `)

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // OAuth tokens table (encrypted storage)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT UNIQUE NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Statistics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        alert_id TEXT,
        event_type TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
      CREATE INDEX IF NOT EXISTS idx_alerts_scheduled_time ON alerts(scheduled_time);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
    `)
  }

  private setDefaultSettings() {
    if (!this.db) return

    const defaults = {
      'alert.default_lead_time_meeting': '5',
      'alert.default_lead_time_event': '3',
      'alert.sound_enabled': 'true',
      'alert.sound_volume': '70',
      'alert.display_mode': 'all', // 'all', 'primary', 'external', 'cursor'
      'app.launch_at_startup': 'true',
      'app.theme': 'light',
      'calendar.sync_interval': '5', // minutes
      'notifications.respect_dnd': 'true'
    }

    const insert = this.db.prepare(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
    )

    for (const [key, value] of Object.entries(defaults)) {
      insert.run(key, value)
    }
  }

  // Event operations
  upsertEvent(event: Omit<Event, 'createdAt' | 'updatedAt'>) {
    if (!this.db) return

    const stmt = this.db.prepare(`
      INSERT INTO events (
        id, title, description, start_time, end_time, location,
        meeting_url, provider, provider_id, calendar_id, event_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(provider, provider_id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        location = excluded.location,
        meeting_url = excluded.meeting_url,
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `)

    stmt.run(
      event.id,
      event.title,
      event.description || null,
      event.startTime,
      event.endTime,
      event.location || null,
      event.meetingUrl || null,
      event.provider,
      event.providerId,
      event.calendarId,
      event.eventType,
      event.status
    )
  }

  getUpcomingEvents(limit = 50): Event[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT * FROM events
      WHERE start_time > datetime('now')
      AND status = 'active'
      ORDER BY start_time ASC
      LIMIT ?
    `)

    const rows = stmt.all(limit) as any[]
    return rows.map(this.mapRowToEvent)
  }

  getEventById(id: string): Event | null {
    if (!this.db) return null

    const stmt = this.db.prepare('SELECT * FROM events WHERE id = ?')
    const row = stmt.get(id) as any

    return row ? this.mapRowToEvent(row) : null
  }

  private mapRowToEvent(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      meetingUrl: row.meeting_url,
      provider: row.provider,
      providerId: row.provider_id,
      calendarId: row.calendar_id,
      eventType: row.event_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  // Alert operations
  createAlert(alert: Omit<Alert, 'createdAt'>) {
    if (!this.db) return

    const stmt = this.db.prepare(`
      INSERT INTO alerts (id, event_id, scheduled_time, status, snooze_count)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      alert.id,
      alert.eventId,
      alert.scheduledTime,
      alert.status,
      alert.snoozeCount
    )
  }

  updateAlertStatus(alertId: string, status: string, action?: string) {
    if (!this.db) return

    const stmt = this.db.prepare(`
      UPDATE alerts
      SET status = ?, action = ?, action_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(status, action || null, alertId)
  }

  getPendingAlerts(): Alert[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT * FROM alerts
      WHERE status = 'pending'
      AND scheduled_time <= datetime('now', '+1 minute')
      ORDER BY scheduled_time ASC
    `)

    return stmt.all() as Alert[]
  }

  // Settings operations
  getSetting(key: string): string | null {
    if (!this.db) return null

    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
    const row = stmt.get(key) as any

    return row ? row.value : null
  }

  getSettings(): Record<string, string> {
    if (!this.db) return {}

    const stmt = this.db.prepare('SELECT key, value FROM settings')
    const rows = stmt.all() as any[]

    return rows.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, string>)
  }

  updateSettings(settings: Record<string, string>) {
    if (!this.db) return

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `)

    const transaction = this.db.transaction((settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        stmt.run(key, value)
      }
    })

    transaction(settings)
  }

  // Statistics
  recordAction(eventId: string, alertId: string | null, eventType: string, action: string) {
    if (!this.db) return

    const stmt = this.db.prepare(`
      INSERT INTO statistics (event_id, alert_id, event_type, action)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(eventId, alertId, eventType, action)
  }

  getStatistics(period: 'day' | 'week' | 'month' | 'all' = 'week') {
    if (!this.db) return null

    let dateFilter = ''
    switch (period) {
      case 'day':
        dateFilter = "AND timestamp > datetime('now', '-1 day')"
        break
      case 'week':
        dateFilter = "AND timestamp > datetime('now', '-7 days')"
        break
      case 'month':
        dateFilter = "AND timestamp > datetime('now', '-30 days')"
        break
    }

    const stmt = this.db.prepare(`
      SELECT
        event_type,
        action,
        COUNT(*) as count
      FROM statistics
      WHERE 1=1 ${dateFilter}
      GROUP BY event_type, action
    `)

    return stmt.all()
  }

  close() {
    if (this.db) {
      this.db.close()
    }
  }
}
