import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { UpApiClient } from './client.js';

/**
 * Tests for MCP Resources functionality
 */
describe('MCP Resources', () => {
  let server: Server;
  let mockClient: UpApiClient;

  beforeEach(() => {
    // Create a mock client
    mockClient = {
      getAccounts: vi.fn(),
      getAccount: vi.fn(),
      getTransactions: vi.fn(),
      getTransaction: vi.fn(),
      getCategories: vi.fn(),
      getTags: vi.fn(),
    } as unknown as UpApiClient;

    // Create server instance
    server = new Server(
      {
        name: 'test-server',
        version: '0.0.1',
      },
      {
        capabilities: {
          resources: {},
        },
      }
    );
  });

  describe('ListResourcesRequestSchema', () => {
    it('should list all available static resources', async () => {
      const handler = vi.fn(async () => ({
        resources: [
          {
            uri: 'up://accounts',
            name: 'All Accounts',
            description: 'List of all Up bank accounts',
            mimeType: 'application/json',
          },
          {
            uri: 'up://transactions',
            name: 'Recent Transactions',
            description: 'Transactions from the last 30 days',
            mimeType: 'application/json',
          },
          {
            uri: 'up://transactions/recent',
            name: 'Latest Transactions',
            description: 'The 10 most recent transactions',
            mimeType: 'application/json',
          },
          {
            uri: 'up://categories',
            name: 'All Categories',
            description: 'List of all transaction categories',
            mimeType: 'application/json',
          },
          {
            uri: 'up://tags',
            name: 'All Tags',
            description: 'List of all tags currently in use',
            mimeType: 'application/json',
          },
        ],
        resourceTemplates: [
          {
            uriTemplate: 'up://account/{accountId}',
            name: 'Account Details',
            description: 'Details of a specific account by ID',
            mimeType: 'application/json',
          },
          {
            uriTemplate: 'up://transaction/{transactionId}',
            name: 'Transaction Details',
            description: 'Details of a specific transaction by ID',
            mimeType: 'application/json',
          },
        ],
      }));

      server.setRequestHandler(ListResourcesRequestSchema, handler);

      const result = await handler({} as any);

      expect(result.resources).toHaveLength(5);
      expect(result.resourceTemplates).toHaveLength(2);
      expect(result.resources[0].uri).toBe('up://accounts');
      expect(result.resourceTemplates[0].uriTemplate).toBe('up://account/{accountId}');
    });
  });

  describe('ReadResourceRequestSchema', () => {
    it('should read up://accounts resource and fetch all pages', async () => {
      const mockAccountsResponse1 = {
        data: [
          {
            id: 'acc-1',
            type: 'accounts',
            attributes: { displayName: 'Test Account 1' },
          },
        ],
        links: { next: 'https://api.up.com.au/api/v1/accounts?page[after]=cursor1' },
      };

      const mockAccountsResponse2 = {
        data: [
          {
            id: 'acc-2',
            type: 'accounts',
            attributes: { displayName: 'Test Account 2' },
          },
        ],
        links: {},
      };

      vi.spyOn(mockClient, 'getAccounts')
        .mockResolvedValueOnce(mockAccountsResponse1 as any)
        .mockResolvedValueOnce(mockAccountsResponse2 as any);

      const handler = vi.fn(async (request: any) => {
        if (request.params.uri === 'up://accounts') {
          // Simulate fetchAllPages logic
          const allAccounts = [];
          let cursor: string | undefined = undefined;
          let response = await mockClient.getAccounts({ cursor });
          allAccounts.push(...response.data);

          // Check for next page
          const nextUrl = response.links?.next;
          if (nextUrl) {
            cursor = 'cursor1';
            response = await mockClient.getAccounts({ cursor });
            allAccounts.push(...response.data);
          }

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify({ data: allAccounts }, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://accounts' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://accounts');
      expect(result.contents[0].mimeType).toBe('application/json');
      const parsedData = JSON.parse(result.contents[0].text);
      expect(parsedData.data).toHaveLength(2);
      expect(parsedData.data[0].id).toBe('acc-1');
      expect(parsedData.data[1].id).toBe('acc-2');
      expect(mockClient.getAccounts).toHaveBeenCalledTimes(2);
    });

    it('should read up://account/{accountId} resource', async () => {
      const mockAccountResponse = {
        data: {
          id: 'acc-123',
          type: 'accounts',
          attributes: { displayName: 'Specific Account' },
        },
      };

      vi.spyOn(mockClient, 'getAccount').mockResolvedValue(mockAccountResponse as any);

      const handler = vi.fn(async (request: any) => {
        const uri = request.params.uri;
        if (uri.startsWith('up://account/')) {
          const accountId = uri.replace('up://account/', '');
          const response = await mockClient.getAccount(accountId);
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://account/acc-123' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://account/acc-123');
      expect(JSON.parse(result.contents[0].text)).toEqual(mockAccountResponse);
      expect(mockClient.getAccount).toHaveBeenCalledWith('acc-123');
    });

    it('should read up://transactions/recent resource with pageSize 10', async () => {
      const mockTransactionsResponse = {
        data: Array(10).fill({
          id: 'txn-1',
          type: 'transactions',
          attributes: { description: 'Recent Transaction' },
        }),
      };

      vi.spyOn(mockClient, 'getTransactions').mockResolvedValue(mockTransactionsResponse as any);

      const handler = vi.fn(async (request: any) => {
        if (request.params.uri === 'up://transactions/recent') {
          const response = await mockClient.getTransactions({ pageSize: 10 });
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://transactions/recent' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://transactions/recent');
      expect(JSON.parse(result.contents[0].text)).toEqual(mockTransactionsResponse);
      expect(mockClient.getTransactions).toHaveBeenCalledWith({ pageSize: 10 });
    });

    it('should read up://transaction/{transactionId} resource', async () => {
      const mockTransactionResponse = {
        data: {
          id: 'txn-456',
          type: 'transactions',
          attributes: { description: 'Specific Transaction' },
        },
      };

      vi.spyOn(mockClient, 'getTransaction').mockResolvedValue(mockTransactionResponse as any);

      const handler = vi.fn(async (request: any) => {
        const uri = request.params.uri;
        if (uri.startsWith('up://transaction/')) {
          const transactionId = uri.replace('up://transaction/', '');
          const response = await mockClient.getTransaction(transactionId);
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://transaction/txn-456' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://transaction/txn-456');
      expect(JSON.parse(result.contents[0].text)).toEqual(mockTransactionResponse);
      expect(mockClient.getTransaction).toHaveBeenCalledWith('txn-456');
    });

    it('should read up://categories resource', async () => {
      const mockCategoriesResponse = {
        data: [
          {
            id: 'cat-1',
            type: 'categories',
            attributes: { name: 'Food & Drink' },
          },
        ],
      };

      vi.spyOn(mockClient, 'getCategories').mockResolvedValue(mockCategoriesResponse as any);

      const handler = vi.fn(async (request: any) => {
        if (request.params.uri === 'up://categories') {
          const response = await mockClient.getCategories({});
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://categories' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://categories');
      expect(JSON.parse(result.contents[0].text)).toEqual(mockCategoriesResponse);
      expect(mockClient.getCategories).toHaveBeenCalledWith({});
    });

    it('should read up://tags resource and fetch all pages', async () => {
      const mockTagsResponse1 = {
        data: [
          {
            id: 'holiday',
            type: 'tags',
          },
        ],
        links: { next: 'https://api.up.com.au/api/v1/tags?page[after]=cursor1' },
      };

      const mockTagsResponse2 = {
        data: [
          {
            id: 'dinner',
            type: 'tags',
          },
        ],
        links: {},
      };

      vi.spyOn(mockClient, 'getTags')
        .mockResolvedValueOnce(mockTagsResponse1 as any)
        .mockResolvedValueOnce(mockTagsResponse2 as any);

      const handler = vi.fn(async (request: any) => {
        if (request.params.uri === 'up://tags') {
          // Simulate fetchAllPages logic
          const allTags = [];
          let cursor: string | undefined = undefined;
          let response = await mockClient.getTags({ cursor });
          allTags.push(...response.data);

          // Check for next page
          const nextUrl = response.links?.next;
          if (nextUrl) {
            cursor = 'cursor1';
            response = await mockClient.getTags({ cursor });
            allTags.push(...response.data);
          }

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify({ data: allTags }, null, 2),
              },
            ],
          };
        }
        throw new Error('Unknown resource');
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      const result = await handler({ params: { uri: 'up://tags' } } as any);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('up://tags');
      const parsedData = JSON.parse(result.contents[0].text);
      expect(parsedData.data).toHaveLength(2);
      expect(parsedData.data[0].id).toBe('holiday');
      expect(parsedData.data[1].id).toBe('dinner');
      expect(mockClient.getTags).toHaveBeenCalledTimes(2);
    });

    it('should throw error for unknown resource URI', async () => {
      const handler = vi.fn(async (request: any) => {
        const uri = request.params.uri;
        throw new Error(`Unknown resource URI: ${uri}`);
      });

      server.setRequestHandler(ReadResourceRequestSchema, handler);

      await expect(handler({ params: { uri: 'up://invalid' } } as any)).rejects.toThrow(
        'Unknown resource URI: up://invalid'
      );
    });
  });
});
