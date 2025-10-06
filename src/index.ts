#!/usr/bin/env node

/**
 * Up Banking MCP Server
 * Entry point for the MCP server that provides access to the Up Banking API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getConfig } from './env.js';
import { UpApiClient } from './client.js';

// Initialize configuration and client
const config = getConfig();
const upClient = new UpApiClient(config.personalAccessToken);

/**
 * Helper function to fetch all pages of a paginated API response
 * @param fetchFn Function that fetches a page given a cursor
 * @returns Array of all data items across all pages
 */
async function fetchAllPages<T extends { data: unknown[]; links?: { next?: string | null } }>(
  fetchFn: (cursor?: string) => Promise<T>
): Promise<T['data']> {
  const allData: T['data'] = [];
  let cursor: string | null = null;

  do {
    const response = await fetchFn(cursor || undefined);
    allData.push(...response.data);

    // Extract cursor from next link
    cursor = UpApiClient.extractCursor(response.links?.next ?? null);
  } while (cursor !== null);

  return allData;
}

// Create MCP server
const server = new Server(
  {
    name: 'up-banking-mcp',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_accounts',
        description: 'List all Up bank accounts for the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {
            accountType: {
              type: 'string',
              description: 'Filter by account type (SAVER or TRANSACTIONAL)',
              enum: ['SAVER', 'TRANSACTIONAL'],
            },
            cursor: {
              type: 'string',
              description: 'Pagination cursor to fetch the next page of results',
            },
          },
        },
      },
      {
        name: 'get_account',
        description: 'Get details of a specific Up bank account by ID',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'The unique identifier for the account',
            },
          },
          required: ['accountId'],
        },
      },
      {
        name: 'list_transactions',
        description:
          'List transactions from Up bank accounts\n\nThe default account that users are generally asking for is their transaction account. ie. "What is my latest transaction?" is likely to be in reference to their transaction account.',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Filter transactions by account ID',
            },
            since: {
              type: 'string',
              description: 'Filter transactions after this date (ISO 8601)',
            },
            until: {
              type: 'string',
              description: 'Filter transactions before this date (ISO 8601)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of records to return (max 100)',
            },
            cursor: {
              type: 'string',
              description: 'Pagination cursor to fetch the next page of results',
            },
          },
        },
      },
      {
        name: 'get_transaction',
        description: 'Get details of a specific transaction by ID',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'The unique identifier for the transaction',
            },
          },
          required: ['transactionId'],
        },
      },
      {
        name: 'get_account_transactions',
        description: 'Get transactions for a specific account',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'The account ID to get transactions for',
            },
            since: {
              type: 'string',
              description: 'Filter transactions after this date (ISO 8601)',
            },
            until: {
              type: 'string',
              description: 'Filter transactions before this date (ISO 8601)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of records to return (max 100)',
            },
            cursor: {
              type: 'string',
              description: 'Pagination cursor to fetch the next page of results',
            },
          },
          required: ['accountId'],
        },
      },
      {
        name: 'list_categories',
        description: 'List all categories and subcategories available in Up (not paginated)',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'string',
              description: 'Filter by parent category ID',
            },
          },
        },
      },
      {
        name: 'get_category',
        description: 'Get details of a specific category by ID',
        inputSchema: {
          type: 'object',
          properties: {
            categoryId: {
              type: 'string',
              description: 'The unique identifier for the category',
            },
          },
          required: ['categoryId'],
        },
      },
      {
        name: 'update_transaction_category',
        description:
          'Update or remove the category associated with a transaction (only for settled transactions)',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'The transaction ID to update',
            },
            categoryId: {
              type: ['string', 'null'],
              description: 'The category ID to assign, or null to remove category',
            },
          },
          required: ['transactionId', 'categoryId'],
        },
      },
      {
        name: 'list_tags',
        description: 'List all tags currently in use',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of records to return',
            },
            cursor: {
              type: 'string',
              description: 'Pagination cursor to fetch the next page of results',
            },
          },
        },
      },
      {
        name: 'add_transaction_tags',
        description: 'Add one or more tags to a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'The transaction ID to tag',
            },
            tags: {
              type: 'array',
              description: 'Array of tag IDs to add',
              items: {
                type: 'string',
              },
            },
          },
          required: ['transactionId', 'tags'],
        },
      },
      {
        name: 'remove_transaction_tags',
        description: 'Remove one or more tags from a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'The transaction ID to untag',
            },
            tags: {
              type: 'array',
              description: 'Array of tag IDs to remove',
              items: {
                type: 'string',
              },
            },
          },
          required: ['transactionId', 'tags'],
        },
      },
      {
        name: 'ping',
        description: 'Test connectivity to the Up API',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  // Note: We have a small, static list of resources, so pagination isn't strictly necessary
  // But we implement it for spec compliance
  const allResources = [
    {
      uri: 'up://accounts',
      name: 'All Accounts',
      description: 'List of all Up bank accounts',
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
  ];

  const allResourceTemplates = [
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
  ];

  // Simple pagination support (though not needed for our small list)
  const cursor = request.params?.cursor;

  // Since we have a small static list, we return everything on first page
  if (!cursor) {
    return {
      resources: allResources,
      resourceTemplates: allResourceTemplates,
      // No nextCursor since all resources fit on one page
    };
  }

  // If cursor is provided but we don't recognize it, return empty
  return {
    resources: [],
    resourceTemplates: [],
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    // Parse URI and route to appropriate handler
    if (uri === 'up://accounts') {
      // Fetch all accounts across all pages
      const allAccounts = await fetchAllPages((cursor) => upClient.getAccounts({ cursor }));
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({ data: allAccounts }, null, 2),
          },
        ],
      };
    }

    if (uri.startsWith('up://account/')) {
      const accountId = uri.replace('up://account/', '');
      const response = await upClient.getAccount(accountId);
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

    if (uri === 'up://transactions/recent') {
      // Get last 10 transactions
      const response = await upClient.getTransactions({
        pageSize: 10,
      });
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

    if (uri.startsWith('up://transaction/')) {
      const transactionId = uri.replace('up://transaction/', '');
      const response = await upClient.getTransaction(transactionId);
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

    if (uri === 'up://categories') {
      const response = await upClient.getCategories({});
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

    if (uri === 'up://tags') {
      // Fetch all tags across all pages
      const allTags = await fetchAllPages((cursor) => upClient.getTags({ cursor }));
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({ data: allTags }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource URI: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
  }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_accounts': {
        const { cursor } = args as { cursor?: string };
        const response = await upClient.getAccounts({ cursor });
        const nextCursor = UpApiClient.extractCursor(response.links?.next ?? null);
        const structuredData = {
          ...response,
          pagination: {
            nextCursor,
            prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      case 'get_account': {
        const { accountId } = args as { accountId: string };
        if (!accountId) {
          throw new Error('accountId is required');
        }
        const response = await upClient.getAccount(accountId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'list_transactions': {
        const params = args as {
          accountId?: string;
          since?: string;
          until?: string;
          pageSize?: number;
          cursor?: string;
        };
        const response = await upClient.getTransactions(params);
        const nextCursor = UpApiClient.extractCursor(response.links?.next ?? null);

        // Add resource URI information
        const transactionIds = response.data.map((t: any) => `up://transaction/${t.id}`);
        const note = `Note: Individual transactions can be accessed via resources: ${transactionIds.slice(0, 3).join(', ')}${transactionIds.length > 3 ? ', ...' : ''}`;

        const structuredData = {
          ...response,
          pagination: {
            nextCursor,
            prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: `${note}\n\n${JSON.stringify(structuredData, null, 2)}`,
            },
          ],
        };
      }

      case 'get_transaction': {
        const { transactionId } = args as { transactionId: string };
        if (!transactionId) {
          throw new Error('transactionId is required');
        }
        const response = await upClient.getTransaction(transactionId);
        const note = `Note: This transaction is also available via resource: up://transaction/${transactionId}`;
        return {
          content: [
            {
              type: 'text',
              text: `${note}\n\n${JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      }

      case 'get_account_transactions': {
        const { accountId, since, until, pageSize, cursor } = args as {
          accountId: string;
          since?: string;
          until?: string;
          pageSize?: number;
          cursor?: string;
        };
        if (!accountId) {
          throw new Error('accountId is required');
        }
        const response = await upClient.getAccountTransactions(accountId, {
          since,
          until,
          pageSize,
          cursor,
        });
        const nextCursor = UpApiClient.extractCursor(response.links?.next ?? null);

        // Add resource URI information
        const transactionIds = response.data.map((t: any) => `up://transaction/${t.id}`);
        const note = `Note: Individual transactions can be accessed via resources: ${transactionIds.slice(0, 3).join(', ')}${transactionIds.length > 3 ? ', ...' : ''}`;

        const structuredData = {
          ...response,
          pagination: {
            nextCursor,
            prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: `${note}\n\n${JSON.stringify(structuredData, null, 2)}`,
            },
          ],
        };
      }

      case 'list_categories': {
        const { parent } = args as { parent?: string };
        const response = await upClient.getCategories({ parent });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_category': {
        const { categoryId } = args as { categoryId: string };
        if (!categoryId) {
          throw new Error('categoryId is required');
        }
        const response = await upClient.getCategory(categoryId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'update_transaction_category': {
        const { transactionId, categoryId } = args as {
          transactionId: string;
          categoryId: string | null;
        };
        if (!transactionId || categoryId === undefined) {
          throw new Error('transactionId and categoryId are required');
        }
        await upClient.updateTransactionCategory(transactionId, categoryId);
        const structuredData = {
          success: true,
          transactionId,
          categoryId,
          message: `Category ${categoryId ? 'updated to ' + categoryId : 'removed'} for transaction ${transactionId}. View transaction at up://transaction/${transactionId}`,
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      case 'list_tags': {
        const { pageSize, cursor } = args as { pageSize?: number; cursor?: string };
        const response = await upClient.getTags({ pageSize, cursor });
        const nextCursor = UpApiClient.extractCursor(response.links?.next ?? null);
        const structuredData = {
          ...response,
          pagination: {
            nextCursor,
            prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      case 'add_transaction_tags': {
        const { transactionId, tags } = args as {
          transactionId: string;
          tags: string[];
        };
        if (!transactionId || !tags || !Array.isArray(tags)) {
          throw new Error('transactionId and tags array are required');
        }
        await upClient.addTransactionTags(
          transactionId,
          tags.map((id) => ({ id }))
        );
        const structuredData = {
          success: true,
          transactionId,
          tags,
          message: `Added ${tags.length} tag(s) to transaction ${transactionId}. View transaction at up://transaction/${transactionId}`,
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      case 'remove_transaction_tags': {
        const { transactionId, tags } = args as {
          transactionId: string;
          tags: string[];
        };
        if (!transactionId || !tags || !Array.isArray(tags)) {
          throw new Error('transactionId and tags array are required');
        }
        await upClient.removeTransactionTags(
          transactionId,
          tags.map((id) => ({ id }))
        );
        const structuredData = {
          success: true,
          transactionId,
          tags,
          message: `Removed ${tags.length} tag(s) from transaction ${transactionId}. View transaction at up://transaction/${transactionId}`,
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      case 'ping': {
        const result = await upClient.ping();
        const structuredData = {
          success: result,
          message: result ? 'Connection successful' : 'Connection failed',
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structuredData, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Up Banking MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
