import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Customer } from "./entity/Customer";
import { Opportunity } from "./entity/Opportunity";
import { Activity } from "./entity/Activity";
import { Interaction } from "./entity/Interaction";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "4002"),
    username: process.env.DB_USER || "crm_user",
    password: process.env.DB_PASSWORD || "crm_password_secure_2024",
    database: process.env.DB_NAME || "crm_db",
    synchronize: process.env.NODE_ENV === "development", // Only in development
    logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    entities: [User, Customer, Opportunity, Activity, Interaction],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connectTimeoutMS: 20000,
    maxQueryExecutionTime: 5000,
    extra: {
        // Connection pool settings
        max: 20,
        min: 2,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
    },
});

// Connection wrapper with retry logic
export const initializeDatabase = async (): Promise<void> => {
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔗 Attempting database connection (attempt ${attempt}/${maxRetries})...`);
            
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            
            console.log("✅ Database connection established successfully!");
            console.log(`📊 Connected to: ${AppDataSource.options.database} on ${AppDataSource.options.host}:${AppDataSource.options.port}`);
            return;
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt} failed:`, error);
            
            if (attempt === maxRetries) {
                console.error(`🚨 Failed to connect to database after ${maxRetries} attempts`);
                throw new Error(`Database connection failed: ${error}`);
            }
            
            console.log(`⏳ Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("📊 Database connection closed successfully");
        }
    } catch (error) {
        console.error("❌ Error closing database connection:", error);
    }
};