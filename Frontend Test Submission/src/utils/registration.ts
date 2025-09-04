import axios from 'axios';
import { logger, initializeLogger } from './logger';

export interface RegistrationData {
  rollNumber: string;
  email: string;
  githubUsername: string;
  accessCode: string;
}

export interface RegistrationResponse {
  clientId: string;
  clientSecret: string;
}

export interface AuthResponse {
  token: string;
}

const REGISTRATION_URL = 'http://28.244.81.44/evaluation-service/register';
const AUTH_URL = 'http://38.244.81.44/evaluation-service/auth';

/**
 * Register with the evaluation server
 */
export const registerWithServer = async (data: RegistrationData): Promise<RegistrationResponse> => {
  try {
    logger.logInfo('registration', 'Starting registration process with evaluation server');
    
    const response = await axios.post(REGISTRATION_URL, {
      rollNumber: data.rollNumber,
      email: data.email,
      githubUsername: data.githubUsername,
      accessCode: data.accessCode
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Registration failed with status: ${response.status}`);
    }

    const result: RegistrationResponse = response.data;
    
    // Store credentials securely
    localStorage.setItem('evaluationCredentials', JSON.stringify({
      clientId: result.clientId,
      clientSecret: result.clientSecret,
      registeredAt: new Date().toISOString()
    }));

    logger.logInfo('registration', 'Registration completed successfully');
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    logger.logError('registration', `Registration failed: ${errorMessage}`);
    throw new Error(`Registration failed: ${errorMessage}`);
  }
};

/**
 * Authenticate and get access token
 */
export const authenticateWithServer = async (clientId: string, clientSecret: string): Promise<string> => {
  try {
    logger.logInfo('registration', 'Starting authentication process');
    
    const response = await axios.post(AUTH_URL, {
      clientId: clientId,
      clientSecret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Authentication failed with status: ${response.status}`);
    }

    const result: AuthResponse = response.data;
    
    // Store token securely
    localStorage.setItem('evaluationToken', JSON.stringify({
      token: result.token,
      authenticatedAt: new Date().toISOString()
    }));

    // Initialize logger with the token
    initializeLogger(result.token);

    logger.logInfo('registration', 'Authentication completed successfully and logger initialized');
    return result.token;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    logger.logError('registration', `Authentication failed: ${errorMessage}`);
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
};

/**
 * Complete registration and authentication flow
 */
export const completeRegistrationFlow = async (data: RegistrationData): Promise<string> => {
  try {
    // Step 1: Register
    const credentials = await registerWithServer(data);
    
    // Step 2: Authenticate
    const token = await authenticateWithServer(credentials.clientId, credentials.clientSecret);
    
    logger.logInfo('registration', 'Complete registration flow successful');
    return token;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration flow failed';
    logger.logError('registration', `Registration flow failed: ${errorMessage}`);
    throw error;
  }
};

/**
 * Check if user is already registered and authenticated
 */
export const checkExistingCredentials = (): { hasCredentials: boolean; hasToken: boolean } => {
  try {
    const credentials = localStorage.getItem('evaluationCredentials');
    const token = localStorage.getItem('evaluationToken');
    
    return {
      hasCredentials: !!credentials,
      hasToken: !!token
    };
  } catch (error) {
    logger.logError('registration', `Failed to check existing credentials: ${error}`);
    return { hasCredentials: false, hasToken: false };
  }
};

/**
 * Get stored credentials
 */
export const getStoredCredentials = (): { clientId?: string; clientSecret?: string } | null => {
  try {
    const stored = localStorage.getItem('evaluationCredentials');
    if (!stored) return null;
    
    const credentials = JSON.parse(stored);
    return {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret
    };
  } catch (error) {
    logger.logError('registration', `Failed to get stored credentials: ${error}`);
    return null;
  }
};

/**
 * Get stored token
 */
export const getStoredToken = (): string | null => {
  try {
    const stored = localStorage.getItem('evaluationToken');
    if (!stored) return null;
    
    const tokenData = JSON.parse(stored);
    return tokenData.token;
  } catch (error) {
    logger.logError('registration', `Failed to get stored token: ${error}`);
    return null;
  }
};

/**
 * Initialize logger with stored token if available
 */
export const initializeLoggerFromStorage = (): boolean => {
  try {
    const token = getStoredToken();
    if (token) {
      initializeLogger(token);
      logger.logInfo('registration', 'Logger initialized from stored token');
      return true;
    }
    return false;
  } catch (error) {
    logger.logError('registration', `Failed to initialize logger from storage: ${error}`);
    return false;
  }
};
