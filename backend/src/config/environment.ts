import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
    // Server Configuration
    port: parseInt(process.env.PORT || "4001"),
    nodeEnv: process.env.NODE_ENV || "development",
    
    // Database Configuration
    database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "4002"),
        name: process.env.DB_NAME || "crm_db",
        user: process.env.DB_USER || "crm_user",
        password: process.env.DB_PASSWORD || "crm_password_secure_2024",
        
        // Connection Pool Settings
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || "20"),
            min: parseInt(process.env.DB_POOL_MIN || "2"),
            acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || "30000"),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
        }
    },
    
    // Security Configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [
            "http://localhost:4000",
            "http://localhost:3000",
            "http://127.0.0.1:4000",
            "http://127.0.0.1:3000"
        ],
        credentials: true,
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || "info",
        format: process.env.LOG_FORMAT || "combined",
    },
    
    // Health Check
    healthCheck: {
        interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || "30000"), // 30 seconds
        timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000"), // 5 seconds
    }
};

// Validate required environment variables
export const validateEnvironment = (): void => {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
        console.warn('🔧 Using default values for development');
    }
    
    if (config.nodeEnv === 'production' && missing.length > 0) {
        throw new Error(`🚨 Missing required environment variables in production: ${missing.join(', ')}`);
    }
    
    console.log('✅ Environment configuration loaded successfully');
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🚀 Server will start on port: ${config.port}`);
    console.log(`🗄️  Database: ${config.database.name} on ${config.database.host}:${config.database.port}`);
};