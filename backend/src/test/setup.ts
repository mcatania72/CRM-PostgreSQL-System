import { AppDataSource } from '../data-source';
import { config } from '../config/environment';

// Test database configuration
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'crm_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '4002';
process.env.JWT_SECRET = 'test-secret-key';

// Setup and teardown for tests
beforeAll(async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        // Clear database before tests
        await AppDataSource.synchronize(true);
        
    } catch (error) {
        console.error('Test setup failed:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    } catch (error) {
        console.error('Test teardown failed:', error);
    }
});

// Clear data between tests
afterEach(async () => {
    try {
        const entities = AppDataSource.entityMetadatas;
        const tableNames = entities.map(entity => `"${entity.tableName}"`);
        
        // Disable foreign key constraints
        await AppDataSource.query('SET session_replication_role = replica;');
        
        // Clear all tables
        for (const tableName of tableNames) {
            await AppDataSource.query(`DELETE FROM ${tableName};`);
        }
        
        // Re-enable foreign key constraints
        await AppDataSource.query('SET session_replication_role = DEFAULT;');
        
    } catch (error) {
        console.error('Test cleanup failed:', error);
    }
});

// Global test timeout
jest.setTimeout(30000);