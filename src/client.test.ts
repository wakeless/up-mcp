import { describe, it, expect, beforeEach } from 'vitest';
import { UpApiClient } from './client.js';

describe('UpApiClient', () => {
  let client: UpApiClient;
  const testToken = 'test-token-123';

  beforeEach(() => {
    client = new UpApiClient(testToken);
  });

  describe('constructor', () => {
    it('should create client with provided token', () => {
      expect(client).toBeDefined();
    });

    it('should throw error if token is empty', () => {
      expect(() => new UpApiClient('')).toThrow();
    });
  });

  describe('request headers', () => {
    it('should include Authorization header with Bearer token', () => {
      const headers = client.getHeaders();
      expect(headers.Authorization).toBe(`Bearer ${testToken}`);
    });

    it('should include correct Content-Type header', () => {
      const headers = client.getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should include Accept header', () => {
      const headers = client.getHeaders();
      expect(headers.Accept).toBe('application/json');
    });
  });

  describe('base URL', () => {
    it('should use correct Up API base URL', () => {
      expect(client.getBaseUrl()).toBe('https://api.up.com.au/api/v1');
    });
  });
});
