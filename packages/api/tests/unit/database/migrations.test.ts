/**
 * Unit tests for database migration files
 * Task 2.9: Write migration rollback tests
 * Requirements: 20.2, 20.10
 * Compliance: PROJECT_MASTER_LOCK.md Section 3 (Testing Enforcement) - 90%+ coverage
 * 
 * These tests verify:
 * - Migration files exist and are properly paired (up/down)
 * - Migration SQL syntax is valid
 * - Migration files follow naming conventions
 * - Rollback migrations properly reverse forward migrations
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Database Migration Files', () => {
  const migrationsPath = path.join(__dirname, '../../../src/database/migrations');

  const expectedMigrations = [
    '001_initial_schema',
    '002_moderation_tables',
    '003_giveaway_tables',
    '004_xp_tables',
    '005_feature_tables',
    '006_component_role_tables',
  ];

  describe('Migration File Structure', () => {
    it('should have migrations directory', () => {
      expect(fs.existsSync(migrationsPath)).toBe(true);
      expect(fs.statSync(migrationsPath).isDirectory()).toBe(true);
    });

    it('should have all expected migration files', () => {
      const files = fs.readdirSync(migrationsPath);
      
      expectedMigrations.forEach(migration => {
        expect(files).toContain(`${migration}.up.sql`);
        expect(files).toContain(`${migration}.down.sql`);
      });
    });

    it('should have paired up and down migrations for each version', () => {
      expectedMigrations.forEach(migration => {
        const upFile = path.join(migrationsPath, `${migration}.up.sql`);
        const downFile = path.join(migrationsPath, `${migration}.down.sql`);

        expect(fs.existsSync(upFile)).toBe(true);
        expect(fs.existsSync(downFile)).toBe(true);
      });
    });

    it('should follow sequential numbering convention', () => {
      const files = fs.readdirSync(migrationsPath);
      const migrationNumbers = files
        .filter(f => f.endsWith('.up.sql'))
        .map(f => parseInt(f.split('_')[0]))
        .sort((a, b) => a - b);

      // Check sequential numbering
      for (let i = 0; i < migrationNumbers.length; i++) {
        expect(migrationNumbers[i]).toBe(i + 1);
      }
    });
  });

  describe('Migration 001: Initial Schema', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '001_initial_schema.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '001_initial_schema.down.sql'),
        'utf8'
      );
    });

    it('should create guilds table in up migration', () => {
      expect(upContent).toContain('CREATE TABLE guilds');
      expect(upContent).toContain('guild_id');
      expect(upContent).toContain('premium_tier');
    });

    it('should create guild_configs table in up migration', () => {
      expect(upContent).toContain('CREATE TABLE guild_configs');
      expect(upContent).toContain('log_channel_id');
      expect(upContent).toContain('automod_enabled');
    });

    it('should create schema_migrations table in up migration', () => {
      expect(upContent).toContain('CREATE TABLE');
      expect(upContent).toContain('schema_migrations');
      expect(upContent).toContain('version');
      expect(upContent).toContain('applied_at');
    });

    it('should drop tables in down migration', () => {
      expect(downContent).toContain('DROP TABLE');
      expect(downContent).toContain('guilds');
      expect(downContent).toContain('guild_configs');
      expect(downContent).toContain('schema_migrations');
    });

    it('should use IF EXISTS in down migration for idempotency', () => {
      expect(downContent).toContain('IF EXISTS');
    });
  });

  describe('Migration 002: Moderation Tables', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '002_moderation_tables.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '002_moderation_tables.down.sql'),
        'utf8'
      );
    });

    it('should create moderation_cases table', () => {
      expect(upContent).toContain('CREATE TABLE moderation_cases');
      expect(upContent).toContain('case_id');
      expect(upContent).toContain('guild_id');
      expect(upContent).toContain('user_id');
      expect(upContent).toContain('moderator_id');
      expect(upContent).toContain('action_type');
    });

    it('should have foreign key to guilds table', () => {
      expect(upContent).toContain('REFERENCES guilds');
    });

    it('should create indexes for performance', () => {
      expect(upContent).toContain('CREATE INDEX');
      expect(upContent.match(/CREATE INDEX/g)?.length).toBeGreaterThanOrEqual(2);
    });

    it('should drop moderation_cases table in down migration', () => {
      expect(downContent).toContain('DROP TABLE');
      expect(downContent).toContain('moderation_cases');
      expect(downContent).toContain('IF EXISTS');
    });
  });

  describe('Migration 003: Giveaway Tables', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '003_giveaway_tables.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '003_giveaway_tables.down.sql'),
        'utf8'
      );
    });

    it('should create giveaways table', () => {
      expect(upContent).toContain('CREATE TABLE giveaways');
      expect(upContent).toContain('giveaway_id');
      expect(upContent).toContain('prize');
      expect(upContent).toContain('winner_user_id');
    });

    it('should create giveaway_entries table', () => {
      expect(upContent).toContain('CREATE TABLE giveaway_entries');
      expect(upContent).toContain('giveaway_id');
      expect(upContent).toContain('user_id');
    });

    it('should have unique constraint on entries', () => {
      expect(upContent).toContain('UNIQUE');
      expect(upContent).toContain('giveaway_id');
      expect(upContent).toContain('user_id');
    });

    it('should drop both tables in down migration', () => {
      expect(downContent).toContain('giveaway_entries');
      expect(downContent).toContain('giveaways');
    });
  });

  describe('Migration 004: XP Tables', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '004_xp_tables.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '004_xp_tables.down.sql'),
        'utf8'
      );
    });

    it('should create user_xp table', () => {
      expect(upContent).toContain('CREATE TABLE user_xp');
      expect(upContent).toContain('guild_id');
      expect(upContent).toContain('user_id');
      expect(upContent).toContain('text_xp');
      expect(upContent).toContain('voice_xp');
      expect(upContent).toContain('total_xp');
    });

    it('should have index for leaderboard queries', () => {
      expect(upContent).toContain('CREATE INDEX');
      expect(upContent).toContain('total_xp');
    });

    it('should drop user_xp table in down migration', () => {
      expect(downContent).toContain('DROP TABLE');
      expect(downContent).toContain('user_xp');
    });
  });

  describe('Migration 005: Feature Tables', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '005_feature_tables.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '005_feature_tables.down.sql'),
        'utf8'
      );
    });

    it('should create tickets table', () => {
      expect(upContent).toContain('CREATE TABLE tickets');
    });

    it('should create ticket_transcripts table', () => {
      expect(upContent).toContain('CREATE TABLE ticket_transcripts');
    });

    it('should create scheduled_messages table', () => {
      expect(upContent).toContain('CREATE TABLE scheduled_messages');
    });

    it('should create reminders table', () => {
      expect(upContent).toContain('CREATE TABLE reminders');
    });

    it('should create triggers table', () => {
      expect(upContent).toContain('CREATE TABLE triggers');
    });

    it('should create streamers table', () => {
      expect(upContent).toContain('CREATE TABLE streamers');
    });

    it('should create ai_knowledge_base table', () => {
      expect(upContent).toContain('CREATE TABLE ai_knowledge_base');
    });

    it('should create event_logs table', () => {
      expect(upContent).toContain('CREATE TABLE event_logs');
    });

    it('should drop all tables in down migration', () => {
      const tables = [
        'tickets',
        'ticket_transcripts',
        'scheduled_messages',
        'reminders',
        'triggers',
        'streamers',
        'ai_knowledge_base',
        'event_logs',
      ];

      tables.forEach(table => {
        expect(downContent).toContain(table);
      });
    });
  });

  describe('Migration 006: Component Role and Premium Tables', () => {
    let upContent: string;
    let downContent: string;

    beforeAll(() => {
      upContent = fs.readFileSync(
        path.join(migrationsPath, '006_component_role_tables.up.sql'),
        'utf8'
      );
      downContent = fs.readFileSync(
        path.join(migrationsPath, '006_component_role_tables.down.sql'),
        'utf8'
      );
    });

    it('should create component_role_panels table', () => {
      expect(upContent).toContain('CREATE TABLE component_role_panels');
    });

    it('should create component_roles table', () => {
      expect(upContent).toContain('CREATE TABLE component_roles');
    });

    it('should create timed_roles table', () => {
      expect(upContent).toContain('CREATE TABLE timed_roles');
    });

    it('should create embed_themes table', () => {
      expect(upContent).toContain('CREATE TABLE embed_themes');
    });

    it('should create automation_workflows table', () => {
      expect(upContent).toContain('CREATE TABLE automation_workflows');
    });

    it('should create automation_stages table', () => {
      expect(upContent).toContain('CREATE TABLE automation_stages');
    });

    it('should drop all tables in down migration', () => {
      const tables = [
        'component_role_panels',
        'component_roles',
        'timed_roles',
        'embed_themes',
        'automation_workflows',
        'automation_stages',
      ];

      tables.forEach(table => {
        expect(downContent).toContain(table);
      });
    });
  });

  describe('Migration SQL Syntax Validation', () => {
    it('should have valid SQL syntax in all up migrations', () => {
      expectedMigrations.forEach(migration => {
        const content = fs.readFileSync(
          path.join(migrationsPath, `${migration}.up.sql`),
          'utf8'
        );

        // Basic SQL syntax checks
        expect(content).not.toContain('CREAT TABLE'); // Common typo
        expect(content).not.toContain('PRIMAY KEY'); // Common typo
        expect(content).not.toContain('FORIEGN KEY'); // Common typo
        
        // Should have proper statement terminators
        expect(content).toContain(';');
      });
    });

    it('should have valid SQL syntax in all down migrations', () => {
      expectedMigrations.forEach(migration => {
        const content = fs.readFileSync(
          path.join(migrationsPath, `${migration}.down.sql`),
          'utf8'
        );

        // Basic SQL syntax checks
        expect(content).not.toContain('DORP TABLE'); // Common typo
        
        // Should have proper statement terminators
        expect(content).toContain(';');
      });
    });
  });

  describe('Migration Rollback Safety', () => {
    it('should use IF EXISTS in all down migrations for idempotency', () => {
      expectedMigrations.forEach(migration => {
        const content = fs.readFileSync(
          path.join(migrationsPath, `${migration}.down.sql`),
          'utf8'
        );

        expect(content).toContain('IF EXISTS');
      });
    });

    it('should drop dependent tables before parent tables', () => {
      // Check migration 003 - entries should be dropped before giveaways
      const content = fs.readFileSync(
        path.join(migrationsPath, '003_giveaway_tables.down.sql'),
        'utf8'
      );

      const entriesIndex = content.indexOf('giveaway_entries');
      const giveawaysIndex = content.lastIndexOf('giveaways');
      
      if (entriesIndex !== -1 && giveawaysIndex !== -1) {
        expect(entriesIndex).toBeLessThan(giveawaysIndex);
      }
    });
  });

  describe('Migration Version Tracking', () => {
    it('should have schema_migrations table in initial migration', () => {
      const content = fs.readFileSync(
        path.join(migrationsPath, '001_initial_schema.up.sql'),
        'utf8'
      );

      expect(content).toContain('schema_migrations');
      expect(content).toContain('version');
      expect(content).toContain('applied_at');
      expect(content).toContain('PRIMARY KEY');
    });

    it('should have version as primary key to prevent duplicates', () => {
      const content = fs.readFileSync(
        path.join(migrationsPath, '001_initial_schema.up.sql'),
        'utf8'
      );

      // Check that version is the primary key
      const schemaTableSection = content.substring(
        content.indexOf('CREATE TABLE schema_migrations'),
        content.indexOf(');', content.indexOf('CREATE TABLE schema_migrations'))
      );

      expect(schemaTableSection).toContain('version');
      expect(schemaTableSection).toContain('PRIMARY KEY');
    });
  });

  describe('Migration File Completeness', () => {
    it('should have non-empty up migration files', () => {
      expectedMigrations.forEach(migration => {
        const content = fs.readFileSync(
          path.join(migrationsPath, `${migration}.up.sql`),
          'utf8'
        );

        expect(content.trim().length).toBeGreaterThan(0);
        expect(content).toContain('CREATE TABLE');
      });
    });

    it('should have non-empty down migration files', () => {
      expectedMigrations.forEach(migration => {
        const content = fs.readFileSync(
          path.join(migrationsPath, `${migration}.down.sql`),
          'utf8'
        );

        expect(content.trim().length).toBeGreaterThan(0);
        expect(content).toContain('DROP TABLE');
      });
    });

    it('should have matching table counts in up and down migrations', () => {
      expectedMigrations.forEach(migration => {
        const upContent = fs.readFileSync(
          path.join(migrationsPath, `${migration}.up.sql`),
          'utf8'
        );
        const downContent = fs.readFileSync(
          path.join(migrationsPath, `${migration}.down.sql`),
          'utf8'
        );

        const upTableCount = (upContent.match(/CREATE TABLE/g) || []).length;
        const downTableCount = (downContent.match(/DROP TABLE/g) || []).length;

        expect(upTableCount).toBe(downTableCount);
      });
    });
  });
});
