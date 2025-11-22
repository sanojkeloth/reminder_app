import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-2xl">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-12">
          {step === 1 && (
            <>
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Never Miss a Meeting Again
              </h2>
              <p className="text-lg text-gray-600">
                FullScreen Alert provides impossible-to-miss alerts for your calendar events,
                perfect for people with time-blindness, deep focus, or ADHD.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect Your Calendars
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sync with Google Calendar, Microsoft Outlook, iCloud Calendar, and more.
                All data stays 100% local on your device.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <strong>Privacy first:</strong> Your calendar data is never uploaded to our servers.
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-6xl mb-6">🔔</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Full-Screen Alerts
              </h2>
              <p className="text-lg text-gray-600">
                When it's time for your event, your entire screen will show a large,
                clear alert with one-click meeting join buttons. You can customize
                timing, sounds, and display options.
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Track Your Progress
              </h2>
              <p className="text-lg text-gray-600">
                See statistics on meetings joined, on-time rate, and more.
                Build better habits and never miss important events.
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {step === 4 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
