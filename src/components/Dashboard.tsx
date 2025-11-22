import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { useAppStore } from '../store/appStore'
import Settings from './Settings'
import Statistics from './Statistics'

interface Event {
  id: string
  title: string
  startTime: string
  endTime: string
  eventType: string
  meetingUrl?: string
  provider: string
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'settings' | 'stats'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const { settings } = useAppStore()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const eventsData = await window.electronAPI?.getEvents()
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleSync = async () => {
    try {
      await window.electronAPI?.syncCalendars()
      await loadEvents()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const renderEvents = () => {
    const upcomingEvents = events.filter(e => {
      const eventTime = DateTime.fromISO(e.startTime)
      return eventTime > DateTime.now()
    })

    if (upcomingEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">No upcoming events</p>
          </div>
          <button
            onClick={handleSync}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sync Calendars
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {upcomingEvents.slice(0, 20).map(event => {
          const startTime = DateTime.fromISO(event.startTime)
          const isToday = startTime.hasSame(DateTime.now(), 'day')
          const isTomorrow = startTime.hasSame(DateTime.now().plus({ days: 1 }), 'day')

          return (
            <div
              key={event.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.eventType === 'meeting'
                        ? 'bg-blue-100 text-blue-700'
                        : event.eventType === 'reminder'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.eventType}
                    </span>
                    {event.meetingUrl && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video call
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <div className="text-sm text-gray-600">
                    {isToday && 'Today, '}
                    {isTomorrow && 'Tomorrow, '}
                    {!isToday && !isTomorrow && startTime.toFormat('EEE, MMM d, ')}
                    {startTime.toFormat('h:mm a')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {event.provider}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">FullScreen Alert</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'events'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'stats' && <Statistics />}
      </div>
    </div>
  )
}

export default Dashboard
