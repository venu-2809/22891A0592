import { generateShortCode, isValidUrl, getTimeRemaining } from './urlUtils';

describe('URL Utils', () => {
  test('generateShortCode creates 6 character string', () => {
    const shortCode = generateShortCode();
    expect(shortCode).toHaveLength(6);
    expect(typeof shortCode).toBe('string');
  });

  test('generateShortCode creates unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateShortCode());
    }
    // Should have close to 100 unique codes (allowing for rare collisions)
    expect(codes.size).toBeGreaterThan(95);
  });

  test('isValidUrl validates URLs correctly', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://test.org')).toBe(true);
    expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true);
    
    expect(isValidUrl('invalid-url')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  test('getTimeRemaining calculates correctly', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours
    const result = getTimeRemaining(futureDate);
    expect(result).toContain('1 hour'); // Should be close to 2 hours
    
    const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    const expiredResult = getTimeRemaining(pastDate);
    expect(expiredResult).toBe('Expired');
  });
});
