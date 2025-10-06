/**
 * Output schemas for MCP tools based on Up API OpenAPI specification
 * These schemas define the structure of the structuredContent field in tool responses
 */

// Base pagination schema for responses with cursor-based pagination
const paginationSchema = {
  type: 'object' as const,
  properties: {
    nextCursor: {
      type: ['string', 'null'] as const,
      description: 'Cursor for the next page of results, or null if no more pages',
    },
    prevCursor: {
      type: ['string', 'null'] as const,
      description: 'Cursor for the previous page of results, or null if no previous page',
    },
  },
};

// Account response schemas
export const listAccountsOutputSchema = {
  type: 'object' as const,
  description: 'Paginated list of accounts with pagination metadata',
  properties: {
    data: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        description: 'Account resource',
      },
    },
    links: {
      type: 'object' as const,
      description: 'JSON:API pagination links',
    },
    pagination: paginationSchema,
  },
  required: ['data', 'links', 'pagination'],
};

export const getAccountOutputSchema = {
  type: 'object' as const,
  description: 'Single account details',
  properties: {
    data: {
      type: 'object' as const,
      description: 'Account resource',
    },
  },
  required: ['data'],
};

// Transaction response schemas
export const listTransactionsOutputSchema = {
  type: 'object' as const,
  description: 'Paginated list of transactions with pagination metadata',
  properties: {
    data: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        description: 'Transaction resource',
      },
    },
    links: {
      type: 'object' as const,
      description: 'JSON:API pagination links',
    },
    pagination: paginationSchema,
  },
  required: ['data', 'links', 'pagination'],
};

export const getTransactionOutputSchema = {
  type: 'object' as const,
  description: 'Single transaction details',
  properties: {
    data: {
      type: 'object' as const,
      description: 'Transaction resource',
    },
  },
  required: ['data'],
};

// Category response schemas
export const listCategoriesOutputSchema = {
  type: 'object' as const,
  description: 'List of all categories (not paginated)',
  properties: {
    data: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        description: 'Category resource',
      },
    },
  },
  required: ['data'],
};

export const getCategoryOutputSchema = {
  type: 'object' as const,
  description: 'Single category details',
  properties: {
    data: {
      type: 'object' as const,
      description: 'Category resource',
    },
  },
  required: ['data'],
};

export const updateTransactionCategoryOutputSchema = {
  type: 'object' as const,
  description: 'Result of category update operation',
  properties: {
    success: {
      type: 'boolean' as const,
      description: 'Whether the operation succeeded',
    },
    transactionId: {
      type: 'string' as const,
      description: 'The transaction ID that was updated',
    },
    categoryId: {
      type: ['string', 'null'] as const,
      description: 'The category ID that was set, or null if removed',
    },
    message: {
      type: 'string' as const,
      description: 'Human-readable result message',
    },
  },
  required: ['success', 'transactionId', 'message'],
};

// Tag response schemas
export const listTagsOutputSchema = {
  type: 'object' as const,
  description: 'Paginated list of tags with pagination metadata',
  properties: {
    data: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        description: 'Tag resource',
      },
    },
    links: {
      type: 'object' as const,
      description: 'JSON:API pagination links',
    },
    pagination: paginationSchema,
  },
  required: ['data', 'links', 'pagination'],
};

export const addTransactionTagsOutputSchema = {
  type: 'object' as const,
  description: 'Result of adding tags to a transaction',
  properties: {
    success: {
      type: 'boolean' as const,
      description: 'Whether the operation succeeded',
    },
    transactionId: {
      type: 'string' as const,
      description: 'The transaction ID that was updated',
    },
    tags: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'The tag IDs that were added',
    },
    message: {
      type: 'string' as const,
      description: 'Human-readable result message',
    },
  },
  required: ['success', 'transactionId', 'tags', 'message'],
};

export const removeTransactionTagsOutputSchema = {
  type: 'object' as const,
  description: 'Result of removing tags from a transaction',
  properties: {
    success: {
      type: 'boolean' as const,
      description: 'Whether the operation succeeded',
    },
    transactionId: {
      type: 'string' as const,
      description: 'The transaction ID that was updated',
    },
    tags: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'The tag IDs that were removed',
    },
    message: {
      type: 'string' as const,
      description: 'Human-readable result message',
    },
  },
  required: ['success', 'transactionId', 'tags', 'message'],
};

// Utility schemas
export const pingOutputSchema = {
  type: 'object' as const,
  description: 'API connectivity test result',
  properties: {
    success: {
      type: 'boolean' as const,
      description: 'Whether the API is reachable',
    },
    message: {
      type: 'string' as const,
      description: 'Human-readable status message',
    },
  },
  required: ['success', 'message'],
};
