# Up Banking MCP Server

**An unofficial MCP (Model Context Protocol) server** that provides programmatic access to the Up Banking API. This server exposes Up Banking's account and transaction data through MCP tools, enabling AI assistants to interact with your Up bank accounts.

> **⚠️ Disclaimer:** This is an unofficial, community-built MCP server and is not affiliated with, endorsed by, or supported by Up Banking. Use at your own risk.

## Features

- 🏦 **Account Management**: List and retrieve Up bank accounts
- 💰 **Transaction History**: Access transaction data with filtering options
- 🏷️ **Categories & Tags**: Manage transaction categories and tags
- 📄 **Cursor-Based Pagination**: Navigate through large result sets efficiently
- 📊 **Structured Content**: All tools return typed JSON objects with output schemas
- 🔐 **Secure Authentication**: Uses Up Personal Access Tokens
- 📡 **MCP Compatible**: Works with any MCP-compatible client
- ✅ **Comprehensive Testing**: 30+ tests covering unit and integration scenarios

## Available Tools

The server exposes **12 MCP tools** for interacting with the Up Banking API:

### Account Tools

#### `list_accounts`
List all Up bank accounts for the authenticated user.

**Parameters:**
- `accountType` (optional): Filter by account type (`SAVER` or `TRANSACTIONAL`)
- `cursor` (optional): Pagination cursor to fetch the next page of results

**Returns:** Account list with pagination metadata (`nextCursor`, `prevCursor`)

#### `get_account`
Get details of a specific Up bank account by ID.

**Parameters:**
- `accountId` (required): The unique identifier for the account

### Transaction Tools

#### `list_transactions`
List transactions from Up bank accounts.

**Parameters:**
- `accountId` (optional): Filter transactions by account ID
- `since` (optional): Filter transactions after this date (ISO 8601)
- `until` (optional): Filter transactions before this date (ISO 8601)
- `pageSize` (optional): Number of records to return (max 100)
- `cursor` (optional): Pagination cursor to fetch the next page of results

**Returns:** Transaction list with pagination metadata (`nextCursor`, `prevCursor`)

#### `get_transaction`
Get details of a specific transaction by ID.

**Parameters:**
- `transactionId` (required): The unique identifier for the transaction

**Returns:** Single transaction object

#### `get_account_transactions`
Get transactions for a specific account.

**Parameters:**
- `accountId` (required): The account ID to get transactions for
- `since` (optional): Filter transactions after this date (ISO 8601)
- `until` (optional): Filter transactions before this date (ISO 8601)
- `pageSize` (optional): Number of records to return (max 100)
- `cursor` (optional): Pagination cursor to fetch the next page of results

**Returns:** Transaction list with pagination metadata (`nextCursor`, `prevCursor`)

### Category Tools

#### `list_categories`
List all categories and subcategories available in Up.

**Parameters:**
- `parent` (optional): Filter by parent category ID

#### `get_category`
Get details of a specific category by ID.

**Parameters:**
- `categoryId` (required): The unique identifier for the category

#### `update_transaction_category`
Update or remove the category associated with a transaction.

**Parameters:**
- `transactionId` (required): The transaction ID to update
- `categoryId` (required): The category ID to assign, or `null` to remove category

**Note:** Only works for settled transactions (status `SETTLED`), not pending/held transactions.

### Tag Tools

#### `list_tags`
List all tags currently in use.

**Parameters:**
- `pageSize` (optional): Number of records to return
- `cursor` (optional): Pagination cursor to fetch the next page of results

**Returns:** Tag list with pagination metadata (`nextCursor`, `prevCursor`)

#### `add_transaction_tags`
Add one or more tags to a transaction.

**Parameters:**
- `transactionId` (required): The transaction ID to tag
- `tags` (required): Array of tag IDs to add (e.g., `["holiday", "dinner"]`)

**Returns:** Success confirmation with operation details

#### `remove_transaction_tags`
Remove one or more tags from a transaction.

**Parameters:**
- `transactionId` (required): The transaction ID to untag
- `tags` (required): Array of tag IDs to remove

**Returns:** Success confirmation with operation details

