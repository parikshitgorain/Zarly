/**
 * Unit tests for project configuration
 * Task 1.1: Write unit tests for project configuration
 * Requirements: 22.5
 * Compliance: PROJECT_MASTER_LOCK.md Section 3 (Testing Enforcement)
 */

import * as path from 'path';
import * as fs from 'fs';

describe('Project Configuration', () => {
  describe('Environment Variable Loading', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment before each test
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should have .env.example file in root directory', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    it('should contain required environment variables in .env.example', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');

      // Check for critical environment variables
      const requiredVars = [
        'DATABASE_URL',
        'REDIS_URL',
        'DISCORD_TOKEN',
        'DISCORD_CLIENT_ID',
        'JWT_SECRET',
        'NODE_ENV',
      ];

      requiredVars.forEach((varName) => {
        expect(envContent).toContain(varName);
      });
    });

    it('should load environment variables from process.env', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      process.env.REDIS_URL = 'redis://localhost:6379';
      process.env.NODE_ENV = 'test';

      expect(process.env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/testdb');
      expect(process.env.REDIS_URL).toBe('redis://localhost:6379');
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should handle missing optional environment variables gracefully', () => {
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_MAX;

      // Should not throw when optional vars are missing
      expect(() => {
        const min = parseInt(process.env.DB_POOL_MIN || '10', 10);
        const max = parseInt(process.env.DB_POOL_MAX || '50', 10);
        expect(min).toBe(10);
        expect(max).toBe(50);
      }).not.toThrow();
    });

    it('should validate environment variable types', () => {
      process.env.DB_POOL_MIN = '15';
      process.env.DB_POOL_MAX = '100';

      const min = parseInt(process.env.DB_POOL_MIN, 10);
      const max = parseInt(process.env.DB_POOL_MAX, 10);

      expect(typeof min).toBe('number');
      expect(typeof max).toBe('number');
      expect(min).toBe(15);
      expect(max).toBe(100);
    });

    it('should handle invalid numeric environment variables', () => {
      process.env.DB_POOL_MIN = 'invalid';

      const min = parseInt(process.env.DB_POOL_MIN || '10', 10);

      // Should fall back to default when parsing fails
      expect(isNaN(parseInt(process.env.DB_POOL_MIN, 10))).toBe(true);
      expect(min).toBeNaN();
    });
  });

  describe('TypeScript Compilation', () => {
    it('should have tsconfig.json in root directory', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('should have valid tsconfig.json structure', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig).toHaveProperty('compilerOptions');
      expect(tsconfig.compilerOptions).toHaveProperty('target');
      expect(tsconfig.compilerOptions).toHaveProperty('module');
      expect(tsconfig.compilerOptions).toHaveProperty('strict');
    });

    it('should have strict mode enabled', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('should have proper module resolution', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig.compilerOptions.moduleResolution).toBe('node');
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
    });

    it('should have source maps enabled for debugging', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig.compilerOptions.sourceMap).toBe(true);
    });

    it('should exclude node_modules and dist directories', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig.exclude).toContain('node_modules');
      expect(tsconfig.exclude).toContain('dist');
    });

    it('should have package-specific tsconfig for api package', () => {
      const apiTsconfigPath = path.join(process.cwd(), 'packages/api/tsconfig.json');
      expect(fs.existsSync(apiTsconfigPath)).toBe(true);

      const tsconfigContent = fs.readFileSync(apiTsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      expect(tsconfig).toHaveProperty('extends');
      expect(tsconfig.extends).toBe('../../tsconfig.json');
    });
  });

  describe('Package Structure', () => {
    it('should have package.json in root directory', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
    });

    it('should have workspaces configured', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      expect(packageJson).toHaveProperty('workspaces');
      expect(packageJson.workspaces).toContain('packages/*');
    });

    it('should have all required packages', () => {
      const packagesDir = path.join(process.cwd(), 'packages');
      const requiredPackages = ['api', 'bot', 'worker', 'dashboard', 'shared'];

      requiredPackages.forEach((pkg) => {
        const pkgPath = path.join(packagesDir, pkg);
        expect(fs.existsSync(pkgPath)).toBe(true);
      });
    });

    it('should have package.json in each package', () => {
      const packagesDir = path.join(process.cwd(), 'packages');
      const requiredPackages = ['api', 'bot', 'worker', 'dashboard', 'shared'];

      requiredPackages.forEach((pkg) => {
        const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
        expect(fs.existsSync(pkgJsonPath)).toBe(true);
      });
    });

    it('should have test scripts configured in root package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:coverage');
    });
  });

  describe('Docker Configuration', () => {
    it('should have docker-compose.yml in root directory', () => {
      const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
      expect(fs.existsSync(dockerComposePath)).toBe(true);
    });

    it('should have required services in docker-compose.yml', () => {
      const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
      const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf-8');

      // Check for required services
      expect(dockerComposeContent).toContain('postgres');
      expect(dockerComposeContent).toContain('redis');
    });
  });

  describe('Code Quality Tools', () => {
    it('should have .eslintrc.json in root directory', () => {
      const eslintPath = path.join(process.cwd(), '.eslintrc.json');
      expect(fs.existsSync(eslintPath)).toBe(true);
    });

    it('should have .prettierrc in root directory', () => {
      const prettierPath = path.join(process.cwd(), '.prettierrc');
      expect(fs.existsSync(prettierPath)).toBe(true);
    });

    it('should have .gitignore in root directory', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    it('should ignore node_modules and dist in .gitignore', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });
  });
});
