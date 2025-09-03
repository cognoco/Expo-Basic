# Study Buddy

Educational app to help students stay focused during study sessions.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI

### Installation

```bash
npm install
```

### Configuration

Set up API keys in `app.json` extras section:
- RevenueCat API keys (`extra.revenuecat.iosApiKey`, `extra.revenuecat.androidApiKey`)
- Sentry DSN (`extra.sentry.dsn`) 
- PostHog analytics (`extra.posthog.apiKey`, `extra.posthog.host`)

### Running the App

```bash
# Start development server
npm start

# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

### Testing

```bash
# Run tests
npm test

# Check configuration
npm run check:config
```

## Project Structure

- `src/screens/` - App screens
- `src/components/` - Reusable UI components
- `src/utils/` - Utility functions and services
- `src/assets/` - Animation and media assets
- `src/types/` - TypeScript type definitions