# Components Directory

This directory contains the actively used components for the Poke-n-Pork game.

## Core Game Components:
- **PigGame.tsx** - Main game component with full game logic, pig mechanics, and UI
- **SimpleGamePauser.tsx** - Game pause/resume wrapper that handles navigation
- **ShowHeader.tsx** - Animated game header with minimize/maximize functionality

## Page Components:
- **EventsPage.tsx** - Events page showing real-world funding events
- **LeaderboardPage.tsx** - Leaderboard with high scores and cause rankings
- **ProfilePage.tsx** - User profile management
- **CommentsPage.tsx** - Comments system for high scores

## Integrated Panels:
- **EventsPanel.tsx** - Events panel integrated into the game interface
- **DefundingBug.tsx** - Animated defunding cockroach with scurrying behavior
- **CockroachIcon.tsx** - Animated cockroach SVG component

## Universal Systems:
- **UniversalVictorySystem.tsx** - Victory screen with level-based messaging
- **UniversalFailureSystem.tsx** - Failure screen with level-based messaging
- **UniversalDefundingSystem.tsx** - Defunding mechanics and countdown timer
- **UniversalLawsuitSystem.tsx** - Lawsuit mechanics and penalties

## Support Components:
- **GameAudio.tsx** - Audio system for game sounds and jingles
- **PersonalBestTracker.tsx** - Personal best score tracking
- **RockingPorkHead.tsx** - Animated pork head component
- **HighScoreCard.tsx** - High score display component
- **CauseScoreCard.tsx** - Cause-specific score component
- **LeaderboardTabs.tsx** - Tabbed leaderboard interface

## Constants and Data:
- **causes-constants.ts** - Humanitarian causes configuration
- **leaderboard-types.ts** - TypeScript types for leaderboard system
- **sample-comments-data.ts** - Sample comments for testing
- **leaderboard-helpers.ts** - Utility functions for leaderboard
- **failure-constants.ts** - Failure message configuration

## Audio System:
- **audio/** - Audio management utilities and constants

## UI Components:
- **ui/** - Reusable UI components from shadcn/ui library