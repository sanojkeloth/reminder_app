import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'
import { useAppStore } from './store/appStore'

function App() {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const { settings, loadSettings } = useAppStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    // Check if this is first launch
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
    setIsOnboarding(!hasCompletedOnboarding)
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setIsOnboarding(false)
  }

  if (isOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <Dashboard />
}

export default App
