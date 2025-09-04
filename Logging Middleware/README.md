# Custom Logging Middleware

A reusable TypeScript logging middleware package that integrates with the evaluation server.

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import { Log, initializeLogger } from './src/index.js';

// Initialize with auth token
initializeLogger('your-auth-token');

// Use the main Log function
await Log('frontend', 'info', 'component', 'User action completed successfully');

// Or use convenience methods
import { logger } from './src/index.js';
await logger.logError('frontend', 'api', 'Failed to fetch data from server');
```

## API

### Main Function
- `Log(stack, level, package, message)` - Core logging function

### Parameters
- `stack`: 'frontend' | 'backend'
- `level`: 'error' | 'warn' | 'info' | 'debug'  
- `package`: string (component/module name)
- `message`: string (descriptive log message)

### Features
- Type-safe TypeScript implementation
- Automatic server API integration
- Error handling with fallback storage
- Singleton pattern for consistent usage
- Convenience methods for different log levels
