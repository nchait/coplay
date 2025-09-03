# Coplay - Dating App with Cooperative Games

A mobile-first dating application that connects users through simple, cooperative 2-player games.

## Project Overview

Coplay differentiates itself by offering users the ability to connect through casual cooperative games, prioritizing minimalism, ease of use, and a professional design aesthetic.

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (to be added)
- **State Management**: React Context + Hooks
- **Backend**: Node.js/Express (to be implemented)
- **Database**: PostgreSQL + Redis
- **Real-time**: WebSocket/Socket.io

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── Auth/           # Authentication screens
│   ├── Profile/        # Profile management
│   ├── Matching/       # Matchmaking screens
│   ├── Games/          # Game lobby and results
│   └── Chat/           # Chat functionality
├── games/              # Game implementations
│   ├── PuzzleConnect/  # Cooperative puzzle game
│   ├── GuessAndDraw/   # Drawing and guessing game
│   └── SurvivalChallenge/ # Reflex/timing game
├── navigation/         # Navigation configuration
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## MVP Games

### 1. Puzzle Connect
- **Type**: Cooperative puzzle-solving
- **Duration**: 2–3 minutes per round
- **Gameplay**: Players see different puzzle states and must share clues to solve a shared grid
- **Co-op Mechanic**: Neither player can solve alone; asymmetric information drives communication

### 2. Guess & Draw
- **Type**: Turn-based drawing & guessing
- **Duration**: 1–2 minutes per round
- **Gameplay**: One player draws from a prompt, the other guesses
- **Co-op Mechanic**: Both must succeed together (drawer communicates, guesser interprets)

### 3. Survival Challenge
- **Type**: Reflex/timing game
- **Duration**: 1–3 minutes per round
- **Gameplay**: Both players control avatars dodging obstacles. If one fails, both lose
- **Co-op Mechanic**: Both must survive together; requires timing and communication

## Development Phases

1. **Phase 1**: Discovery & Design (3-4 weeks)
2. **Phase 2**: Core App Development (10-12 weeks)
3. **Phase 3**: Backend & Infrastructure (6 weeks)
4. **Phase 4**: QA & Testing (3 weeks)
5. **Phase 5**: Deployment & Handover (1-2 weeks)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

## Design Principles

- **Minimalistic UI/UX** with frictionless navigation
- **Clean aesthetic** inspired by Tinder, Calm, and Duolingo
- **Mobile-first** responsive design
- **Short game duration** (1-3 minutes) for replayability
- **Consistent game framework** for future scalability

## Contributing

This project follows a structured development approach with task management and regular progress tracking.
