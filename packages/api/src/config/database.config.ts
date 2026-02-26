import { Pool, PoolConfig } from 'pg';

/**
 * Database configuration with connection pooling
 * Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)
 */
export const databaseConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DB_POOL_MIN || '10', 10),
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Enable keep-alive to prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

/**
 * Create and configure PostgreSQL connection pool
 * Features:
 * - Connection pooling (min 10, max 50)
 * - Error handling and retry logic
 * - Connection recycling with idle timeout
 * - Health checks
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = new Pool(databaseConfig);
    this.setupEventHandlers();
  }

  /**
   * Get singleton instance of database connection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Setup event handlers for connection pool
   */
  private setupEventHandlers(): void {
    // Handle connection errors
    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit the process, let the pool handle reconnection
    });

    // Handle successful connections
    this.pool.on('connect', (client) => {
      this.isConnected = true;
      console.log('Database client connected');
    });

    // Handle connection removal
    this.pool.on('remove', (client) => {
      console.log('Database client removed from pool');
    });
  }

  /**
   * Get the connection pool
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      this.isConnected = false;
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Execute a query with automatic retry on connection failure
   */
  public async query(text: string, params?: any[], retries: number = 3): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.pool.query(text, params);
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`Query attempt ${attempt} failed:`, error.message);

        // If it's a connection error and we have retries left, wait and retry
        if (attempt < retries && this.isConnectionError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // If it's not a connection error or we're out of retries, throw
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if error is a connection-related error
   */
  private isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      '57P01', // PostgreSQL: terminating connection
      '57P03', // PostgreSQL: cannot connect now
    ];

    return (
      connectionErrorCodes.includes(error.code) ||
      error.message?.includes('Connection terminated') ||
      error.message?.includes('Connection refused')
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get connection status
   */
  public isHealthy(): boolean {
    return this.isConnected && this.pool.totalCount > 0;
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }

  /**
   * Gracefully close all connections
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();
export default db;
