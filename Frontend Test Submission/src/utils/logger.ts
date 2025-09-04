import axios from 'axios';

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

class FrontendLogger {
  private config: LogConfig;
  private isInitialized: boolean = false;
  private pendingLogs: LogEntry[] = [];

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
    
    // Flush any pending logs
    this.flushPendingLogs();
  }

  /**
   * Main logging function - matches required structure: Log(stack, level, package, message)
   */
  public async Log(stack: LogStack, level: LogLevel, packageName: string, message: string): Promise<void> {
    const logEntry: LogEntry = {
      stack: stack.toLowerCase() as LogStack,
      level: level.toLowerCase() as LogLevel,
      package: packageName.toLowerCase(),
      message: message,
      timestamp: new Date().toISOString()
    };

    if (!this.isInitialized || !this.config.authToken) {
      // Store logs locally until authentication is complete
      this.pendingLogs.push(logEntry);
      this.storeLocalLog(logEntry);
      return;
    }

    try {
      await this.sendLogToServer(logEntry);
    } catch (error) {
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
   * Store logs locally when server is unavailable
   */
  private storeLocalLog(logEntry: LogEntry): void {
    try {
      const localLogs = JSON.parse(localStorage.getItem('pendingLogs') || '[]');
      localLogs.push(logEntry);
      localStorage.setItem('pendingLogs', JSON.stringify(localLogs));
    } catch (error) {
      // Fallback to memory storage if localStorage fails
      console.warn('Failed to store log locally:', error);
    }
  }

  /**
   * Store failed logs for retry mechanism
   */
  private storeFailedLog(logEntry: LogEntry, error: any): void {
    try {
      const failedLogs = JSON.parse(localStorage.getItem('failedLogs') || '[]');
      failedLogs.push({
        logEntry,
        error: error.message,
        failedAt: new Date().toISOString()
      });
      localStorage.setItem('failedLogs', JSON.stringify(failedLogs));
    } catch (storageError) {
      console.warn('Failed to store failed log:', storageError);
    }
  }

  /**
   * Flush pending logs when authentication becomes available
   */
  private async flushPendingLogs(): Promise<void> {
    if (!this.isInitialized || !this.config.authToken) return;

    // Send in-memory pending logs
    const memoryLogs = [...this.pendingLogs];
    this.pendingLogs = [];

    for (const log of memoryLogs) {
      try {
        await this.sendLogToServer(log);
      } catch (error) {
        this.storeFailedLog(log, error);
      }
    }

    // Send localStorage pending logs
    try {
      const localLogs = JSON.parse(localStorage.getItem('pendingLogs') || '[]');
      
      for (const log of localLogs) {
        try {
          await this.sendLogToServer(log);
        } catch (error) {
          this.storeFailedLog(log, error);
        }
      }
      
      localStorage.removeItem('pendingLogs');
    } catch (error) {
      console.warn('Failed to flush local logs:', error);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  public async logError(packageName: string, message: string): Promise<void> {
    await this.Log('frontend', 'error', packageName, message);
  }

  public async logWarn(packageName: string, message: string): Promise<void> {
    await this.Log('frontend', 'warn', packageName, message);
  }

  public async logInfo(packageName: string, message: string): Promise<void> {
    await this.Log('frontend', 'info', packageName, message);
  }

  public async logDebug(packageName: string, message: string): Promise<void> {
    await this.Log('frontend', 'debug', packageName, message);
  }

  /**
   * Get logging statistics
   */
  public getStats() {
    return {
      isInitialized: this.isInitialized,
      pendingLogsCount: this.pendingLogs.length,
      hasAuthToken: !!this.config.authToken
    };
  }
}

// Export singleton instance
export const logger = new FrontendLogger();

// Export the main Log function for direct use
export const Log = logger.Log.bind(logger);

// Export initialization function
export const initializeLogger = logger.initialize.bind(logger);

export default logger;
