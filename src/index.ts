#!/usr/bin/env node

/**
 * Up Banking MCP Server
 * Entry point for the MCP server that provides access to the Up Banking API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getConfig } from './env.js';
import { UpApiClient } from './client.js';
import * as schemas from './schemas.js';

// Initialize configuration and client
const config = getConfig();
const upClient = new UpApiClient(config.personalAccessToken);

// Create MCP server
const server = new Server(
  {
    name: 'up-banking-mcp',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
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
        outputSchema: schemas.listAccountsOutputSchema,
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
        outputSchema: schemas.getAccountOutputSchema,
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
        outputSchema: schemas.listTransactionsOutputSchema,
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
        outputSchema: schemas.getTransactionOutputSchema,
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
        outputSchema: schemas.listTransactionsOutputSchema,
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
        outputSchema: schemas.listCategoriesOutputSchema,
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
        outputSchema: schemas.getCategoryOutputSchema,
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
        outputSchema: schemas.updateTransactionCategoryOutputSchema,
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
        outputSchema: schemas.listTagsOutputSchema,
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
        outputSchema: schemas.addTransactionTagsOutputSchema,
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
        outputSchema: schemas.removeTransactionTagsOutputSchema,
      },
      {
        name: 'ping',
        description: 'Test connectivity to the Up API',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        outputSchema: schemas.pingOutputSchema,
      },
    ],
  };
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

        return {
          structuredContent: {
            ...response,
            pagination: {
              nextCursor,
              prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
            },
          },
        };
      }

      case 'get_account': {
        const { accountId } = args as { accountId: string };
        if (!accountId) {
          throw new Error('accountId is required');
        }
        const response = await upClient.getAccount(accountId);
        return {
          structuredContent: response,
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

        return {
          structuredContent: {
            ...response,
            pagination: {
              nextCursor,
              prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
            },
          },
        };
      }

      case 'get_transaction': {
        const { transactionId } = args as { transactionId: string };
        if (!transactionId) {
          throw new Error('transactionId is required');
        }
        const response = await upClient.getTransaction(transactionId);
        return {
          structuredContent: response,
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

        return {
          structuredContent: {
            ...response,
            pagination: {
              nextCursor,
              prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
            },
          },
        };
      }

      case 'list_categories': {
        const { parent } = args as { parent?: string };
        const response = await upClient.getCategories({ parent });

        return {
          structuredContent: response,
        };
      }

      case 'get_category': {
        const { categoryId } = args as { categoryId: string };
        if (!categoryId) {
          throw new Error('categoryId is required');
        }
        const response = await upClient.getCategory(categoryId);
        return {
          structuredContent: response,
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
        return {
          structuredContent: {
            success: true,
            transactionId,
            categoryId,
            message: `Category ${categoryId ? 'updated to ' + categoryId : 'removed'} for transaction ${transactionId}`,
          },
        };
      }

      case 'list_tags': {
        const { pageSize, cursor } = args as { pageSize?: number; cursor?: string };
        const response = await upClient.getTags({ pageSize, cursor });
        const nextCursor = UpApiClient.extractCursor(response.links?.next ?? null);

        return {
          structuredContent: {
            ...response,
            pagination: {
              nextCursor,
              prevCursor: UpApiClient.extractCursor(response.links?.prev ?? null),
            },
          },
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
        return {
          structuredContent: {
            success: true,
            transactionId,
            tags,
            message: `Added ${tags.length} tag(s) to transaction ${transactionId}`,
          },
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
        return {
          structuredContent: {
            success: true,
            transactionId,
            tags,
            message: `Removed ${tags.length} tag(s) from transaction ${transactionId}`,
          },
        };
      }

      case 'ping': {
        const result = await upClient.ping();
        return {
          structuredContent: {
            success: result,
            message: result ? 'Connection successful' : 'Connection failed',
          },
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
