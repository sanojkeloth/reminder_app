# ⚡ Quick Start Guide

Get the FullScreen Alert app running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Git installed (`git --version`)

## Step 1: Environment Setup (1 minute)

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **For now, you can skip adding API credentials** (optional for initial testing)
   - The app will work without Google Calendar integration
   - You can add credentials later to enable calendar sync

## Step 2: Install Dependencies (1-2 minutes)

```bash
npm install
```

This installs all required packages (~550 packages).

## Step 3: Start Development Server (30 seconds)

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server on port 5173
2. Launch Electron with DevTools open
3. Show the dashboard with onboarding

## What You'll See

### First Launch: Onboarding
- 4-step tutorial introducing the app
- Click "Next" to go through or "Skip" to jump to dashboard

### Dashboard
- **Events Tab**: Shows upcoming calendar events (empty until you connect a calendar)
- **Statistics Tab**: Analytics of your alert interactions
- **Settings Tab**: Configure integrations, timing, sounds, and display

### Menu Bar/System Tray
- Icon in your menu bar (macOS) or system tray (Windows)
- Right-click for quick actions
- Keep the app running in background

## Step 4: Test an Alert (Optional)

To see a full-screen alert without waiting for a real event:

1. **Manually trigger test data** (Developer mode):
   - Open DevTools (Cmd+Option+I on macOS, Ctrl+Shift+I on Windows)
   - This is automatically open in dev mode

2. **Or connect Google Calendar**:
   - Go to Settings tab
   - Click "Connect" under Google Calendar
   - Follow OAuth flow (requires API credentials in .env)
   - Create a test calendar event 2 minutes in the future
   - Alert will trigger 5 minutes before (so won't work for near events)

## Common Issues

### Port 5173 already in use
```bash
# Kill the process using port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Electron window is blank
- Check terminal for errors
- Make sure Vite dev server started successfully
- Try refreshing: Cmd+R (macOS) or Ctrl+R (Windows)

### npm install fails (better-sqlite3 errors)
**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install Visual Studio Build Tools
- Or install windows-build-tools: `npm install --global windows-build-tools`

## Next Steps

1. **Review the codebase**:
   - Check `electron/` for backend services
   - Check `src/components/` for React UI

2. **Configure Google Calendar** (optional):
   - See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed OAuth setup
   - Get credentials from Google Cloud Console

3. **Customize settings**:
   - Adjust alert timing in Settings tab
   - Configure display preferences
   - Set sound volume

4. **Build the app**:
   ```bash
   npm run build:dir
   ```
   - Creates distributable in `release/` folder

## Development Tips

### Hot Reload
- **React components**: Changes reload automatically
- **Electron main process**: Requires restart (Ctrl+C and restart)

### View Database
Database location:
- **macOS**: `~/Library/Application Support/fullscreen-alert/fullscreen-alert.db`
- **Windows**: `%APPDATA%/fullscreen-alert/fullscreen-alert.db`

Inspect with:
```bash
sqlite3 ~/Library/Application\ Support/fullscreen-alert/fullscreen-alert.db
.tables
SELECT * FROM events;
```

### Check Logs
- **Main process**: Terminal output
- **Renderer process**: DevTools console (automatically open in dev mode)

## Keyboard Shortcuts (in Alert Screen)

- `Esc` - Dismiss alert
- `Enter` - Join meeting (if applicable)
- `1` - Snooze 5 minutes
- `2` - Snooze 10 minutes

## Need Help?

- 📖 **Full Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🤝 **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 📊 **Project Status**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- 📝 **README**: [README.md](./README.md)

## What's Working Now (MVP)

✅ Full-screen alert display
✅ Settings persistence
✅ Statistics tracking
✅ Event list dashboard
✅ Onboarding flow
✅ SQLite database
✅ Meeting link detection (30+ platforms)

## What's Coming Next

⏳ Google Calendar OAuth flow
⏳ Real tray icons
⏳ Alert sounds
⏳ Multi-monitor support
⏳ Microsoft Outlook integration
⏳ Todoist integration

---

**Happy coding! 🚀**

If you encounter any issues, check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting.
