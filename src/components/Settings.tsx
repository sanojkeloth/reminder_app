import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

function Settings() {
  const { settings, updateSettings } = useAppStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    await updateSettings(localSettings)
    setHasChanges(false)
  }

  const handleConnectGoogle = async () => {
    try {
      const result = await window.electronAPI?.connectGoogle()
      console.log('Google connection result:', result)
    } catch (error) {
      console.error('Failed to connect Google:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Integrations Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar Integrations</h2>

          <div className="space-y-4">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  G
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-500">Connect your Google Calendar</p>
                </div>
              </div>
              <button
                onClick={handleConnectGoogle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Connect
              </button>
            </div>

            {/* Microsoft Outlook */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  O
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Microsoft Outlook</h3>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Alert Timing Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Timing</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting alerts (minutes before)
              </label>
              <select
                value={localSettings['alert.default_lead_time_meeting'] || '5'}
                onChange={(e) => handleChange('alert.default_lead_time_meeting', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 minute</option>
                <option value="2">2 minutes</option>
                <option value="3">3 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular event alerts (minutes before)
              </label>
              <select
                value={localSettings['alert.default_lead_time_event'] || '3'}
                onChange={(e) => handleChange('alert.default_lead_time_event', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 minute</option>
                <option value="2">2 minutes</option>
                <option value="3">3 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sound Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Enable sound alerts</h3>
                <p className="text-sm text-gray-500">Play audio when alerts appear</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings['alert.sound_enabled'] === 'true'}
                  onChange={(e) => handleChange('alert.sound_enabled', e.target.checked.toString())}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {localSettings['alert.sound_volume'] || '70'}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings['alert.sound_volume'] || '70'}
                onChange={(e) => handleChange('alert.sound_volume', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Display Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show alerts on
            </label>
            <select
              value={localSettings['alert.display_mode'] || 'all'}
              onChange={(e) => handleChange('alert.display_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All displays</option>
              <option value="primary">Primary display only</option>
              <option value="external">External displays only</option>
              <option value="cursor">Display where cursor is located</option>
            </select>
          </div>
        </div>

        {/* App Settings */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">App Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Launch at startup</h3>
                <p className="text-sm text-gray-500">Start app when you log in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings['app.launch_at_startup'] === 'true'}
                  onChange={(e) => handleChange('app.launch_at_startup', e.target.checked.toString())}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar sync interval
              </label>
              <select
                value={localSettings['calendar.sync_interval'] || '5'}
                onChange={(e) => handleChange('calendar.sync_interval', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">Every 2 minutes</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

export default Settings
