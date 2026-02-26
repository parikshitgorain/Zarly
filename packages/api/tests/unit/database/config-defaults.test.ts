/**
 * Test database config defaults in isolation
 * This test must run in a separate file to avoid module caching issues
 */

describe('Database Config Defaults', () => {
  beforeAll(() => {
    // Clear the module cache to force re-import
    jest.resetModules();
    
    // Remove env vars to test defaults
    delete process.env.DB_POOL_MIN;
    delete process.env.DB_POOL_MAX;
  });

  it('should use default min pool size when DB_POOL_MIN is not set', () => {
    const { databaseConfig } = require('../../../src/config/database.config');
    expect(databaseConfig.min).toBe(10);
  });

  it('should use default max pool size when DB_POOL_MAX is not set', () => {
    const { databaseConfig } = require('../../../src/config/database.config');
    expect(databaseConfig.max).toBe(50);
  });
});
