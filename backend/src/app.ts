import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { initializeDatabase, closeDatabase } from './data-source';
import { config, validateEnvironment } from './config/environment';

// Import routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import opportunityRoutes from './routes/opportunities';
import activityRoutes from './routes/activities';
import interactionRoutes from './routes/interactions';
import dashboardRoutes from './routes/dashboard';

// Validate environment variables
validateEnvironment();

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting with enhanced configuration
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost during development
        if (config.nodeEnv === 'development') {
            const isLocalhost = req.ip === '127.0.0.1' || 
                               req.ip === '::1' || 
                               req.ip === '::ffff:127.0.0.1' ||
                               req.connection?.remoteAddress === '127.0.0.1' ||
                               req.connection?.remoteAddress === '::1';
            return isLocalhost;
        }
        return false;
    },
    message: {
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60) + ' minutes'
    }
});

app.use(limiter);

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint (before authentication)
app.get('/api/health', async (req, res) => {
    try {
        // Quick database connectivity check
        const { AppDataSource } = await import('./data-source');
        const isConnected = AppDataSource.isInitialized;
        
        const healthStatus = {
            status: isConnected ? 'OK' : 'ERROR',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: config.nodeEnv,
            database: {
                connected: isConnected,
                type: 'PostgreSQL',
                host: config.database.host,
                port: config.database.port,
                database: config.database.name
            },
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid
        };
        
        res.status(isConnected ? 200 : 503).json(healthStatus);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'CRM PostgreSQL API Server',
        version: '2.0.0',
        environment: config.nodeEnv,
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            customers: '/api/customers',
            opportunities: '/api/opportunities',
            activities: '/api/activities',
            interactions: '/api/interactions',
            dashboard: '/api/dashboard'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Global error handler:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ 
            message: 'Invalid JSON payload',
            error: 'INVALID_JSON'
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: err.errors
        });
    }
    
    if (err.name === 'QueryFailedError') {
        return res.status(500).json({
            message: 'Database query failed',
            error: 'DATABASE_ERROR',
            details: config.nodeEnv === 'development' ? err.message : undefined
        });
    }
    
    // Default error response
    res.status(err.status || 500).json({ 
        message: err.message || 'Internal server error',
        error: 'INTERNAL_ERROR',
        details: config.nodeEnv === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });
});

// Create default admin user
async function createDefaultAdmin() {
    try {
        const { User, UserRole } = await import('./entity/User');
        const { AppDataSource } = await import('./data-source');
        const bcrypt = await import('bcryptjs');
        
        const userRepository = AppDataSource.getRepository(User);
        const adminExists = await userRepository.findOne({ 
            where: { email: 'admin@crm.local' } 
        });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            const admin = new User();
            admin.email = 'admin@crm.local';
            admin.password = hashedPassword;
            admin.name = 'CRM Administrator';
            admin.role = 'admin';
            admin.isActive = true;
            
            await userRepository.save(admin);
            console.log('✅ Default admin user created:');
            console.log('   📧 Email: admin@crm.local');
            console.log('   🔑 Password: admin123');
            console.log('   ⚠️  Please change the default password in production!');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating default admin user:', error);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Database initialization and server startup
async function startServer() {
    try {
        // Initialize database connection
        await initializeDatabase();
        
        // Create default admin user
        await createDefaultAdmin();
        
        // Start HTTP server
        const server = app.listen(config.port, '0.0.0.0', () => {
            console.log('\n🚀 CRM PostgreSQL Server Started Successfully!');
            console.log(`📡 Server listening on port ${config.port}`);
            console.log(`🌍 Environment: ${config.nodeEnv}`);
            console.log(`🗄️  Database: ${config.database.name} on ${config.database.host}:${config.database.port}`);
            console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
            console.log(`📖 API Documentation: http://localhost:${config.port}/`);
            
            if (config.nodeEnv === 'development') {
                console.log('\n🔧 Development Features:');
                console.log('   • Enhanced error logging');
                console.log('   • Rate limiting bypass for localhost');
                console.log('   • Database query logging');
                console.log('   • CORS enabled for development origins');
            }
        });
        
        // Graceful shutdown handler
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n🛑 ${signal} received, starting graceful shutdown...`);
            server.close(async () => {
                console.log('📡 HTTP server closed');
                await closeDatabase();
                console.log('🏁 Graceful shutdown completed');
                process.exit(0);
            });
        };
        
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
    } catch (error) {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
if (require.main === module) {
    startServer();
}

export default app;
export { startServer };