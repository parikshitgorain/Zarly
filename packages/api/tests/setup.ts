/**
 * Jest setup file for API package tests
 * Runs before all tests in the API package
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.DB_POOL_MIN = '10';
process.env.DB_POOL_MAX = '50';

// Increase test timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for debugging
  warn: console.warn,
  error: console.error,
};
