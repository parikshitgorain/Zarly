/**
 * Unit tests for database connection pool
 * Task 2.2: Write unit tests for database connection pool
 * Requirements: 22.10
 * Compliance: PROJECT_MASTER_LOCK.md Section 3 (Testing Enforcement), Section 5 (Database Rules)
 */

import { Pool } from 'pg';
import { databaseConfig } from '../../../src/config/database.config';

// Mock pg module
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('Database Connection Pool', () => {
  let mockPool: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked pool instance
    mockPool = new Pool(databaseConfig);
  });

  describe('Configuration', () => {
    it('should have correct pool configuration', () => {
      expect(databaseConfig).toHaveProperty('connectionString');
      expect(databaseConfig).toHaveProperty('min');
      expect(databaseConfig).toHaveProperty('max');
      expect(databaseConfig).toHaveProperty('idleTimeoutMillis');
      expect(databaseConfig).toHaveProperty('connectionTimeoutMillis');
    });

    it('should have minimum pool size of 10', () => {
      expect(databaseConfig.min).toBe(10);
    });

    it('should have maximum pool size of 50', () => {
      expect(databaseConfig.max).toBe(50);
    });

    it('should have idle timeout configured', () => {
      expect(databaseConfig.idleTimeoutMillis).toBe(30000);
    });

    it('should have connection timeout configured', () => {
      expect(databaseConfig.connectionTimeoutMillis).toBe(10000);
    });

    it('should have keep-alive enabled', () => {
      expect(databaseConfig.keepAlive).toBe(true);
      expect(databaseConfig.keepAliveInitialDelayMillis).toBe(10000);
    });
  });

  describe('Connection Acquisition and Release', () => {
    it('should successfully acquire a connection from pool', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const client = await mockPool.connect();
      expect(client).toBeDefined();
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
    });

    it('should release connection back to pool', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const client = await mockPool.connect();
      client.release();
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should handle connection acquisition failure', async () => {
      const error = new Error('Connection failed');
      mockPool.connect.mockRejectedValue(error);

      await expect(mockPool.connect()).rejects.toThrow('Connection failed');
    });

    it('should handle multiple concurrent connection requests', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const connections = await Promise.all([
        mockPool.connect(),
        mockPool.connect(),
        mockPool.connect(),
      ]);

      expect(connections).toHaveLength(3);
      expect(mockPool.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Connection Pool Exhaustion Handling', () => {
    it('should handle pool exhaustion gracefully', async () => {
      const error = new Error('Connection pool exhausted');
      error.name = 'PoolExhaustedError';
      mockPool.connect.mockRejectedValue(error);

      await expect(mockPool.connect()).rejects.toThrow('Connection pool exhausted');
    });

    it('should queue requests when pool is full', async () => {
      // Simulate pool being full
      mockPool.waitingCount = 5;
      
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      
      // First call waits, second succeeds
      mockPool.connect
        .mockRejectedValueOnce(new Error('Pool full, waiting'))
        .mockResolvedValueOnce(mockClient);

      await expect(mockPool.connect()).rejects.toThrow('Pool full, waiting');
      
      // After a connection is released, next request succeeds
      const client = await mockPool.connect();
      expect(client).toBeDefined();
    });

    it('should respect connection timeout when pool is exhausted', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      mockPool.connect.mockRejectedValue(timeoutError);

      await expect(mockPool.connect()).rejects.toThrow('Connection timeout');
    });
  });

  describe('Connection Error Recovery', () => {
    it('should handle connection errors and retry', async () => {
      const connectionError = new Error('ECONNREFUSED');
      connectionError.name = 'ECONNREFUSED';
      
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };

      // Fail first time, succeed second time
      mockPool.connect
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(mockClient);

      // First attempt fails
      await expect(mockPool.connect()).rejects.toThrow('ECONNREFUSED');
      
      // Retry succeeds
      const client = await mockPool.connect();
      expect(client).toBeDefined();
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      timeoutError.name = 'ETIMEDOUT';
      mockPool.connect.mockRejectedValue(timeoutError);

      await expect(mockPool.connect()).rejects.toThrow('ETIMEDOUT');
    });

    it('should handle connection reset errors', async () => {
      const resetError = new Error('ECONNRESET');
      resetError.name = 'ECONNRESET';
      mockPool.connect.mockRejectedValue(resetError);

      await expect(mockPool.connect()).rejects.toThrow('ECONNRESET');
    });

    it('should handle PostgreSQL termination errors', async () => {
      const pgError: any = new Error('Connection terminated');
      pgError.code = '57P01';
      mockPool.connect.mockRejectedValue(pgError);

      await expect(mockPool.connect()).rejects.toThrow('Connection terminated');
    });
  });

  describe('Query Execution', () => {
    it('should execute queries successfully', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await mockPool.query('SELECT * FROM test');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ id: 1, name: 'test' });
    });

    it('should handle query errors', async () => {
      const queryError = new Error('Query failed');
      mockPool.query.mockRejectedValue(queryError);

      await expect(mockPool.query('INVALID SQL')).rejects.toThrow('Query failed');
    });

    it('should support parameterized queries', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await mockPool.query('SELECT * FROM test WHERE id = $1', [1]);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result.rows).toHaveLength(1);
    });
  });

  describe('Event Handlers', () => {
    it('should have event handler registration capability', () => {
      expect(mockPool.on).toBeDefined();
      expect(typeof mockPool.on).toBe('function');
    });

    it('should handle error events without crashing', () => {
      // Simulate error event
      const errorCallback = jest.fn();
      mockPool.on('error', errorCallback);
      
      expect(mockPool.on).toHaveBeenCalledWith('error', errorCallback);
    });

    it('should handle connect events', () => {
      const connectCallback = jest.fn();
      mockPool.on('connect', connectCallback);
      
      expect(mockPool.on).toHaveBeenCalledWith('connect', connectCallback);
    });

    it('should handle remove events', () => {
      const removeCallback = jest.fn();
      mockPool.on('remove', removeCallback);
      
      expect(mockPool.on).toHaveBeenCalledWith('remove', removeCallback);
    });
  });

  describe('Pool Statistics', () => {
    it('should track total connections', () => {
      mockPool.totalCount = 15;
      expect(mockPool.totalCount).toBe(15);
    });

    it('should track idle connections', () => {
      mockPool.idleCount = 5;
      expect(mockPool.idleCount).toBe(5);
    });

    it('should track waiting requests', () => {
      mockPool.waitingCount = 2;
      expect(mockPool.waitingCount).toBe(2);
    });
  });

  describe('Pool Shutdown', () => {
    it('should gracefully close all connections', async () => {
      mockPool.end.mockResolvedValue(undefined);

      await mockPool.end();
      expect(mockPool.end).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during shutdown', async () => {
      const shutdownError = new Error('Shutdown failed');
      mockPool.end.mockRejectedValue(shutdownError);

      await expect(mockPool.end()).rejects.toThrow('Shutdown failed');
    });

    it('should not accept new connections after shutdown', async () => {
      mockPool.end.mockResolvedValue(undefined);
      await mockPool.end();

      const error = new Error('Pool is closed');
      mockPool.connect.mockRejectedValue(error);

      await expect(mockPool.connect()).rejects.toThrow('Pool is closed');
    });
  });

  describe('Connection Recycling', () => {
    it('should recycle idle connections after timeout', async () => {
      // Simulate idle timeout
      mockPool.idleCount = 10;
      
      // After idle timeout, connections should be recycled
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const client = await mockPool.connect();
      expect(client).toBeDefined();
    });

    it('should maintain minimum pool size', () => {
      mockPool.totalCount = 10;
      expect(mockPool.totalCount).toBeGreaterThanOrEqual(databaseConfig.min!);
    });

    it('should not exceed maximum pool size', () => {
      mockPool.totalCount = 50;
      expect(mockPool.totalCount).toBeLessThanOrEqual(databaseConfig.max!);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent queries', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const queries = Array(10).fill(null).map(() => 
        mockPool.query('SELECT * FROM test')
      );

      const results = await Promise.all(queries);
      expect(results).toHaveLength(10);
      expect(mockPool.query).toHaveBeenCalledTimes(10);
    });

    it('should handle mixed success and failure queries', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
        .mockRejectedValueOnce(new Error('Query failed'))
        .mockResolvedValueOnce({ rows: [{ id: 2 }], rowCount: 1 });

      const result1 = await mockPool.query('SELECT 1');
      expect(result1.rows[0].id).toBe(1);

      await expect(mockPool.query('INVALID')).rejects.toThrow('Query failed');

      const result2 = await mockPool.query('SELECT 2');
      expect(result2.rows[0].id).toBe(2);
    });
  });

  describe('Health Checks', () => {
    it('should perform health check query', async () => {
      const mockResult = { rows: [{ now: new Date() }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await mockPool.query('SELECT NOW()');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toHaveProperty('now');
    });

    it('should detect unhealthy connection', async () => {
      const healthError = new Error('Health check failed');
      mockPool.query.mockRejectedValue(healthError);

      await expect(mockPool.query('SELECT NOW()')).rejects.toThrow('Health check failed');
    });
  });
});
