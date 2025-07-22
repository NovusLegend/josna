# Josna LGZ SocialSpace

## Overview

This is a modern social media web application built with vanilla JavaScript and Firebase. The app provides a real-time social platform where users can authenticate via Google, create posts, and engage in private messaging. The application features a sleek dark theme with green accent colors and uses Firebase for backend services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology**: Vanilla JavaScript with ES6 modules
- **Styling**: Pure CSS with custom styling and Font Awesome icons
- **Structure**: Single-page application (SPA) with screen-based navigation
- **Module System**: ES6 imports for Firebase SDK and local modules

### Backend Architecture
- **Backend-as-a-Service**: Firebase
- **Authentication**: Firebase Auth with Google OAuth provider
- **Database**: Firestore (NoSQL document database)
- **Real-time Updates**: Firestore listeners for live data synchronization

## Key Components

### Authentication System
- **Multi-Authentication Support**: Users can sign in with email/password or Google OAuth
- **Enhanced Registration Process**: Comprehensive account creation with display name, email validation, password confirmation, and stream selection
- **Real-time Form Validation**: Live feedback on display name length, password strength, and password matching
- **Input Validation**: Character limits, password requirements, and terms acceptance
- **Google OAuth Integration**: Alternative sign-in option for users with Google accounts
- **Session Management**: Firebase handles user sessions and authentication state
- **User State Tracking**: Real-time authentication state monitoring with `onAuthStateChanged`
- **User Document Creation**: Automatic Firestore user profile creation with following/followers arrays
- **Enhanced User Experience**: Clear form organization, help text, and visual feedback during account creation

### User Interface Components
1. **Loading Screen**: Initial app loading with animated spinner
2. **Login Screen**: Tabbed interface with email/password and Google OAuth options
3. **Main Application**: Post creation, feed, following, and messaging interface
4. **Profile System**: Comprehensive user profile modal with followers, posts, and activity tracking
5. **Following System**: Modal interface for discovering and managing followed users
6. **Messaging System**: Modal-based chat interface with user selection

### Post Management
- **Post Creation**: Text-based posts with character counting
- **Real-time Feed**: Live updates using Firestore listeners
- **Post Interactions**: Like functionality with real-time counter updates

### Stream System
- **Stream-Based Organization**: Users are organized into 5 streams: Central, North, East, West, South
- **Stream Selection**: Required during account registration with emoji icons for visual identification
- **Stream Discovery**: Browse users within specific streams through dedicated modal interface
- **Stream Identity**: User's stream displayed as badge in profile header with corresponding emoji
- **Cross-Stream Interaction**: Users can follow and message users from any stream

### Profile System
- **Comprehensive Profile View**: Modal interface displaying user avatar, name, email, stream, and statistics
- **Follower Management**: View complete list of users following you with follow-back options
- **Personal Post Archive**: Browse all your posts with engagement metrics and timestamps
- **Activity Dashboard**: Track total posts, likes received, engagement rate, and member since date
- **Interactive Followers**: Direct messaging and follow/unfollow actions from follower list
- **Real-time Statistics**: Live updates of follower count, following count, and post metrics

### Following System
- **User Discovery**: Browse all registered users in the platform
- **Follow/Unfollow**: Toggle following status with real-time updates
- **Following Management**: View and manage list of followed users
- **Follower Tracking**: Track followers count for each user
- **Integration with Posts**: Following users can be messaged directly from user discovery

### Messaging System
- **Private Messaging**: One-on-one chat functionality
- **Real-time Chat**: Live message updates using Firestore listeners
- **Unread Notifications**: Badge system for new message alerts

## Data Flow

### Authentication Flow
1. User clicks Google sign-in button
2. Firebase Auth handles OAuth flow
3. User state is monitored and UI updates accordingly
4. User profile information is extracted and displayed

### Post Creation Flow
1. User types content in composer
2. Character count is tracked and displayed
3. Post is submitted to Firestore with timestamp and user info
4. Real-time listeners update all connected clients

### Messaging Flow
1. User opens messages modal to see available contacts
2. User selects a contact to start/continue conversation
3. Messages are sent to Firestore with sender/recipient info
4. Real-time listeners update chat interface for both users

## External Dependencies

### Firebase Services
- **Firebase App**: Core Firebase initialization
- **Firebase Auth**: User authentication and session management
- **Firestore**: Real-time NoSQL database for posts and messages

### Third-party Libraries
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Firebase SDK 10.7.1**: Complete Firebase functionality via CDN

### Browser APIs
- **ES6 Modules**: Native module system for code organization
- **DOM API**: Direct DOM manipulation for UI updates

## Deployment Strategy

### Current Setup
- **Static Hosting**: Designed for static file hosting (Firebase Hosting, Netlify, etc.)
- **CDN Dependencies**: External libraries loaded via CDN for faster delivery
- **Environment Configuration**: Firebase config requires manual setup with project credentials

### Configuration Requirements
1. Firebase project setup with Authentication and Firestore enabled
2. Google OAuth configuration in Firebase console
3. Firebase configuration object update in `firebase-config.js`
4. Firestore security rules configuration for data access control

### Scalability Considerations
- **Real-time Listeners**: Firestore listeners provide automatic scaling for concurrent users
- **Serverless Architecture**: Firebase backend scales automatically with usage
- **Static Frontend**: Can be deployed to any CDN for global distribution

The application follows a modern web development approach with real-time capabilities, leveraging Firebase's managed services to reduce backend complexity while providing a rich user experience.