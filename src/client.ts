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
