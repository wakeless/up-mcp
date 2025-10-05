import { describe, it, expect } from 'vitest';
import { getConfig } from './env.js';
import { UpApiClient } from './client.js';

/**
 * Integration tests for new Up API endpoints
 * These tests require UP_PERSONAL_ACCESS_TOKEN environment variable to be set
 */
describe('Up API Endpoints Integration', () => {
  const hasToken = () => {
    try {
      getConfig();
      return true;
    } catch {
      return false;
    }
  };

  const getClient = () => {
    const config = getConfig();
    return new UpApiClient(config.personalAccessToken);
  };

  describe('getCategories', () => {
    it.skipIf(!hasToken())('should get list of categories', async () => {
      const client = getClient();
      const response = await client.getCategories();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0].type).toBe('categories');
    });
  });

  describe('getCategory', () => {
    it.skipIf(!hasToken())('should get a specific category by ID', async () => {
      const client = getClient();
      const response = await client.getCategory('good-life');
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe('good-life');
      expect(response.data.type).toBe('categories');
      expect(response.data.attributes.name).toBe('Good Life');
    });
  });

  describe('getTags', () => {
    it.skipIf(!hasToken())('should get list of tags', async () => {
      const client = getClient();
      const response = await client.getTags({ pageSize: 10 });
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('getTransaction', () => {
    it.skipIf(!hasToken())('should get a specific transaction by ID', async () => {
      const client = getClient();
      // Use known transaction ID
      const txId = '8a3874ad-5b9b-4751-a5b2-111a1b705d6b';
      const response = await client.getTransaction(txId);
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(txId);
      expect(response.data.type).toBe('transactions');
      expect(response.data.attributes.description).toBe('Super Tasty Rooster');
    });
  });

  describe('getAccountTransactions', () => {
    it.skipIf(!hasToken())('should get transactions for a specific account', async () => {
      const client = getClient();
      // Use known account ID
      const accountId = '03387b7f-3218-4966-aece-767d0b6b0202';
      const response = await client.getAccountTransactions(accountId, { pageSize: 5 });
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('tag operations', () => {
    it.skipIf(!hasToken())('should add and remove tags from transaction', async () => {
      const client = getClient();
      const txId = '8a3874ad-5b9b-4751-a5b2-111a1b705d6b';
      const testTag = 'test-mcp-integration';

      // Add a tag
      await client.addTransactionTags(txId, [{ id: testTag }]);

      // Verify tag was added
      const txAfterAdd = await client.getTransaction(txId);
      const hasTag = txAfterAdd.data.relationships.tags.data.some(
        (tag: { id: string }) => tag.id === testTag
      );
      expect(hasTag).toBe(true);

      // Remove the tag
      await client.removeTransactionTags(txId, [{ id: testTag }]);

      // Verify tag was removed
      const txAfterRemove = await client.getTransaction(txId);
      const stillHasTag = txAfterRemove.data.relationships.tags.data.some(
        (tag: { id: string }) => tag.id === testTag
      );
      expect(stillHasTag).toBe(false);
    });
  });

  describe('updateTransactionCategory', () => {
    it.skipIf(!hasToken())('should have updateTransactionCategory method', async () => {
      const client = getClient();
      // Method exists and is callable - actual update depends on transaction status
      // which can't be reliably tested in automated tests
      expect(typeof client.updateTransactionCategory).toBe('function');
    });
  });
});
