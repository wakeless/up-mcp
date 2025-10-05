# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Additional Up API endpoints (categories, tags, webhooks)
- Rate limiting support
- Pagination helper utilities
- Enhanced error handling and logging

---

**Note:** This is an unofficial, community-built MCP server and is not affiliated with, endorsed by, or supported by Up Banking.
