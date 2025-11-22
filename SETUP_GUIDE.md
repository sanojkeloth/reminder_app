# Setup Guide - FullScreen Alert App

This guide will help you set up the development environment and configure API integrations for the FullScreen Alert app.

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Platform-Specific Requirements

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`
- macOS 13.0 (Ventura) or later

**Windows:**
- Windows 10 (version 1809) or later, or Windows 11
- Visual Studio Build Tools or Visual C++ Build Tools

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fullscreen-alert-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Electron
- React & React DOM
- TypeScript
- Vite
- Tailwind CSS
- SQLite (better-sqlite3)
- And more...

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Now edit `.env` and add your API credentials (see API Setup section below).

## API Setup

### Google Calendar Integration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name it "FullScreen Alert" or similar
   - Click "Create"

3. **Enable Google Calendar API**
   - In the dashboard, click "Enable APIs and Services"
   - Search for "Google Calendar API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: FullScreen Alert
     - User support email: your email
     - Developer contact: your email
   - Application type: "Desktop app"
   - Name: "FullScreen Alert Desktop"
   - Click "Create"

5. **Copy Credentials to .env**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

6. **Add Authorized Redirect URIs**
   - In your OAuth client settings
   - Add: `http://localhost:3000/oauth/google/callback`

### Microsoft Outlook/Office 365 Integration (Coming Soon)

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com/

2. **Register an Application**
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "FullScreen Alert"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: "Public client/native" → `http://localhost:3000/oauth/microsoft/callback`
   - Click "Register"

3. **Configure API Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - `Calendars.Read`
     - `Calendars.ReadWrite`
     - `User.Read`
   - Click "Add permissions"
   - Click "Grant admin consent"

4. **Copy Credentials to .env**
   ```bash
   MICROSOFT_CLIENT_ID=your_application_id_here
   MICROSOFT_CLIENT_SECRET=your_client_secret_here
   ```

### Todoist Integration (Optional)

1. **Go to Todoist App Management**
   - Visit: https://developer.todoist.com/appconsole.html

2. **Create a New App**
   - Click "Create new app"
   - App name: "FullScreen Alert"
   - OAuth redirect URL: `http://localhost:3000/oauth/todoist/callback`

3. **Copy Credentials to .env**
   ```bash
   TODOIST_CLIENT_ID=your_client_id_here
   TODOIST_CLIENT_SECRET=your_client_secret_here
   ```

## Running the Application

### Development Mode

Start the app in development mode with hot reload:

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Launch Electron
3. Open DevTools automatically

### Production Build

Build the app for your current platform:

```bash
npm run electron:build
```

The built application will be in the `release/` directory.

### Build for Testing (Without Packaging)

To build faster without creating installers:

```bash
npm run build:dir
```

## Troubleshooting

### Common Issues

**Issue: `npm install` fails with better-sqlite3 errors**
- **Solution**: Install build tools for your platform
  - macOS: `xcode-select --install`
  - Windows: Install Visual Studio Build Tools

**Issue: Electron window is blank**
- **Solution**: Check the DevTools console for errors
- Make sure Vite dev server is running on port 5173

**Issue: Database errors on startup**
- **Solution**: Delete the database file and restart
  - macOS: `~/Library/Application Support/fullscreen-alert/fullscreen-alert.db`
  - Windows: `%APPDATA%/fullscreen-alert/fullscreen-alert.db`

**Issue: Google Calendar OAuth fails**
- **Solution**:
  - Verify redirect URI matches exactly in Google Cloud Console
  - Check that Calendar API is enabled
  - Ensure OAuth consent screen is configured

### Debug Mode

To see detailed logs:

1. Open DevTools (automatically opens in dev mode)
2. Check Console and Network tabs
3. Main process logs appear in terminal
4. Renderer process logs appear in DevTools

## Development Tips

### Hot Reload

- **Renderer Process**: Changes to React components will hot reload automatically
- **Main Process**: Changes to Electron main process require full restart

### Database Inspection

View the SQLite database:

```bash
# Install sqlite3 command line tool
# macOS: brew install sqlite3
# Windows: Download from https://www.sqlite.org/download.html

# Open database
sqlite3 ~/Library/Application\ Support/fullscreen-alert/fullscreen-alert.db

# View tables
.tables

# View events
SELECT * FROM events;
```

### Testing Alerts

To test alerts without waiting:

1. Connect a calendar
2. Create a test event 2 minutes in the future
3. Wait for sync
4. Alert should trigger 5 minutes before (so it won't trigger for a 2-min event)

Or modify `AlertScheduler.ts` to reduce lead time for testing.

## Next Steps

Once setup is complete:

1. **Connect Google Calendar** in Settings tab
2. **Customize alert preferences** in Settings
3. **Test with a demo alert** (create a calendar event)
4. **Explore statistics** after a few alerts

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [React Documentation](https://react.dev/)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)

## Need Help?

- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub
- Review existing issues for solutions

Happy coding! 🚀
