import { AppDataSource } from '../data-source';
import logger from './logger';

export class DatabaseHelper {
  /**
   * Check if database connection is healthy
   */
  static async checkConnection(): Promise<boolean> {
    try {
      if (!AppDataSource.isInitialized) {
        return false;
      }
      
      // Simple query to test connection
      await AppDataSource.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<any> {
    try {
      const stats = await AppDataSource.query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        LIMIT 10
      `);
      
      return stats;
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Get connection pool status
   */
  static getConnectionPoolStatus(): any {
    try {
      const driver = AppDataSource.driver as any;
      if (driver.master) {
        return {
          totalConnections: driver.master.totalCount,
          idleConnections: driver.master.idleCount,
          waitingCount: driver.master.waitingCount
        };
      }
      return null;
    } catch (error) {
      logger.error('Failed to get connection pool status:', error);
      return null;
    }
  }

  /**
   * Execute raw query safely
   */
  static async executeQuery(query: string, parameters?: any[]): Promise<any> {
    try {
      return await AppDataSource.query(query, parameters);
    } catch (error) {
      logger.error('Query execution failed:', { query, error });
      throw error;
    }
  }

  /**
   * Start a transaction
   */
  static async transaction<T>(operation: (manager: any) => Promise<T>): Promise<T> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}