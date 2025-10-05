import { describe, it, expect, beforeAll } from 'vitest';
import { getConfig } from './env.js';
import { UpApiClient } from './client.js';

/**
 * Integration tests for Up API connectivity
 * These tests require UP_PERSONAL_ACCESS_TOKEN environment variable to be set
 */
describe('Up API Integration', () => {
  let client: UpApiClient;
  let hasToken: boolean;

  beforeAll(() => {
    try {
      const config = getConfig();
      client = new UpApiClient(config.personalAccessToken);
      hasToken = true;
    } catch {
      hasToken = false;
    }
  });

  it.skipIf(!hasToken)('should successfully ping the Up API', async () => {
    const result = await client.ping();
    expect(result).toBe(true);
  });

  it.skipIf(!hasToken)('should retrieve accounts list', async () => {
    const response = await client.getAccounts();
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it.skipIf(!hasToken)('should retrieve transactions', async () => {
    const response = await client.getTransactions({ pageSize: 5 });
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should skip integration tests when token is not provided', () => {
    if (!hasToken) {
      console.log('⚠️  Skipping integration tests: UP_PERSONAL_ACCESS_TOKEN not set');
      expect(hasToken).toBe(false);
    }
  });
});
