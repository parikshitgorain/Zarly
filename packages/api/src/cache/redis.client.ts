/**
 * Redis Client with Connection Handling
 * Task 3.1: Create Redis client with connection handling
 * Requirements: 18.6, 21.1
 * Compliance: PROJECT_MASTER_LOCK.md Section 6 (Redis Rules)
 * 
 * Features:
 * - Connection pooling
 * - Error handling and reconnection logic
 * - Health check functionality
 * - Graceful degradation when Redis is unavailable
 */

import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis client configuration
 */
export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  
  // Connection pooling
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Reconnection strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Connection timeout
  connectTimeout: 10000,
  
  // Keep-alive
  keepAlive: 30000,
  
  // Lazy connect - don't connect until first command
  lazyConnect: false,
};

/**
 * Redis Client with connection management
 */
class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

  private constructor() {
    this.client = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  /**
   * Get singleton instance of Redis client
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Setup event handlers for Redis connection
   */
  private setupEventHandlers(): void {
    // Connection successful
    this.client.on('connect', () => {
      this.isConnecting = true;
      console.log('Redis client connecting...');
    });

    // Ready to accept commands
    this.client.on('ready', () => {
      this.isConnected = true;
      this.isConnecting = false;
      console.log('Redis client ready');
    });

    // Connection error
    this.client.on('error', (err: Error) => {
      console.error('Redis client error:', err.message);
      // Don't exit the process - graceful degradation per Requirement 21.1
    });

    // Connection closed
    this.client.on('close', () => {
      this.isConnected = false;
      console.log('Redis connection closed');
    });

    // Reconnecting
    this.client.on('reconnecting', (delay: number) => {
      this.isConnecting = true;
      console.log(`Redis client reconnecting in ${delay}ms...`);
    });

    // Connection ended
    this.client.on('end', () => {
      this.isConnected = false;
      this.isConnecting = false;
      console.log('Redis connection ended');
    });
  }

  /**
   * Get the Redis client instance
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Check if Redis is connected and ready
   */
  public isReady(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  /**
   * Check if Redis is currently connecting
   */
  public isAttemptingConnection(): boolean {
    return this.isConnecting;
  }

  /**
   * Test Redis connection with a ping
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      this.isConnected = result === 'PONG';
      return this.isConnected;
    } catch (error) {
      console.error('Redis connection test failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Health check for Redis connection
   * Returns detailed health status
   */
  public async healthCheck(): Promise<{
    isHealthy: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    status: string;
    latency?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const pingResult = await this.client.ping();
      const latency = Date.now() - startTime;
      
      return {
        isHealthy: pingResult === 'PONG',
        isConnected: this.isConnected,
        isConnecting: this.isConnecting,
        status: this.client.status,
        latency,
      };
    } catch (error) {
      return {
        isHealthy: false,
        isConnected: this.isConnected,
        isConnecting: this.isConnecting,
        status: this.client.status,
      };
    }
  }

  /**
   * Get Redis server info
   */
  public async getInfo(): Promise<string | null> {
    try {
      return await this.client.info();
    } catch (error) {
      console.error('Failed to get Redis info:', error);
      return null;
    }
  }

  /**
   * Get number of keys in current database
   */
  public async getKeyCount(): Promise<number> {
    try {
      return await this.client.dbsize();
    } catch (error) {
      console.error('Failed to get Redis key count:', error);
      return 0;
    }
  }

  /**
   * Gracefully close Redis connection
   */
  public async close(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis connection closed gracefully');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
      // Force disconnect if graceful close fails
      this.client.disconnect();
      throw error;
    }
  }

  /**
   * Force disconnect (for emergency situations)
   */
  public disconnect(): void {
    this.client.disconnect();
    this.isConnected = false;
    console.log('Redis connection forcefully disconnected');
  }
}

// Export singleton instance
export const redisClient = RedisClient.getInstance();
export default redisClient;
