# FullScreen Alert App

A cross-platform (macOS and Windows) desktop application that provides impossible-to-miss, full-screen alerts for calendar events, reminders, and tasks.

## Features

- **Full-Screen Alerts**: Impossible-to-miss alerts that take over your entire screen
- **Multi-Calendar Integration**: Sync with Google Calendar, Microsoft Outlook, iCloud Calendar
- **Meeting Link Detection**: Automatically detects meeting links from 30+ video conferencing platforms
- **One-Click Join**: Join meetings instantly from the alert screen
- **Privacy First**: 100% local data processing - no cloud backend
- **Statistics**: Track your meeting attendance and productivity
- **Customizable**: Adjust timing, sounds, and display preferences

## Tech Stack

- **Framework**: Electron
- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS
- **State Management**: Zustand
- **Database**: SQLite (better-sqlite3)
- **Build Tool**: Vite

## Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run electron:dev
```

### Building

```bash
# Build for current platform
npm run electron:build

# Build directory only (for testing)
npm run build:dir
```

## Project Structure

```
├── electron/               # Electron main process
│   ├── main.ts            # Main entry point
│   ├── preload.ts         # Preload script
│   ├── database/          # Database layer
│   │   └── DatabaseManager.ts
│   └── services/          # Backend services
│       ├── AlertScheduler.ts
│       ├── CalendarSync.ts
│       ├── MeetingLinkDetector.ts
│       └── integrations/
│           └── GoogleCalendarService.ts
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── AlertScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── Statistics.tsx
│   │   └── Onboarding.tsx
│   ├── store/            # Zustand state management
│   │   └── appStore.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Configuration

### Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add credentials to environment variables:

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Features Roadmap

### Phase 1: MVP (Current)
- [x] Full-screen alert system
- [x] Google Calendar integration
- [x] Meeting link detection
- [x] Basic settings
- [x] SQLite database
- [x] Menu bar/system tray

### Phase 2: Core Features
- [ ] Multi-monitor support
- [ ] Microsoft Outlook integration
- [ ] Todoist integration
- [ ] Audio notifications with rotation
- [ ] Customizable alert timing
- [ ] Snooze functionality

### Phase 3: Polish
- [ ] Apple Reminders (macOS)
- [ ] Recurring custom reminders
- [ ] Advanced statistics
- [ ] All 30+ video platforms
- [ ] Accessibility features
- [ ] Auto-update system

### Phase 4: Monetization
- [ ] 14-day trial system
- [ ] Payment integration
- [ ] License validation

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