### Utility Tools

#### `ping`
Test connectivity to the Up API.

## Pagination

Tools that return lists (`list_accounts`, `list_transactions`, `get_account_transactions`, `list_tags`) support cursor-based pagination:

- Use the `cursor` parameter to navigate to a specific page
- Each paginated response includes a `pagination` object with `nextCursor` and `prevCursor` fields
- If `nextCursor` is `null`, you've reached the end of the results
- If `prevCursor` is `null`, you're on the first page

**Example pagination flow:**
1. Call `list_transactions` without cursor → Get first page
2. Check response `pagination.nextCursor`
3. Call `list_transactions` with `cursor: nextCursor` → Get next page
4. Repeat until `nextCursor` is `null`

## Structured Content

All tools return structured JSON objects via the `structuredContent` field:

- **Type Safety**: Each tool has a defined `outputSchema` that validates responses
- **Consistent Format**: Responses follow the JSON:API specification used by Up Banking
- **Direct Access**: No need to parse JSON strings - data is returned as native objects
- **Pagination Metadata**: Paginated responses include cursor information for easy navigation

## Prerequisites

- Node.js 18 or later
- An Up bank account
- An Up Personal Access Token

## Getting Your Up Personal Access Token

1. Open the Up mobile app
2. Go to **Settings**
3. Select **Security**
4. Choose **Personal Access Tokens**
5. Create a new token and copy it

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
UP_PERSONAL_ACCESS_TOKEN=your_token_here
```

## Using with Claude Desktop

To use this MCP server with Claude Desktop, add it to your Claude Desktop configuration file:

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

### Option 1: Using npx (Recommended - once published)

```json
{
  "mcpServers": {
    "up-banking": {
      "command": "npx",
      "args": ["-y", "up-mcp@latest"],
      "env": {
        "UP_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Option 2: Local Development

```json
{
  "mcpServers": {
    "up-banking": {
      "command": "node",
      "args": ["/absolute/path/to/up-mcp/dist/index.js"],
      "env": {
        "UP_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

**Important:**
- Replace `your_token_here` with your actual Up Personal Access Token (see [Getting Your Up Personal Access Token](#getting-your-up-personal-access-token))
- For local development, replace `/absolute/path/to/up-mcp` with the full path to your cloned repository
- If using a Node.js version manager (nvm, mise, etc.), you may need to use the full path to `node` (find it with `which node`)
- Restart Claude Desktop after updating the configuration

After configuration, you'll have access to all 12 Up Banking tools within Claude Desktop conversations.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build

# Run linter
npm run lint

# Format code
npm run format

# Run the server in development mode
npm run dev
```

## Building for Production

```bash
npm run build
```

This will:
1. Generate TypeScript types from the Up OpenAPI specification
2. Compile TypeScript to JavaScript in the `dist/` directory

## Running the Server

After building, you can run the server:

```bash
# Using npm
npm start

# Or directly with node
node dist/index.js
```

The server runs on stdio and communicates using the MCP protocol.

## Project Structure

```
up-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── client.ts             # Up API HTTP client
│   ├── env.ts                # Environment variable validation
│   ├── generated/            # Auto-generated OpenAPI types
│   │   └── up-api.ts
│   ├── *.test.ts             # Test files
│   └── integration.test.ts   # Integration tests
├── openapi.json              # Up API OpenAPI specification
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

Integration tests require a valid `UP_PERSONAL_ACCESS_TOKEN` environment variable. If not set, these tests are automatically skipped.

## API Documentation

For more information about the Up Banking API, visit:
- [Up Developer Docs](https://developer.up.com.au/)
- [Up API OpenAPI Spec](https://github.com/up-banking/api)

## Security

- Never commit your `.env` file or expose your Personal Access Token
- The `.gitignore` file is configured to exclude sensitive files
- Tokens are validated on server startup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## License

MIT

## Links

- [Michael Gall's blog](https://wakeless.net)
- [GitHub Repository](https://github.com/wakeless/up-mcp)
- [Up Banking](https://up.com.au/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- Development sponsored by [Github and Slack Integration](https://pipie.io)[
