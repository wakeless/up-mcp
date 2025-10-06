# TODO - Resources Implementation

## Overview
Implement MCP Resources to expose Up Banking data as readable context with URIs. This allows Claude to access account/transaction data without explicitly calling tools.

## Tasks

### Phase 1: Design Resource Structure
- [x] Design resource URI scheme (e.g., `up://accounts`, `up://account/{id}`, `up://transactions`)
- [x] Define resource metadata (name, description, MIME type)
- [x] Determine which endpoints should be exposed as resources
- [x] Plan resource refresh/caching strategy (Not needed - resources call API on-demand)

### Phase 2: Implement Resources Capability
- [x] Add `resources` capability to server capabilities in `src/index.ts`
- [x] Import required MCP types (`ListResourcesRequestSchema`, `ReadResourceRequestSchema`)
- [x] Create resource list handler for `resources/list`
- [x] Create resource read handler for `resources/read`

### Phase 3: Resource Implementations
- [x] Implement `up://accounts` - List all accounts as a resource
- [x] Implement `up://account/{id}` - Single account resource
- [x] Implement `up://transactions` - Recent transactions resource (last 30 days)
- [x] Implement `up://transactions/recent` - Last 10 transactions
- [x] Implement `up://transaction/{id}` - Single transaction resource
- [x] Implement `up://categories` - Categories list resource
- [x] Implement `up://tags` - Tags list resource

### Phase 4: Testing
- [x] Write unit tests for resource list handler
- [x] Write unit tests for resource read handler
- [x] Write tests for each resource type (src/resources.test.ts)
- [x] Test resource URIs with invalid IDs (error handling)
- [ ] Verify resources work in Claude Desktop (pending user testing)

### Phase 5: Documentation
- [x] Update README with resources section
- [x] Document all available resource URIs
- [x] Add examples of using resources vs tools
- [x] Update CHANGELOG for v0.4.0

### Phase 6: Release
- [ ] Run all tests and verify passing
- [ ] Build and verify TypeScript compilation
- [ ] Create commit and merge to main

## Resource URI Design (Proposed)

### Account Resources
- `up://accounts` - List of all accounts
- `up://account/{accountId}` - Specific account details

### Transaction Resources
- `up://transactions` - Recent transactions (default: last 30 days)
- `up://transactions/recent` - Last 10 transactions
- `up://transaction/{transactionId}` - Specific transaction details
- `up://account/{accountId}/transactions` - Transactions for an account

### Category Resources
- `up://categories` - All categories
- `up://category/{categoryId}` - Specific category

### Tag Resources
- `up://tags` - All tags in use

## Notes
- Resources should return data in text format (JSON stringified) with `application/json` MIME type
- Resources are read-only (no mutations)
- Consider rate limiting and caching for frequently accessed resources
- Resources complement tools - tools are for actions, resources are for passive context
