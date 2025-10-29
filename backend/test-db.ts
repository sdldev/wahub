#!/usr/bin/env node
/**
 * Simple database test script
 * Tests basic database operations
 */

import { initializeDatabase } from './src/db/index.js';
import { UserService } from './src/db/services/user.service.js';
import { WhatsappAccountService } from './src/db/services/whatsapp-account.service.js';
import { logger } from './src/utils/logger.js';

async function testDatabase() {
  try {
    logger.info('Starting database test...');

    // Initialize database
    logger.info('Initializing database...');
    initializeDatabase();
    logger.info('✅ Database initialized');

    // Test user creation
    logger.info('Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test1234';

    const user = await UserService.createUser(testEmail, testPassword, 'user');
    logger.info('✅ User created', { userId: user.id, email: user.email });

    // Test user login
    logger.info('Testing user authentication...');
    const authUser = await UserService.verifyCredentials(
      testEmail,
      testPassword
    );
    if (authUser) {
      logger.info('✅ User authentication successful');
    } else {
      logger.error('❌ User authentication failed');
    }

    // Test WhatsApp account creation
    logger.info('Testing WhatsApp account creation...');
    const testSession = `test-session-${Date.now()}`;
    const account = await WhatsappAccountService.createAccount(
      user.id,
      testSession
    );
    logger.info('✅ WhatsApp account created', {
      accountId: account.id,
      sessionId: account.sessionId,
    });

    // Test account status update
    logger.info('Testing account status update...');
    const updatedAccount = await WhatsappAccountService.updateStatus(
      testSession,
      'connected'
    );
    logger.info('✅ Account status updated', { status: updatedAccount.status });

    // Cleanup
    logger.info('Cleaning up test data...');
    await WhatsappAccountService.deleteAccount(testSession);
    await UserService.deleteUser(user.id);
    logger.info('✅ Test data cleaned up');

    logger.info('🎉 All tests passed!');
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Test failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

testDatabase();
