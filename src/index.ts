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
        description: 'List transactions from Up bank accounts',
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
          },
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

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_accounts': {
        const response = await upClient.getAccounts();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
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
        };
        const response = await upClient.getTransactions(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'ping': {
        const result = await upClient.ping();
        return {
          content: [
            {
              type: 'text',
              text: result ? 'Connection successful' : 'Connection failed',
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
