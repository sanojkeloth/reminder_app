import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'

interface AlertData {
  alertId: string
  event: {
    id: string
    title: string
    description?: string
    startTime: string
    endTime: string
    location?: string
    meetingUrl?: string
    eventType: 'meeting' | 'event' | 'reminder' | 'task'
    provider: string
  }
  timestamp: string
}

function AlertScreen() {
  const [alertData, setAlertData] = useState<AlertData | null>(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    // Listen for alert data from main process
    window.electronAPI?.onAlertShow((data: AlertData) => {
      setAlertData(data)
      playSound()
    })

    window.electronAPI?.onAlertUpdate((data: AlertData) => {
      setAlertData(data)
    })
  }, [])

  useEffect(() => {
    if (!alertData) return

    const interval = setInterval(() => {
      const now = DateTime.now()
      const eventStart = DateTime.fromISO(alertData.event.startTime)
      const diff = eventStart.diff(now, ['hours', 'minutes', 'seconds'])

      if (diff.milliseconds < 0) {
        setCountdown('Event has started')
      } else if (diff.hours >= 1) {
        setCountdown(`${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m until event`)
      } else if (diff.minutes >= 1) {
        setCountdown(`${Math.floor(diff.minutes)}m ${Math.floor(diff.seconds)}s until event`)
      } else {
        setCountdown(`${Math.floor(diff.seconds)}s until event`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [alertData])

  const playSound = () => {
    // Play alert sound
    const audio = new Audio('/sounds/alert-1.mp3')
    audio.volume = 0.7
    audio.play().catch(err => console.error('Sound play error:', err))
  }

  const handleDismiss = () => {
    if (alertData) {
      window.electronAPI?.dismissAlert(alertData.alertId)
    }
  }

  const handleSnooze = (minutes: number) => {
    if (alertData) {
      window.electronAPI?.snoozeAlert(alertData.alertId, minutes)
    }
  }

  const handleJoinMeeting = () => {
    if (alertData && alertData.event.meetingUrl) {
      window.electronAPI?.joinMeeting(alertData.alertId, alertData.event.meetingUrl)
    }
  }

  if (!alertData) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading alert...</div>
      </div>
    )
  }

  const { event } = alertData
  const eventStart = DateTime.fromISO(event.startTime)
  const eventEnd = DateTime.fromISO(event.endTime)

  // Determine background color based on event type
  const getBgColor = () => {
    switch (event.eventType) {
      case 'meeting':
        return 'bg-gradient-to-br from-blue-600 to-blue-800'
      case 'reminder':
        return 'bg-gradient-to-br from-purple-600 to-purple-800'
      case 'task':
        return 'bg-gradient-to-br from-green-600 to-green-800'
      default:
        return 'bg-gradient-to-br from-gray-700 to-gray-900'
    }
  }

  return (
    <div className={`w-screen h-screen ${getBgColor()} flex items-center justify-center p-8`}>
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
        {/* Event Type Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium uppercase tracking-wide">
            {event.eventType}
          </span>
        </div>

        {/* Event Title */}
        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          {event.title}
        </h1>

        {/* Event Time */}
        <div className="text-2xl text-white/90 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{eventStart.toFormat('h:mm a')}</span>
            {eventEnd && (
              <>
                <span>—</span>
                <span>{eventEnd.toFormat('h:mm a')}</span>
              </>
            )}
          </div>
          <div className="text-xl text-white/70 ml-9">
            {countdown}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="text-lg text-white/80 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="text-white/70 text-lg mb-8 line-clamp-3">
            {event.description}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12">
          {/* Join Meeting Button (if applicable) */}
          {event.meetingUrl && (
            <button
              onClick={handleJoinMeeting}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 px-8 py-5 rounded-2xl font-semibold text-xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Meeting
            </button>
          )}

          {/* Snooze Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSnooze(5)}
              className="px-6 py-5 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-medium transition-all"
            >
              Snooze 5m
            </button>
            <button
              onClick={() => handleSnooze(10)}
              className="px-6 py-5 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-medium transition-all"
            >
              Snooze 10m
            </button>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all"
          >
            Dismiss
          </button>
        </div>

        {/* Provider Info */}
        <div className="mt-8 text-white/50 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>From {event.provider}</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-sm">
        Press <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> to dismiss
      </div>
    </div>
  )
}

export default AlertScreen
