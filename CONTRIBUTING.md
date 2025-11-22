# Contributing to FullScreen Alert App

Thank you for considering contributing to FullScreen Alert! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/fullscreen-alert-app.git
   cd fullscreen-alert-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   - Copy `.env.example` to `.env`
   - Add your API credentials for calendar integrations

4. **Run Development Server**
   ```bash
   npm run electron:dev
   ```

## Project Architecture

### Backend (Electron Main Process)
- **`electron/main.ts`**: Main entry point, window management
- **`electron/database/DatabaseManager.ts`**: SQLite database operations
- **`electron/services/AlertScheduler.ts`**: Alert scheduling engine
- **`electron/services/CalendarSync.ts`**: Calendar synchronization
- **`electron/services/MeetingLinkDetector.ts`**: Meeting link pattern matching

### Frontend (React Renderer Process)
- **`src/components/`**: React components
- **`src/store/`**: Zustand state management
- **`src/App.tsx`**: Main application router

### Communication
- Uses Electron IPC for secure communication between main and renderer processes
- Preload script (`electron/preload.ts`) exposes safe APIs to renderer

## Adding New Features

### Adding a New Calendar Integration

1. Create a new service in `electron/services/integrations/`
2. Implement the integration interface:
   ```typescript
   - authenticate(): Promise<any>
   - getEvents(): Promise<any[]>
   - refreshToken(refreshToken: string): Promise<any>
   ```
3. Add to `CalendarSync.ts` sync logic
4. Update UI in `Settings.tsx`

### Adding New Meeting Platform Detection

1. Add regex pattern to `MeetingLinkDetector.ts`
2. Test with sample meeting links
3. Update documentation

## Code Style

- **TypeScript**: Use strict mode, no `any` types unless absolutely necessary
- **React**: Functional components with hooks
- **Formatting**: Use Prettier (configured in project)
- **Linting**: Follow ESLint rules

## Testing

### Manual Testing Checklist
- [ ] Alert triggers at correct time
- [ ] Meeting links are detected properly
- [ ] Settings persist after app restart
- [ ] Multi-monitor support works correctly
- [ ] Statistics are accurate
- [ ] Calendar sync updates events

### Platform Testing
Test on both:
- macOS (Intel + Apple Silicon if possible)
- Windows 10/11

## Commit Guidelines

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

Example:
```
feat: add Microsoft Outlook integration
fix: alert timing calculation for time zones
docs: update README with OAuth setup instructions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly on your platform
4. Update documentation if needed
5. Submit PR with clear description
6. Address review feedback

## Questions?

Open an issue for discussion before starting work on major features.

Thank you for contributing! 🎉
