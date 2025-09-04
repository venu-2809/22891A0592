import { 
  getAnalyticsData, 
  cleanupExpiredUrls 
} from './storage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('getAnalyticsData calculates metrics correctly', () => {
    const testUrls = [
      {
        shortCode: 'active1',
        originalUrl: 'https://active.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        clicks: 10,
        clickHistory: []
      },
      {
        shortCode: 'expired1',
        originalUrl: 'https://expired.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        clicks: 5,
        clickHistory: []
      }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testUrls));
    
    const analytics = getAnalyticsData();
    
    expect(analytics.totalUrls).toBe(2);
    expect(analytics.totalClicks).toBe(15);
    expect(analytics.activeUrls).toBe(1);
    expect(analytics.expiredUrls).toBe(1);
  });
});
