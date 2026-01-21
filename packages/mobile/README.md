# Flash Snap Mobile

A React Native mobile application built with Expo and styled-components, companion to the Flash Snap desktop application.

## Features

- ✨ Built with Expo for cross-platform development
- 🎨 Styled with styled-components for consistent theming
- 📱 TypeScript for type safety
- 🔐 Supabase authentication (sign up, sign in, sign out)
- 🔄 Interactive components and state management
- 📊 Context-based state management for authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_SUPABASE_PROJECT_ID=your_project_id
   ```

### Running the App

1. Start the development server:
   ```bash
   npm start
   ```

2. Use the Expo Go app on your phone to scan the QR code, or run on simulators:
   - iOS Simulator: `npm run ios`
   - Android Emulator: `npm run android`
   - Web: `npm run web`

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Styled button component
│   │   ├── Card.tsx         # Styled card component
│   │   ├── Input.tsx        # Styled input component
│   │   └── index.ts         # Component exports
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── screens/             # Application screens
│   │   ├── AuthScreen.tsx   # Login/signup screen
│   │   ├── HomeScreen.tsx   # Main app screen
│   │   └── index.ts         # Screen exports
│   └── services/            # API and business logic
│       ├── authService.ts   # Authentication service
│       └── supabaseService.ts # Supabase client setup
├── App.tsx                  # Main application component
├── app.json                 # Expo configuration
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **styled-components**: CSS-in-JS styling solution
- **Supabase**: Backend-as-a-Service for authentication and database
- **React Context**: State management for authentication

## Development

The app demonstrates:
- Styled-components usage in React Native
- Interactive state management
- Component composition
- TypeScript integration
- Expo development workflow

## Future Plans

This mobile app will eventually sync with the Flash Snap desktop application to provide:
- Cross-platform flashcard synchronization
- Mobile-optimized study sessions
- Offline support
- Push notifications for study reminders

## Contributing

This is part of the Flash Snap project. Please refer to the main project documentation for contribution guidelines.