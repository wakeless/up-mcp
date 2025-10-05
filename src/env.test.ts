import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, ConfigError } from './env.js';

describe('Environment Configuration', () => {
  const originalEnv = process.env.UP_PERSONAL_ACCESS_TOKEN;

  afterEach(() => {
    // Restore original env var after each test
    if (originalEnv) {
      process.env.UP_PERSONAL_ACCESS_TOKEN = originalEnv;
    } else {
      delete process.env.UP_PERSONAL_ACCESS_TOKEN;
    }
  });

  describe('getConfig', () => {
    it('should return config when UP_PERSONAL_ACCESS_TOKEN is set', () => {
      process.env.UP_PERSONAL_ACCESS_TOKEN = 'test-token-123';

      const config = getConfig();

      expect(config).toEqual({
        personalAccessToken: 'test-token-123',
      });
    });

    it('should trim whitespace from token', () => {
      process.env.UP_PERSONAL_ACCESS_TOKEN = '  test-token-123  ';

      const config = getConfig();

      expect(config.personalAccessToken).toBe('test-token-123');
    });

    it('should throw ConfigError when UP_PERSONAL_ACCESS_TOKEN is not set', () => {
      delete process.env.UP_PERSONAL_ACCESS_TOKEN;

      expect(() => getConfig()).toThrow(ConfigError);
      expect(() => getConfig()).toThrow(
        /UP_PERSONAL_ACCESS_TOKEN environment variable is required/
      );
    });

    it('should throw ConfigError when UP_PERSONAL_ACCESS_TOKEN is empty', () => {
      process.env.UP_PERSONAL_ACCESS_TOKEN = '';

      expect(() => getConfig()).toThrow(ConfigError);
      expect(() => getConfig()).toThrow(/cannot be empty/);
    });

    it('should throw ConfigError when UP_PERSONAL_ACCESS_TOKEN is only whitespace', () => {
      process.env.UP_PERSONAL_ACCESS_TOKEN = '   ';

      expect(() => getConfig()).toThrow(ConfigError);
      expect(() => getConfig()).toThrow(/cannot be empty/);
    });
  });

  describe('ConfigError', () => {
    it('should be an instance of Error', () => {
      const error = new ConfigError('test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new ConfigError('test message');
      expect(error.name).toBe('ConfigError');
    });

    it('should have correct message', () => {
      const error = new ConfigError('test message');
      expect(error.message).toBe('test message');
    });
  });
});
