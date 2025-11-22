import { useState, useEffect } from 'react'

interface StatsData {
  event_type: string
  action: string
  count: number
}

function Statistics() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week')
  const [stats, setStats] = useState<StatsData[]>([])

  useEffect(() => {
    loadStatistics()
  }, [period])

  const loadStatistics = async () => {
    try {
      const data = await window.electronAPI?.getStatistics(period)
      setStats(data || [])
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  const getTotalByAction = (action: string) => {
    return stats
      .filter(s => s.action === action)
      .reduce((sum, s) => sum + s.count, 0)
  }

  const getTotalEvents = () => {
    return stats.reduce((sum, s) => sum + s.count, 0)
  }

  const getOnTimeRate = () => {
    const joined = getTotalByAction('joined')
    const shown = getTotalByAction('shown')
    if (shown === 0) return 0
    return Math.round((joined / shown) * 100)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setPeriod('day')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'day'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Alerts</div>
          <div className="text-3xl font-bold text-gray-900">{getTotalEvents()}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Joined On Time</div>
          <div className="text-3xl font-bold text-green-600">{getTotalByAction('joined')}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">On-Time Rate</div>
          <div className="text-3xl font-bold text-blue-600">{getOnTimeRate()}%</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Breakdown</h2>

        {stats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No statistics available for this period
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group by action */}
            {['shown', 'joined', 'dismissed', 'snoozed'].map(action => {
              const actionStats = stats.filter(s => s.action === action)
              if (actionStats.length === 0) return null

              const total = actionStats.reduce((sum, s) => sum + s.count, 0)

              return (
                <div key={action} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">{action}</h3>
                    <span className="text-2xl font-semibold text-gray-900">{total}</span>
                  </div>
                  <div className="space-y-2">
                    {actionStats.map(stat => (
                      <div key={`${stat.event_type}-${stat.action}`} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{stat.event_type}</span>
                        <span className="text-gray-900 font-medium">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      {getTotalEvents() > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Insights
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            {getOnTimeRate() >= 90 && (
              <li>🎉 Excellent! You're joining {getOnTimeRate()}% of your meetings on time.</li>
            )}
            {getOnTimeRate() < 90 && getOnTimeRate() >= 70 && (
              <li>👍 Good job! You're joining {getOnTimeRate()}% of meetings on time. Keep it up!</li>
            )}
            {getOnTimeRate() < 70 && (
              <li>💡 You're joining {getOnTimeRate()}% of meetings on time. Consider reducing snooze frequency.</li>
            )}
            {getTotalByAction('snoozed') > getTotalByAction('joined') && (
              <li>⏰ You're snoozing alerts frequently. Try setting alerts closer to event times.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Statistics
