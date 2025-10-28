import { initializeDatabase } from './index';
import { UserService } from './services/user.service';
import { logger } from '../utils/logger';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Initialize database first
    initializeDatabase();

    // Wait a bit for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if admin user already exists
    const existingAdmin = await UserService.findByEmail('admin@wahub.local');
    
    if (!existingAdmin) {
      // Create default admin user
      const adminUser = await UserService.createUser(
        'admin@wahub.local',
        'Admin123456',
        'admin'
      );

      logger.info('Default admin user created', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        apiKey: adminUser.apiKey
      });
    } else {
      // Update existing admin user with correct password
      await UserService.updateUser(existingAdmin.id, {
        password: 'Admin123456'
      });
      
      logger.info('Admin user password updated', {
        email: existingAdmin.email,
        role: existingAdmin.role
      });
    }

    // Create a test user
    const existingTestUser = await UserService.findByEmail('user@wahub.local');
    
    if (!existingTestUser) {
      const testUser = await UserService.createUser(
        'user@wahub.local',
        'User123456',
        'user'
      );

      logger.info('Test user created', {
        id: testUser.id,
        email: testUser.email,
        role: testUser.role
      });
    } else {
      logger.info('Test user already exists', {
        email: existingTestUser.email,
        role: existingTestUser.role
      });
    }

    logger.info('✅ Database seeding completed successfully');
  } catch (error) {
    logger.error('❌ Database seeding failed', { error });
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };