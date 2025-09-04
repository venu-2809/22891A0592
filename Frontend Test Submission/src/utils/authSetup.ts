import axios from 'axios';
import { initializeLogger } from './logger';

// Your obtained credentials
const CLIENT_ID = 'c1e17fd4-4480-4a5b-b374-4da0314beb5f';
const CLIENT_SECRET = 'RaRsgcGnxHBAxCBk';
const AUTH_URL = 'http://38.244.81.44/evaluation-service/auth';

/**
 * Authenticate with the evaluation server using your credentials
 */
export const authenticateAndInitialize = async (): Promise<string> => {
  try {
    console.log('Starting authentication with evaluation server...');
    
    const response = await axios.post(AUTH_URL, {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Authentication failed with status: ${response.status}`);
    }

    const { token } = response.data;
    
    // Store token securely
    localStorage.setItem('evaluationToken', JSON.stringify({
      token: token,
      authenticatedAt: new Date().toISOString(),
      clientId: CLIENT_ID
    }));

    // Initialize logger with the token
    initializeLogger(token);
    
    console.log('Authentication successful and logger initialized');
    return token;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    console.error('Authentication failed:', errorMessage);
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
};

/**
 * Check if already authenticated and initialize if needed
 */
export const checkAndInitializeAuth = async (): Promise<boolean> => {
  try {
    // Check if we have a stored token
    const stored = localStorage.getItem('evaluationToken');
    if (stored) {
      const tokenData = JSON.parse(stored);
      initializeLogger(tokenData.token);
      console.log('Logger initialized from stored token');
      return true;
    }
    
    // If no stored token, authenticate
    await authenticateAndInitialize();
    return true;
    
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    return false;
  }
};
