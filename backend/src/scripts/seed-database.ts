import { AppDataSource, initializeDatabase } from '../data-source';
import { User } from '../entity/User';
import { Customer } from '../entity/Customer';
import { Opportunity } from '../entity/Opportunity';
import { Activity } from '../entity/Activity';
import { Interaction } from '../entity/Interaction';
import * as bcrypt from 'bcryptjs';

/**
 * Database Seeding Script for CRM PostgreSQL System
 * 
 * This script populates the database with initial data for development and testing.
 * Run with: npm run db:seed
 */

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Initialize database connection
        await initializeDatabase();
        
        // Clear existing data (optional - be careful in production!)
        if (process.env.NODE_ENV === 'development') {
            console.log('🧹 Clearing existing data...');
            await AppDataSource.query('TRUNCATE TABLE interaction, activity, opportunity, customer, "user" RESTART IDENTITY CASCADE');
        }
        
        // Create admin user
        console.log('👤 Creating admin user...');
        const userRepository = AppDataSource.getRepository(User);
        
        const adminUser = new User();
        adminUser.email = 'admin@crm.local';
        adminUser.name = 'CRM Administrator';
        adminUser.password = await bcrypt.hash('admin123', 10);
        adminUser.role = 'admin';
        adminUser.isActive = true;
        
        await userRepository.save(adminUser);
        console.log(`✅ Admin user created: ${adminUser.email}`);
        
        // Create demo user
        const demoUser = new User();
        demoUser.email = 'demo@crm.local';
        demoUser.name = 'Demo User';
        demoUser.password = await bcrypt.hash('demo123', 10);
        demoUser.role = 'user';
        demoUser.isActive = true;
        
        await userRepository.save(demoUser);
        console.log(`✅ Demo user created: ${demoUser.email}`);
        
        // Create sample customers
        console.log('🏢 Creating sample customers...');
        const customerRepository = AppDataSource.getRepository(Customer);
        
        const customers = [
            {
                name: 'Acme Corporation',
                email: 'contact@acme.corp',
                phone: '+1-555-0123',
                company: 'Acme Corporation',
                status: 'active' as const,
                address: '123 Business Ave, Suite 100, New York, NY 10001',
                notes: 'Major enterprise client interested in our full solution suite.'
            },
            {
                name: 'Tech Innovations Ltd',
                email: 'info@techinnovations.com',
                phone: '+1-555-0456',
                company: 'Tech Innovations Ltd',
                status: 'prospect' as const,
                address: '456 Innovation Drive, San Francisco, CA 94105',
                notes: 'Startup company with high growth potential.'
            },
            {
                name: 'Global Services Inc',
                email: 'sales@globalservices.com',
                phone: '+1-555-0789',
                company: 'Global Services Inc',
                status: 'active' as const,
                address: '789 Corporate Blvd, Chicago, IL 60601',
                notes: 'International company requiring multi-location support.'
            },
            {
                name: 'Local Business Co',
                email: 'owner@localbusiness.com',
                phone: '+1-555-0321',
                company: 'Local Business Co',
                status: 'inactive' as const,
                address: '321 Main Street, Anytown, TX 75001',
                notes: 'Small local business, potential for growth.'
            }
        ];
        
        const savedCustomers = [];
        for (const customerData of customers) {
            const customer = new Customer();
            Object.assign(customer, customerData);
            const saved = await customerRepository.save(customer);
            savedCustomers.push(saved);
            console.log(`  ✅ Customer created: ${customer.name}`);
        }
        
        // Create sample opportunities
        console.log('💼 Creating sample opportunities...');
        const opportunityRepository = AppDataSource.getRepository(Opportunity);
        
        const opportunities = [
            {
                title: 'Enterprise Software License',
                description: 'Annual software license renewal for enterprise package',
                value: 50000,
                stage: 'negotiation' as const,
                probability: 75,
                expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                customer: savedCustomers[0]
            },
            {
                title: 'Implementation Services',
                description: 'Professional services for system implementation',
                value: 25000,
                stage: 'proposal' as const,
                probability: 60,
                expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
                customer: savedCustomers[1]
            },
            {
                title: 'Support Contract',
                description: '24/7 premium support contract',
                value: 15000,
                stage: 'closed-won' as const,
                probability: 100,
                expectedCloseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                customer: savedCustomers[2]
            }
        ];
        
        const savedOpportunities = [];
        for (const oppData of opportunities) {
            const opportunity = new Opportunity();
            Object.assign(opportunity, oppData);
            const saved = await opportunityRepository.save(opportunity);
            savedOpportunities.push(saved);
            console.log(`  ✅ Opportunity created: ${opportunity.title} ($${opportunity.value})`);
        }
        
        // Create sample activities
        console.log('📅 Creating sample activities...');
        const activityRepository = AppDataSource.getRepository(Activity);
        
        const activities = [
            {
                title: 'Initial Discovery Call',
                description: 'First call to understand client requirements',
                type: 'call' as const,
                status: 'completed' as const,
                dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[0],
                opportunity: savedOpportunities[0]
            },
            {
                title: 'Send Proposal',
                description: 'Email detailed proposal to client',
                type: 'email' as const,
                status: 'pending' as const,
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[1],
                opportunity: savedOpportunities[1]
            },
            {
                title: 'Contract Signing Meeting',
                description: 'In-person meeting to finalize contract',
                type: 'meeting' as const,
                status: 'completed' as const,
                dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[2],
                opportunity: savedOpportunities[2]
            }
        ];
        
        for (const actData of activities) {
            const activity = new Activity();
            Object.assign(activity, actData);
            await activityRepository.save(activity);
            console.log(`  ✅ Activity created: ${activity.title}`);
        }
        
        // Create sample interactions
        console.log('💬 Creating sample interactions...');
        const interactionRepository = AppDataSource.getRepository(Interaction);
        
        const interactions = [
            {
                type: 'phone' as const,
                description: 'Discussed project requirements and timeline',
                notes: 'Customer is very interested. Need to follow up with detailed proposal.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[0]
            },
            {
                type: 'email' as const,
                description: 'Sent product demo video and pricing information',
                notes: 'Customer requested additional information about enterprise features.',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[1]
            },
            {
                type: 'meeting' as const,
                description: 'In-person demonstration at client office',
                notes: 'Very successful demo. Customer is ready to move forward with implementation.',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                customer: savedCustomers[2]
            }
        ];
        
        for (const intData of interactions) {
            const interaction = new Interaction();
            Object.assign(interaction, intData);
            await interactionRepository.save(interaction);
            console.log(`  ✅ Interaction created: ${interaction.type} with ${interaction.customer.name}`);
        }
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   👤 Users: ${(await userRepository.count())} created`);
        console.log(`   🏢 Customers: ${(await customerRepository.count())} created`);
        console.log(`   💼 Opportunities: ${(await opportunityRepository.count())} created`);
        console.log(`   📅 Activities: ${(await activityRepository.count())} created`);
        console.log(`   💬 Interactions: ${(await interactionRepository.count())} created`);
        
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin@crm.local / admin123');
        console.log('   Demo:  demo@crm.local / demo123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        // Close database connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('📊 Database connection closed');
        }
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('🏁 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding process failed:', error);
            process.exit(1);
        });
}

export { seedDatabase };