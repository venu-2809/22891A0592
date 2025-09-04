import axios from 'axios';

// Type definitions for logging parameters
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type LogStack = 'frontend' | 'backend';

export interface LogConfig {
  baseUrl: string;
  authToken?: string;
}

export interface LogEntry {
  stack: LogStack;
  level: LogLevel;
  package: string;
  message: string;
  timestamp?: string;
}

class CustomLogger {
  private config: LogConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      baseUrl: 'http://38.244.81.44/evaluation-service'
    };
  }

  /**
   * Initialize logger with authentication token
   */
  public initialize(authToken: string): void {
    this.config.authToken = authToken;
    this.isInitialized = true;
  }

  /**
   * Main logging function - matches required structure: Log(stack, level, package, message)
   */
  public async Log(stack: LogStack, level: LogLevel, packageName: string, message: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Logger not initialized. Call initialize() with auth token first.');
    }

    const logEntry: LogEntry = {
      stack: stack.toLowerCase() as LogStack,
      level: level.toLowerCase() as LogLevel,
      package: packageName.toLowerCase(),
      message: message,
      timestamp: new Date().toISOString()
    };

    try {
      await this.sendLogToServer(logEntry);
    } catch (error) {
      // Fallback: store failed logs locally for retry
      this.storeFailedLog(logEntry, error);
    }
  }

  /**
   * Send log entry to the evaluation server
   */
  private async sendLogToServer(logEntry: LogEntry): Promise<void> {
    const payload = {
      stack: logEntry.stack,
      level: logEntry.level,
      package: logEntry.package,
      message: logEntry.message
    };

    const response = await axios.post(
      `${this.config.baseUrl}/log`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        timeout: 5000
      }
    );

    if (response.status !== 200) {
      throw new Error(`Log API returned status: ${response.status}`);
    }
  }

  /**
   * Store failed logs for potential retry mechanism
   */
  private storeFailedLog(logEntry: LogEntry, error: any): void {
    // In a real application, this could write to local storage or a queue
    // For now, we'll just track the failure
    const failureRecord = {
      logEntry,
      error: error.message,
      failedAt: new Date().toISOString()
    };
    
    // Could implement retry logic here
  }

  /**
   * Convenience methods for different log levels
   */
  public async logError(stack: LogStack, packageName: string, message: string): Promise<void> {
    await this.Log(stack, 'error', packageName, message);
  }

  public async logWarn(stack: LogStack, packageName: string, message: string): Promise<void> {
    await this.Log(stack, 'warn', packageName, message);
  }

  public async logInfo(stack: LogStack, packageName: string, message: string): Promise<void> {
    await this.Log(stack, 'info', packageName, message);
  }

  public async logDebug(stack: LogStack, packageName: string, message: string): Promise<void> {
    await this.Log(stack, 'debug', packageName, message);
  }
}

// Export singleton instance
export const logger = new CustomLogger();

// Export the main Log function for direct use
export const Log = logger.Log.bind(logger);

// Export initialization function
export const initializeLogger = logger.initialize.bind(logger);

export default logger;
