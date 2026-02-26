/**
 * Unit tests for database connection exports
 * Task 2.2: Write unit tests for database connection pool
 * Requirements: 22.10
 */

describe('Database Connection Exports', () => {
  it('should export db instance', () => {
    const { db } = require('../../../src/database/connection');
    expect(db).toBeDefined();
    expect(db.getPool).toBeDefined();
    expect(db.query).toBeDefined();
    expect(db.testConnection).toBeDefined();
  });

  it('should export databaseConfig', () => {
    const { databaseConfig } = require('../../../src/database/connection');
    expect(databaseConfig).toBeDefined();
    expect(databaseConfig).toHaveProperty('min');
    expect(databaseConfig).toHaveProperty('max');
  });
});
