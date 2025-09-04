import { logger } from './logger';

/**
 * Custom URL shortening algorithm with unique implementation
 * Uses a combination of timestamp, random characters, and custom encoding
 */
export const generateCustomShortCode = (length: number = 6): string => {
  // Custom character set excluding similar looking characters
  const customChars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  
  // Use timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  const timestampPart = timestamp.slice(-2);
  
  // Generate random part
  let randomPart = '';
  for (let i = 0; i < length - 2; i++) {
    randomPart += customChars.charAt(Math.floor(Math.random() * customChars.length));
  }
  
  const shortCode = timestampPart + randomPart;
  logger.logDebug('uniquefeatures', `Generated custom short code: ${shortCode}`);
  return shortCode;
};

/**
 * Enhanced URL validation with custom rules
 */
export const validateUrlWithCustomRules = (url: string): { isValid: boolean; reason?: string } => {
  try {
    const urlObj = new URL(url);
    
    // Custom validation rules
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, reason: 'Only HTTP and HTTPS protocols are supported' };
    }
    
    // Block localhost and internal IPs for security
    if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('192.168.') || urlObj.hostname.startsWith('10.')) {
      return { isValid: false, reason: 'Internal URLs are not allowed' };
    }
    
    // Minimum domain length check
    if (urlObj.hostname.length < 4) {
      return { isValid: false, reason: 'Domain name too short' };
    }
    
    logger.logDebug('uniquefeatures', `URL validation passed for: ${url}`);
    return { isValid: true };
    
  } catch (error) {
    logger.logDebug('uniquefeatures', `URL validation failed for: ${url}`);
    return { isValid: false, reason: 'Invalid URL format' };
  }
};

/**
 * Custom expiration calculation with business logic
 */
export const calculateSmartExpiration = (minutes: number, urlLength: number): Date => {
  const baseTime = new Date();
  
  // Longer URLs get slightly longer expiration as they're likely more complex
  const lengthBonus = Math.min(urlLength / 100, 5); // Max 5 minute bonus
  const totalMinutes = minutes + lengthBonus;
  
  const expirationTime = new Date(baseTime.getTime() + totalMinutes * 60 * 1000);
  
  logger.logInfo('uniquefeatures', `Smart expiration calculated: ${totalMinutes} minutes (base: ${minutes}, bonus: ${lengthBonus})`);
  return expirationTime;
};

/**
 * Advanced analytics calculation
 */
export const calculateAdvancedMetrics = (clickHistory: any[]) => {
  const now = new Date();
  const last24Hours = clickHistory.filter(click => 
    new Date(click.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  
  const last7Days = clickHistory.filter(click => 
    new Date(click.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  
  // Calculate peak hour
  const hourCounts = new Array(24).fill(0);
  clickHistory.forEach(click => {
    const hour = new Date(click.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  
  const metrics = {
    clicksLast24Hours: last24Hours.length,
    clicksLast7Days: last7Days.length,
    peakHour: peakHour,
    averageClicksPerDay: clickHistory.length > 0 ? (clickHistory.length / Math.max(1, Math.ceil((now.getTime() - new Date(clickHistory[0].timestamp).getTime()) / (24 * 60 * 60 * 1000)))) : 0
  };
  
  logger.logInfo('uniquefeatures', `Advanced metrics calculated: ${JSON.stringify(metrics)}`);
  return metrics;
};
