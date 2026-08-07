import { apiRequest, api } from '@/utils/api';

// This is a placeholder test file that simply verifies the API module can be imported
// The actual API functionality is tested indirectly through other tests

describe('API Utility', () => {
  test('API module imports correctly', () => {
    expect(apiRequest).toBeDefined();
    expect(api).toBeDefined();
    expect(typeof apiRequest).toBe('function');
    expect(typeof api).toBe('object');
  });
});
