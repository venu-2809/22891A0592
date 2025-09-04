# URL Shortener Application

A modern, responsive React TypeScript application for URL shortening with analytics capabilities.

## Features

- **URL Shortening**: Create short, memorable links from long URLs
- **Custom Short Codes**: Option to use custom short codes (3-20 characters)
- **Expiration Management**: Set custom validity periods (default: 30 minutes)
- **Analytics Dashboard**: Comprehensive analytics with click tracking
- **Responsive Design**: Mobile and desktop optimized using Material UI
- **Client-side Routing**: Handle redirections without server dependency
- **Logging Integration**: Custom logging middleware for comprehensive tracking

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Material UI (MUI)
- **Routing**: React Router DOM
- **Storage**: Browser localStorage for client-side data persistence
- **HTTP Client**: Axios for API communications
- **Logging**: Custom middleware integration

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation header
│   └── RedirectHandler.tsx # Handles short URL redirections
├── pages/
│   ├── HomePage.tsx        # Main URL shortening interface
│   └── AnalyticsPage.tsx   # Analytics dashboard
├── utils/
│   ├── logger.ts           # Custom logging middleware
│   ├── storage.ts          # LocalStorage management
│   └── urlUtils.ts         # URL validation and utilities
└── App.tsx                 # Main application component
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder with optimized bundles.

## Usage

### Creating Short URLs

1. Navigate to the home page
2. Enter a valid URL in the input field
3. Optionally configure advanced settings:
   - Enable custom short code
   - Set expiration time (1 minute to 1 week)
4. Click "Shorten URL" to generate the short link
5. Copy the generated short URL to clipboard

### Analytics

1. Navigate to the Analytics page
2. View comprehensive metrics:
   - Total URLs created
   - Total clicks across all URLs
   - Active vs expired URLs
   - Detailed URL performance table
3. Export analytics data as JSON

### URL Redirection

- Access any short URL: `http://localhost:3000/{shortCode}`
- Automatic redirection to original URL
- Click tracking and analytics recording
- Expired URL handling with user-friendly messages

## Key Features Implementation

### Custom Logging Middleware

The application integrates a custom logging middleware that:
- Sends logs to evaluation server API
- Handles authentication token management
- Provides fallback local storage for offline scenarios
- Supports different log levels (error, warn, info, debug)

### Client-side URL Management

- No backend dependency for basic functionality
- localStorage-based persistence
- Automatic cleanup of expired URLs
- Unique short code generation with collision detection

### Responsive Design

- Mobile-first approach using Material UI
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
- Consistent design system

## Configuration

### Logging Configuration

The logging middleware can be configured in `src/utils/logger.ts`:
- Server endpoint: `http://38.244.81.44/evaluation-service`
- Authentication token initialization required
- Automatic retry mechanism for failed logs

### URL Validation

URL validation rules in `src/utils/urlUtils.ts`:
- Supports HTTP and HTTPS protocols
- Automatic protocol addition for URLs without scheme
- Custom short code validation (alphanumeric, hyphens, underscores)

## Development Guidelines

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Comprehensive error handling
- Extensive logging for debugging

### Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

## Deployment

The application is ready for deployment to static hosting services:
- Build artifacts in `/build` folder
- No server-side dependencies
- Environment-agnostic configuration

## Browser Compatibility

- Modern browsers supporting ES2020
- localStorage API required
- Clipboard API for copy functionality
- Service Worker compatible
