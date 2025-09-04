import { logger } from './logger';

export interface UrlMapping {
  originalUrl: string;
  shortCode: string;
  customCode?: string;
  createdAt: string;
  expiresAt: string;
  clicks: number;
  clickHistory: ClickRecord[];
}

export interface ClickRecord {
  timestamp: string;
  userAgent?: string;
  referrer?: string;
  ip?: string;
}

const STORAGE_KEY = 'urlMappings';

/**
 * Save URL mapping to localStorage
 */
export const saveUrlMapping = (shortCode: string, data: Omit<UrlMapping, 'clickHistory'>): void => {
  try {
    const mappings = getUrlMappings();
    mappings[shortCode] = {
      ...data,
      clickHistory: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    logger.logInfo('storage', `URL mapping saved for short code: ${shortCode}`);
  } catch (error) {
    logger.logError('storage', `Failed to save URL mapping: ${error}`);
    throw new Error('Failed to save URL mapping');
  }
};

/**
 * Get all URL mappings from localStorage
 */
export const getUrlMappings = (): Record<string, UrlMapping> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const mappings = stored ? JSON.parse(stored) : {};
    logger.logDebug('storage', `Retrieved ${Object.keys(mappings).length} URL mappings`);
    return mappings;
  } catch (error) {
    logger.logError('storage', `Failed to retrieve URL mappings: ${error}`);
    return {};
  }
};

/**
 * Get specific URL mapping by short code
 */
export const getUrlMapping = (shortCode: string): UrlMapping | null => {
  try {
    const mappings = getUrlMappings();
    const mapping = mappings[shortCode] || null;
    logger.logDebug('storage', `Retrieved mapping for ${shortCode}: ${mapping ? 'found' : 'not found'}`);
    return mapping;
  } catch (error) {
    logger.logError('storage', `Failed to retrieve URL mapping for ${shortCode}: ${error}`);
    return null;
  }
};

/**
 * Record a click for a short URL
 */
export const recordClick = (shortCode: string, clickData?: Partial<ClickRecord>): void => {
  try {
    const mappings = getUrlMappings();
    const mapping = mappings[shortCode];
    
    if (!mapping) {
      logger.logWarn('storage', `Attempted to record click for non-existent short code: ${shortCode}`);
      return;
    }

    // Check if URL has expired
    if (new Date() > new Date(mapping.expiresAt)) {
      logger.logWarn('storage', `Attempted to record click for expired URL: ${shortCode}`);
      throw new Error('URL has expired');
    }

    const clickRecord: ClickRecord = {
      timestamp: new Date().toISOString(),
      userAgent: clickData?.userAgent || navigator.userAgent,
      referrer: clickData?.referrer || document.referrer,
      ip: clickData?.ip || 'unknown'
    };

    mapping.clicks += 1;
    mapping.clickHistory.push(clickRecord);
    
    mappings[shortCode] = mapping;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    
    logger.logInfo('storage', `Click recorded for ${shortCode}. Total clicks: ${mapping.clicks}`);
  } catch (error) {
    logger.logError('storage', `Failed to record click for ${shortCode}: ${error}`);
    throw error;
  }
};

/**
 * Delete expired URLs from storage
 */
export const cleanupExpiredUrls = (): number => {
  try {
    const mappings = getUrlMappings();
    const now = new Date();
    let deletedCount = 0;

    Object.keys(mappings).forEach(shortCode => {
      const mapping = mappings[shortCode];
      if (new Date(mapping.expiresAt) < now) {
        delete mappings[shortCode];
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
      logger.logInfo('storage', `Cleaned up ${deletedCount} expired URLs`);
    }

    return deletedCount;
  } catch (error) {
    logger.logError('storage', `Failed to cleanup expired URLs: ${error}`);
    return 0;
  }
};

/**
 * Get analytics data for all URLs
 */
export const getAnalyticsData = () => {
  try {
    const mappings = getUrlMappings();
    const analytics = {
      totalUrls: Object.keys(mappings).length,
      totalClicks: 0,
      activeUrls: 0,
      expiredUrls: 0,
      urlDetails: [] as Array<{
        shortCode: string;
        originalUrl: string;
        clicks: number;
        createdAt: string;
        expiresAt: string;
        isExpired: boolean;
        clickHistory: ClickRecord[];
      }>
    };

    const now = new Date();

    Object.entries(mappings).forEach(([shortCode, mapping]) => {
      const isExpired = new Date(mapping.expiresAt) < now;
      
      analytics.totalClicks += mapping.clicks;
      if (isExpired) {
        analytics.expiredUrls++;
      } else {
        analytics.activeUrls++;
      }

      analytics.urlDetails.push({
        shortCode,
        originalUrl: mapping.originalUrl,
        clicks: mapping.clicks,
        createdAt: mapping.createdAt,
        expiresAt: mapping.expiresAt,
        isExpired,
        clickHistory: mapping.clickHistory
      });
    });

    // Sort by creation date (newest first)
    analytics.urlDetails.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    logger.logInfo('storage', `Generated analytics for ${analytics.totalUrls} URLs`);
    return analytics;
  } catch (error) {
    logger.logError('storage', `Failed to generate analytics data: ${error}`);
    throw new Error('Failed to generate analytics data');
  }
};
