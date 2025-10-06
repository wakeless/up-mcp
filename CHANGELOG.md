# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-10-06

### Added
- **Cursor-based pagination** for list endpoints (`list_accounts`, `list_transactions`, `get_account_transactions`, `list_tags`)
  - Added `cursor` parameter to paginated tools
  - Responses include `pagination` object with `nextCursor` and `prevCursor`
  - Static `extractCursor()` utility method in `UpApiClient`
- **Structured content** support with JSON output schemas
  - All 12 tools now return `structuredContent` instead of stringified JSON
  - Defined `outputSchema` for each tool based on Up API OpenAPI specification
  - Created `src/schemas.ts` with comprehensive output schemas
- Updated HTTP client methods to support cursor parameter
- Enhanced documentation with pagination and structured content sections

### Changed
- Tool responses now use `structuredContent` field (breaking change from text-based responses)
- Categories endpoint marked as non-paginated (as per Up API specification)

## [0.2.0] - 2025-10-05

### Added
- 8 new MCP tools for expanded Up Banking API coverage:
  - `get_transaction` - Get specific transaction details
  - `get_account_transactions` - Get transactions for a specific account
  - `list_categories` - List all transaction categories
  - `get_category` - Get specific category details
  - `update_transaction_category` - Update or remove transaction category
  - `list_tags` - List all tags in use
  - `add_transaction_tags` - Add tags to a transaction
  - `remove_transaction_tags` - Remove tags from a transaction
- HTTP helper methods in client: `patch()`, `post()`, `delete()`
- Integration tests for new endpoints (`src/endpoints.integration.test.ts`)
- Comprehensive test coverage (30+ tests)

### Changed
- Updated README with all 12 tool descriptions
- Updated package version to 0.2.0

## [0.1.0] - 2025-10-05

### Added
- Initial release of Up Banking MCP Server
- MCP tools for Up Banking API access:
  - `list_accounts` - List all Up bank accounts
  - `get_account` - Get specific account details
  - `list_transactions` - List transactions with filtering
  - `ping` - Test API connectivity
- TypeScript implementation with OpenAPI-generated types
- Comprehensive test suite with vitest
- Environment variable configuration for Up Personal Access Token
- Support for stdio transport (Claude Desktop compatible)
- ESLint and Prettier for code quality
- Full documentation (README, setup guides, validation results)

### Security
- Secure token-based authentication using Up Personal Access Tokens
- Environment variable management for sensitive credentials

## [Unreleased]

### Planned
- Webhook support
- Rate limiting support
- Enhanced error handling and logging

---

**Note:** This is an unofficial, community-built MCP server and is not affiliated with, endorsed by, or supported by Up Banking.
