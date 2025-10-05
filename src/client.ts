/**
 * HTTP Client for the Up Banking API
 */

import type { paths } from './generated/up-api.js';

export interface UpApiHeaders extends Record<string, string> {
  Authorization: string;
  'Content-Type': string;
  Accept: string;
}

export class UpApiClient {
  private readonly token: string;
  private readonly baseUrl = 'https://api.up.com.au/api/v1';

  constructor(token: string) {
    if (!token || token.trim().length === 0) {
      throw new Error('API token is required and cannot be empty');
    }
    this.token = token.trim();
  }

  /**
   * Get the headers required for Up API requests
   */
  getHeaders(): UpApiHeaders {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Get the base URL for the Up API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Make a GET request to the Up API
   */
  async get<T = unknown>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Up API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a PATCH request to the Up API
   */
  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Up API request failed: ${response.status} ${response.statusText}`);
    }

    // PATCH might return empty response
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  /**
   * Make a POST request to the Up API
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Up API request failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  /**
   * Make a DELETE request to the Up API
   */
  async delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Up API request failed: ${response.status} ${response.statusText}`);
    }

    // DELETE typically returns 204 No Content
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  /**
   * Get list of accounts
   */
  async getAccounts() {
    type AccountsResponse =
      paths['/accounts']['get']['responses'][200]['content']['application/json'];
    return this.get<AccountsResponse>('/accounts');
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string) {
    type AccountResponse =
      paths['/accounts/{id}']['get']['responses'][200]['content']['application/json'];
    return this.get<AccountResponse>(`/accounts/${accountId}`);
  }

  /**
   * Get list of transactions
   */
  async getTransactions(params?: {
    accountId?: string;
    since?: string;
    until?: string;
    pageSize?: number;
  }) {
    type TransactionsResponse =
      paths['/transactions']['get']['responses'][200]['content']['application/json'];

    const searchParams = new URLSearchParams();
    if (params?.accountId) searchParams.append('filter[accountId]', params.accountId);
    if (params?.since) searchParams.append('filter[since]', params.since);
    if (params?.until) searchParams.append('filter[until]', params.until);
    if (params?.pageSize) searchParams.append('page[size]', params.pageSize.toString());

    const query = searchParams.toString();
    return this.get<TransactionsResponse>(`/transactions${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(transactionId: string) {
    type TransactionResponse =
      paths['/transactions/{id}']['get']['responses'][200]['content']['application/json'];
    return this.get<TransactionResponse>(`/transactions/${transactionId}`);
  }

  /**
   * Get transactions for a specific account
   */
  async getAccountTransactions(
    accountId: string,
    params?: {
      since?: string;
      until?: string;
      pageSize?: number;
    }
  ) {
    type AccountTransactionsResponse =
      paths['/accounts/{accountId}/transactions']['get']['responses'][200]['content']['application/json'];

    const searchParams = new URLSearchParams();
    if (params?.since) searchParams.append('filter[since]', params.since);
    if (params?.until) searchParams.append('filter[until]', params.until);
    if (params?.pageSize) searchParams.append('page[size]', params.pageSize.toString());

    const query = searchParams.toString();
    return this.get<AccountTransactionsResponse>(
      `/accounts/${accountId}/transactions${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get list of categories
   */
  async getCategories(params?: { parent?: string }) {
    type CategoriesResponse =
      paths['/categories']['get']['responses'][200]['content']['application/json'];

    const searchParams = new URLSearchParams();
    if (params?.parent) searchParams.append('filter[parent]', params.parent);

    const query = searchParams.toString();
    return this.get<CategoriesResponse>(`/categories${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific category by ID
   */
  async getCategory(categoryId: string) {
    type CategoryResponse =
      paths['/categories/{id}']['get']['responses'][200]['content']['application/json'];
    return this.get<CategoryResponse>(`/categories/${categoryId}`);
  }

  /**
   * Update the category for a transaction
   */
  async updateTransactionCategory(transactionId: string, categoryId: string | null) {
    const body = {
      data: {
        type: 'categories' as const,
        id: categoryId,
      },
    };
    return this.patch(`/transactions/${transactionId}/relationships/category`, body);
  }

  /**
   * Get list of tags
   */
  async getTags(params?: { pageSize?: number }) {
    type TagsResponse =
      paths['/tags']['get']['responses'][200]['content']['application/json'];

    const searchParams = new URLSearchParams();
    if (params?.pageSize) searchParams.append('page[size]', params.pageSize.toString());

    const query = searchParams.toString();
    return this.get<TagsResponse>(`/tags${query ? `?${query}` : ''}`);
  }

  /**
   * Add tags to a transaction
   */
  async addTransactionTags(transactionId: string, tags: Array<{ id: string }>) {
    const body = {
      data: tags.map((tag) => ({
        type: 'tags' as const,
        id: tag.id,
      })),
    };
    return this.post(`/transactions/${transactionId}/relationships/tags`, body);
  }

  /**
   * Remove a tag from a transaction
   */
  async removeTransactionTags(transactionId: string, tags: Array<{ id: string }>) {
    const body = {
      data: tags.map((tag) => ({
        type: 'tags' as const,
        id: tag.id,
      })),
    };
    return this.delete(`/transactions/${transactionId}/relationships/tags`, body);
  }

  /**
   * Utility to test API connectivity (ping)
   */
  async ping(): Promise<boolean> {
    try {
      await this.get('/util/ping');
      return true;
    } catch {
      return false;
    }
  }
}
