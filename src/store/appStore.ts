import { create } from 'zustand'

interface AppState {
  settings: Record<string, string>
  events: any[]
  isLoading: boolean

  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Record<string, string>) => Promise<void>
  loadEvents: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  settings: {},
  events: [],
  isLoading: false,

  loadSettings: async () => {
    try {
      const settings = await window.electronAPI?.getSettings()
      set({ settings: settings || {} })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  },

  updateSettings: async (settings: Record<string, string>) => {
    try {
      await window.electronAPI?.updateSettings(settings)
      set({ settings })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  },

  loadEvents: async () => {
    set({ isLoading: true })
    try {
      const events = await window.electronAPI?.getEvents()
      set({ events: events || [], isLoading: false })
    } catch (error) {
      console.error('Failed to load events:', error)
      set({ isLoading: false })
    }
  }
}))
