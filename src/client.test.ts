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

  describe('API methods', () => {
    describe('getTransaction', () => {
      it('should have getTransaction method', () => {
        expect(typeof client.getTransaction).toBe('function');
      });
    });

    describe('getAccountTransactions', () => {
      it('should have getAccountTransactions method', () => {
        expect(typeof client.getAccountTransactions).toBe('function');
      });
    });

    describe('getCategories', () => {
      it('should have getCategories method', () => {
        expect(typeof client.getCategories).toBe('function');
      });
    });

    describe('getCategory', () => {
      it('should have getCategory method', () => {
        expect(typeof client.getCategory).toBe('function');
      });
    });

    describe('updateTransactionCategory', () => {
      it('should have updateTransactionCategory method', () => {
        expect(typeof client.updateTransactionCategory).toBe('function');
      });
    });

    describe('getTags', () => {
      it('should have getTags method', () => {
        expect(typeof client.getTags).toBe('function');
      });
    });

    describe('addTransactionTags', () => {
      it('should have addTransactionTags method', () => {
        expect(typeof client.addTransactionTags).toBe('function');
      });
    });

    describe('removeTransactionTags', () => {
      it('should have removeTransactionTags method', () => {
        expect(typeof client.removeTransactionTags).toBe('function');
      });
    });
  });

  describe('pagination utilities', () => {
    describe('extractCursor', () => {
      it('should extract cursor from Up API URL', () => {
        const url = 'https://api.up.com.au/api/v1/transactions?page[size]=20&page[after]=abc123';
        const cursor = UpApiClient.extractCursor(url);
        expect(cursor).toBe('abc123');
      });

      it('should return null for URL without cursor', () => {
        const url = 'https://api.up.com.au/api/v1/transactions?page[size]=20';
        const cursor = UpApiClient.extractCursor(url);
        expect(cursor).toBeNull();
      });

      it('should return null for null input', () => {
        const cursor = UpApiClient.extractCursor(null);
        expect(cursor).toBeNull();
      });
    });
  });
});
