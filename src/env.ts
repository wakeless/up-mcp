/**
 * Environment variable validation and configuration
 */

export interface UpConfig {
  personalAccessToken: string;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Validates and returns the Up API configuration from environment variables
 * @throws {ConfigError} If required environment variables are missing or invalid
 */
export function getConfig(): UpConfig {
  const token = process.env.UP_PERSONAL_ACCESS_TOKEN;

  if (token === undefined) {
    throw new ConfigError(
      'UP_PERSONAL_ACCESS_TOKEN environment variable is required. ' +
        'Get your token from the Up mobile app: Settings > Security > Personal Access Tokens'
    );
  }

  if (token.trim().length === 0) {
    throw new ConfigError('UP_PERSONAL_ACCESS_TOKEN cannot be empty');
  }

  return {
    personalAccessToken: token.trim(),
  };
}
