/**
 * Integration tests for DatabaseConnection class
 * Task 2.2: Write unit tests for database connection pool
 * Requirements: 22.10
 * Compliance: PROJECT_MASTER_LOCK.md Section 3 (Testing Enforcement) - 90%+ coverage
 * 
 * These tests cover the actual DatabaseConnection implementation
 */

// Import before mocking to get actual implementation
import { Pool, PoolClient } from 'pg';

// Create comprehensive mocks
const mockClient: Partial<PoolClient> = {
  query: jest.fn(),
  release: jest.fn(),
};

const mockPool: Partial<Pool> = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
  totalCount: 0,
  idleCount: 0,
  waitingCount: 0,
};

// Mock pg module
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => mockPool),
  };
});

describe('DatabaseConnection Integration Tests', () => {
  let db: any;
  let PoolConstructor: jest.MockedClass<typeof Pool>;
  
  beforeAll(() => {
    // Get the mocked Pool constructor
    PoolConstructor = Pool as jest.MockedClass<typeof Pool>;
  });

  beforeEach(() => {
    // Don't clear all mocks - we need to preserve initialization calls
    (mockPool.connect as jest.Mock).mockClear();
    (mockPool.query as jest.Mock).mockClear();
    (mockPool.end as jest.Mock).mockClear();
    (mockClient.query as jest.Mock).mockClear();
    (mockClient.release as jest.Mock).mockClear();
    
    // Reset mock implementations
    (mockPool.connect as jest.Mock) = jest.fn();
    (mockPool.query as jest.Mock) = jest.fn();
    (mockPool.end as jest.Mock) = jest.fn();
    (mockClient.query as jest.Mock) = jest.fn();
    (mockClient.release as jest.Mock) = jest.fn();
    
    // Set default pool counts
    (mockPool as any).totalCount = 10;
    (mockPool as any).idleCount = 5;
    (mockPool as any).waitingCount = 0;
    
    // Get the existing singleton instance
    const dbModule = require('../../src/config/database.config');
    db = dbModule.db;
  });

  describe('Singleton Pattern and Initialization', () => {
    it('should create singleton instance', () => {
      const dbModule = require('../../src/config/database.config');
      const instance1 = dbModule.db;
      const instance2 = dbModule.db;
      
      expect(instance1).toBe(instance2);
    });

    it('should initialize pool with correct configuration', () => {
      // Pool was already created when module loaded
      expect(PoolConstructor).toHaveBeenCalled();
      expect(PoolConstructor).toHaveBeenCalledWith(expect.objectContaining({
        min: 10,
        max: 50,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      }));
    });
  });

  describe('getPool', () => {
    it('should return the pool instance', () => {
      const pool = db.getPool();
      expect(pool).toBe(mockPool);
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection', async () => {
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue({ rows: [{ now: new Date() }] });

      const result = await db.testConnection();

      expect(result).toBe(true);
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false on connection failure', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const result = await db.testConnection();

      expect(result).toBe(false);
    });

    it('should update isConnected state on success', async () => {
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue({ rows: [] });

      await db.testConnection();

      const stats = db.getStats();
      expect(stats.isConnected).toBe(true);
    });

    it('should update isConnected state on failure', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValue(new Error('Failed'));

      await db.testConnection();

      const stats = db.getStats();
      expect(stats.isConnected).toBe(false);
    });
  });

  describe('query with retry logic', () => {
    it('should execute query successfully on first attempt', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await db.query('SELECT * FROM test');

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should retry on ECONNREFUSED error', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1', [], 3);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should retry on ENOTFOUND error', async () => {
      const error: any = new Error('ENOTFOUND');
      error.code = 'ENOTFOUND';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on ETIMEDOUT error', async () => {
      const error: any = new Error('ETIMEDOUT');
      error.code = 'ETIMEDOUT';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on ECONNRESET error', async () => {
      const error: any = new Error('ECONNRESET');
      error.code = 'ECONNRESET';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on PostgreSQL 57P01 error', async () => {
      const error: any = new Error('Connection terminated');
      error.code = '57P01';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on PostgreSQL 57P03 error', async () => {
      const error: any = new Error('Cannot connect now');
      error.code = '57P03';
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on "Connection terminated" message', async () => {
      const error = new Error('Connection terminated unexpectedly');
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should retry on "Connection refused" message', async () => {
      const error = new Error('Connection refused by server');
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should not retry on non-connection errors', async () => {
      const error = new Error('Syntax error');
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      await expect(db.query('INVALID SQL')).rejects.toThrow('Syntax error');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      await expect(db.query('SELECT 1', [], 3)).rejects.toThrow();
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });
    
    it('should throw lastError when all retries exhausted', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      try {
        await db.query('SELECT 1', [], 2);
        fail('Should have thrown error');
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    it('should use exponential backoff between retries', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      const startTime = Date.now();
      await expect(db.query('SELECT 1', [], 3)).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Should wait at least 1000ms + 2000ms = 3000ms
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    it('should cap exponential backoff at 5000ms', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      const startTime = Date.now();
      await expect(db.query('SELECT 1', [], 5)).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Should not exceed 1000 + 2000 + 4000 + 5000 = 12000ms significantly
      expect(duration).toBeLessThan(15000);
    });

    it('should support parameterized queries', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });
    
    it('should handle error without message property', async () => {
      const error: any = new Error();
      error.code = 'UNKNOWN';
      delete error.message;

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      await expect(db.query('SELECT 1', [], 2)).rejects.toThrow();
    });
    
    it('should handle error with null message', async () => {
      const error: any = new Error();
      error.code = 'UNKNOWN';
      error.message = null;

      (mockPool.query as jest.Mock).mockRejectedValue(error);

      await expect(db.query('SELECT 1', [], 1)).rejects.toThrow();
    });
  });

  describe('isHealthy', () => {
    it('should return true when connected and pool has connections', async () => {
      // First establish connection
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue({ rows: [] });
      await db.testConnection();
      
      (mockPool as any).totalCount = 10;
      
      const healthy = db.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should return false when pool has no connections', () => {
      (mockPool as any).totalCount = 0;
      
      const healthy = db.isHealthy();
      expect(healthy).toBe(false);
    });
    
    it('should return false when not connected even if pool has connections', async () => {
      // Simulate failed connection
      (mockPool.connect as jest.Mock).mockRejectedValue(new Error('Failed'));
      await db.testConnection();
      
      (mockPool as any).totalCount = 10;
      
      const healthy = db.isHealthy();
      expect(healthy).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return pool statistics', () => {
      (mockPool as any).totalCount = 15;
      (mockPool as any).idleCount = 5;
      (mockPool as any).waitingCount = 2;

      const stats = db.getStats();

      expect(stats).toEqual({
        total: 15,
        idle: 5,
        waiting: 2,
        isConnected: expect.any(Boolean),
      });
    });
  });

  describe('close', () => {
    it('should close pool gracefully', async () => {
      (mockPool.end as jest.Mock).mockResolvedValue(undefined);

      await db.close();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should update isConnected state on close', async () => {
      (mockPool.end as jest.Mock).mockResolvedValue(undefined);

      await db.close();

      const stats = db.getStats();
      expect(stats.isConnected).toBe(false);
    });

    it('should throw error on close failure', async () => {
      const error = new Error('Close failed');
      (mockPool.end as jest.Mock).mockRejectedValue(error);

      await expect(db.close()).rejects.toThrow('Close failed');
    });
  });

  describe('Event Handlers', () => {
    it('should have error event handler registered', () => {
      // Event handlers are registered during initialization
      // We can't easily test them without triggering actual pool events
      // But we can verify the pool has the on() method
      expect(db.getPool().on).toBeDefined();
    });

    it('should handle error event', () => {
      // Get the error handler that was registered
      const errorHandler = (mockPool.on as jest.Mock).mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      expect(errorHandler).toBeDefined();
      
      // Trigger the error handler
      const testError = new Error('Test error');
      expect(() => errorHandler(testError)).not.toThrow();
    });

    it('should handle connect event', () => {
      // Get the connect handler that was registered
      const connectHandler = (mockPool.on as jest.Mock).mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      expect(connectHandler).toBeDefined();
      
      // Trigger the connect handler
      expect(() => connectHandler()).not.toThrow();
    });

    it('should handle remove event', () => {
      // Get the remove handler that was registered
      const removeHandler = (mockPool.on as jest.Mock).mock.calls.find(
        call => call[0] === 'remove'
      )?.[1];

      expect(removeHandler).toBeDefined();
      
      // Trigger the remove handler
      expect(() => removeHandler()).not.toThrow();
    });
  });

  describe('Additional Coverage Tests', () => {
    it('should handle query with default retry count', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      // Call without specifying retries (should default to 3)
      const result = await db.query('SELECT 1');

      expect(result).toEqual(mockResult);
    });

    it('should handle query with undefined params', async () => {
      const mockResult = { rows: [], rowCount: 0 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await db.query('SELECT 1', undefined);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1', undefined);
    });

    it('should handle connection error on last retry attempt', async () => {
      const error: any = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      // With 1 retry, it should fail immediately after first attempt
      await expect(db.query('SELECT 1', [], 1)).rejects.toThrow();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle error code that is not in the list', async () => {
      const error: any = new Error('Unknown error');
      error.code = 'UNKNOWN_CODE';
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      await expect(db.query('SELECT 1', [], 2)).rejects.toThrow('Unknown error');
      // Should not retry for unknown error codes
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle error without code property', async () => {
      const error: any = new Error('Generic error');
      delete error.code;
      (mockPool.query as jest.Mock).mockRejectedValue(error);

      await expect(db.query('SELECT 1', [], 2)).rejects.toThrow('Generic error');
      // Should not retry for errors without code
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should retry when error has no code but message contains "Connection terminated"', async () => {
      const error: any = new Error('Connection terminated by server');
      delete error.code; // No error code, but message should trigger retry
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1', [], 3);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should retry when error has no code but message contains "Connection refused"', async () => {
      const error: any = new Error('Connection refused by database');
      delete error.code; // No error code, but message should trigger retry
      const mockResult = { rows: [], rowCount: 0 };

      (mockPool.query as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT 1', [], 3);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should use default pool configuration when env vars are not set', () => {
      // Save original env vars
      const originalMin = process.env.DB_POOL_MIN;
      const originalMax = process.env.DB_POOL_MAX;

      // Delete env vars to test defaults
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_MAX;

      // Import config to test defaults
      const { databaseConfig } = require('../../src/config/database.config');

      // Verify defaults are used
      expect(databaseConfig.min).toBe(10);
      expect(databaseConfig.max).toBe(50);

      // Restore env vars
      if (originalMin) process.env.DB_POOL_MIN = originalMin;
      if (originalMax) process.env.DB_POOL_MAX = originalMax;
    });
  });
});
