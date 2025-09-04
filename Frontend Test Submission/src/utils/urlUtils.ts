import { logger } from './logger';

/**
 * Generate a random short code for URLs
 */
export const generateShortCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  logger.logDebug('urlutils', `Generated short code: ${result}`);
  return result;
};

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    const isValid = url.protocol === 'http:' || url.protocol === 'https:';
    logger.logDebug('urlutils', `URL validation for ${string}: ${isValid}`);
    return isValid;
  } catch {
    logger.logDebug('urlutils', `URL validation failed for: ${string}`);
    return false;
  }
};

/**
 * Format URL to ensure it has proper protocol
 */
export const formatUrl = (url: string): string => {
  let formatted = url.trim();
  
  // Add https:// if no protocol is specified
  if (!formatted.match(/^https?:\/\//)) {
    formatted = `https://${formatted}`;
  }
  
  logger.logDebug('urlutils', `Formatted URL from ${url} to ${formatted}`);
  return formatted;
};

/**
 * Check if a URL has expired
 */
export const isUrlExpired = (expiresAt: string): boolean => {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const expired = now > expiry;
  
  logger.logDebug('urlutils', `URL expiry check: expires at ${expiresAt}, expired: ${expired}`);
  return expired;
};

/**
 * Get time remaining until URL expires
 */
export const getTimeRemaining = (expiresAt: string): string => {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
};

/**
 * Sanitize custom short code
 */
export const sanitizeShortCode = (code: string): string => {
  const sanitized = code.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  logger.logDebug('urlutils', `Sanitized short code from ${code} to ${sanitized}`);
  return sanitized;
};

/**
 * Generate unique short code by checking existing ones
 */
export const generateUniqueShortCode = (existingCodes: string[], length: number = 6): string => {
  let shortCode: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    shortCode = generateShortCode(length);
    attempts++;
    
    if (attempts >= maxAttempts) {
      // If we can't find a unique code, increase length
      length++;
      attempts = 0;
      logger.logWarn('urlutils', `Increased short code length to ${length} after ${maxAttempts} attempts`);
    }
  } while (existingCodes.includes(shortCode) && attempts < maxAttempts);

  logger.logInfo('urlutils', `Generated unique short code: ${shortCode} after ${attempts} attempts`);
  return shortCode;
};
