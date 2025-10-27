import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'wahub_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wahub',
};

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log(`Connecting to MySQL at ${config.host}:${config.port}...`);

  const connection = await mysql.createConnection(config);

  try {
    // Clear existing data (in reverse order to respect foreign keys)
    console.log('\n🗑️  Clearing existing data...');
    await connection.execute('DELETE FROM rate_limits');
    await connection.execute('DELETE FROM message_queue');
    await connection.execute('DELETE FROM messages');
    await connection.execute('DELETE FROM sessions');
    await connection.execute('DELETE FROM whatsapp_accounts');
    await connection.execute('DELETE FROM users');
    console.log('✅ Existing data cleared');

    // Seed Users
    console.log('\n👥 Seeding users...');
    const users = [
      {
        email: 'admin@wahub.local',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'admin',
        api_key: crypto.randomBytes(32).toString('hex'),
      },
      {
        email: 'user1@wahub.local',
        password: await bcrypt.hash('User123!', 10),
        role: 'user',
        api_key: crypto.randomBytes(32).toString('hex'),
      },
      {
        email: 'user2@wahub.local',
        password: await bcrypt.hash('User123!', 10),
        role: 'user',
        api_key: crypto.randomBytes(32).toString('hex'),
      },
      {
        email: 'readonly@wahub.local',
        password: await bcrypt.hash('Read123!', 10),
        role: 'readonly',
        api_key: crypto.randomBytes(32).toString('hex'),
      },
    ];

    const userIds: number[] = [];
    for (const user of users) {
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, role, api_key) VALUES (?, ?, ?, ?)',
        [user.email, user.password, user.role, user.api_key]
      );
      const insertId = (result as any).insertId;
      userIds.push(insertId);
      console.log(
        `✅ Created ${user.role} user: ${user.email} (ID: ${insertId}, API Key: ${user.api_key})`
      );
    }

    // Seed WhatsApp Accounts
    console.log('\n📱 Seeding WhatsApp accounts...');
    const accounts = [
      {
        user_id: userIds[0], // admin
        phone_number: '+6281234567890',
        session_id: 'admin-wa-session-1',
        status: 'connected',
      },
      {
        user_id: userIds[1], // user1
        phone_number: '+6281234567891',
        session_id: 'user1-wa-session-1',
        status: 'connected',
      },
      {
        user_id: userIds[1], // user1 has 2 accounts
        phone_number: '+6281234567892',
        session_id: 'user1-wa-session-2',
        status: 'disconnected',
      },
      {
        user_id: userIds[2], // user2
        phone_number: '+6281234567893',
        session_id: 'user2-wa-session-1',
        status: 'connecting',
      },
    ];

    const accountIds: number[] = [];
    for (const account of accounts) {
      const [result] = await connection.execute(
        'INSERT INTO whatsapp_accounts (user_id, phone_number, session_id, status) VALUES (?, ?, ?, ?)',
        [
          account.user_id,
          account.phone_number,
          account.session_id,
          account.status,
        ]
      );
      const insertId = (result as any).insertId;
      accountIds.push(insertId);
      console.log(
        `✅ Created account: ${account.phone_number} (${account.status}) for user ${account.user_id}`
      );
    }

    // Seed Sessions
    console.log('\n🔑 Seeding sessions...');
    const sessions = [
      {
        account_id: accountIds[0],
        session_name: 'admin-session-1',
        qr_code: null,
        status: 'active',
        last_active: new Date(),
      },
      {
        account_id: accountIds[1],
        session_name: 'user1-session-1',
        qr_code: null,
        status: 'active',
        last_active: new Date(),
      },
      {
        account_id: accountIds[2],
        session_name: 'user1-session-2',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        status: 'inactive',
        last_active: null,
      },
      {
        account_id: accountIds[3],
        session_name: 'user2-session-1',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        status: 'inactive',
        last_active: null,
      },
    ];

    for (const session of sessions) {
      await connection.execute(
        'INSERT INTO sessions (account_id, session_name, qr_code, status, last_active) VALUES (?, ?, ?, ?, ?)',
        [
          session.account_id,
          session.session_name,
          session.qr_code,
          session.status,
          session.last_active,
        ]
      );
      console.log(`✅ Created session: ${session.session_name} (${session.status})`);
    }

    // Seed Messages
    console.log('\n💬 Seeding messages...');
    const messages = [
      {
        session_id: 'admin-wa-session-1',
        from: '6281234567890@s.whatsapp.net',
        to: '6289876543210@s.whatsapp.net',
        content: 'Hello, this is a test message from admin!',
        type: 'text',
        status: 'completed',
        retry_count: 0,
        error: null,
      },
      {
        session_id: 'user1-wa-session-1',
        from: '6281234567891@s.whatsapp.net',
        to: '6289876543211@s.whatsapp.net',
        content: 'Hello from user1!',
        type: 'text',
        status: 'completed',
        retry_count: 0,
        error: null,
      },
      {
        session_id: 'user1-wa-session-1',
        from: '6281234567891@s.whatsapp.net',
        to: '6289876543212@s.whatsapp.net',
        content: 'Second message from user1',
        type: 'text',
        status: 'pending',
        retry_count: 0,
        error: null,
      },
      {
        session_id: 'admin-wa-session-1',
        from: '6281234567890@s.whatsapp.net',
        to: '6289876543213@s.whatsapp.net',
        content: 'Failed message example',
        type: 'text',
        status: 'failed',
        retry_count: 3,
        error: 'Connection timeout',
      },
    ];

    for (const message of messages) {
      await connection.execute(
        'INSERT INTO messages (session_id, `from`, `to`, content, type, status, retry_count, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          message.session_id,
          message.from,
          message.to,
          message.content,
          message.type,
          message.status,
          message.retry_count,
          message.error,
        ]
      );
      console.log(`✅ Created message: ${message.content.substring(0, 30)}... (${message.status})`);
    }

    // Seed Message Queue
    console.log('\n📬 Seeding message queue...');
    const queueMessages = [
      {
        session_id: 'admin-wa-session-1',
        message_data: JSON.stringify({
          to: '6289876543214@s.whatsapp.net',
          content: 'Queued message 1',
        }),
        status: 'pending',
        priority: 1,
        scheduled_at: null,
        retry_count: 0,
        error: null,
      },
      {
        session_id: 'user1-wa-session-1',
        message_data: JSON.stringify({
          to: '6289876543215@s.whatsapp.net',
          content: 'Queued message 2 with higher priority',
        }),
        status: 'pending',
        priority: 5,
        scheduled_at: null,
        retry_count: 0,
        error: null,
      },
      {
        session_id: 'user1-wa-session-1',
        message_data: JSON.stringify({
          to: '6289876543216@s.whatsapp.net',
          content: 'Scheduled message',
        }),
        status: 'pending',
        priority: 0,
        scheduled_at: new Date(Date.now() + 3600000), // 1 hour from now
        retry_count: 0,
        error: null,
      },
    ];

    for (const queueMsg of queueMessages) {
      await connection.execute(
        'INSERT INTO message_queue (session_id, message_data, status, priority, scheduled_at, retry_count, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          queueMsg.session_id,
          queueMsg.message_data,
          queueMsg.status,
          queueMsg.priority,
          queueMsg.scheduled_at,
          queueMsg.retry_count,
          queueMsg.error,
        ]
      );
      console.log(`✅ Queued message with priority ${queueMsg.priority}`);
    }

    // Seed Rate Limits
    console.log('\n⏱️  Seeding rate limits...');
    const rateLimits = [
      {
        session_id: 'admin-wa-session-1',
        recipient: '6289876543210@s.whatsapp.net',
        count: 5,
        period: 'hour',
        reset_at: new Date(Date.now() + 3600000), // 1 hour from now
      },
      {
        session_id: 'user1-wa-session-1',
        recipient: '6289876543211@s.whatsapp.net',
        count: 3,
        period: 'hour',
        reset_at: new Date(Date.now() + 3600000),
      },
    ];

    for (const rateLimit of rateLimits) {
      await connection.execute(
        'INSERT INTO rate_limits (session_id, recipient, count, period, reset_at) VALUES (?, ?, ?, ?, ?)',
        [
          rateLimit.session_id,
          rateLimit.recipient,
          rateLimit.count,
          rateLimit.period,
          rateLimit.reset_at,
        ]
      );
      console.log(
        `✅ Created rate limit: ${rateLimit.count} messages/${rateLimit.period} for ${rateLimit.recipient}`
      );
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Seed Summary:');
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${accounts.length} WhatsApp accounts created`);
    console.log(`   • ${sessions.length} sessions created`);
    console.log(`   • ${messages.length} messages created`);
    console.log(`   • ${queueMessages.length} queued messages created`);
    console.log(`   • ${rateLimits.length} rate limits created`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:    admin@wahub.local / Admin123!');
    console.log('   User 1:   user1@wahub.local / User123!');
    console.log('   User 2:   user2@wahub.local / User123!');
    console.log('   ReadOnly: readonly@wahub.local / Read123!');

    console.log('\n🔑 API Keys:');
    users.forEach((user) => {
      console.log(`   ${user.email}: ${user.api_key}`);
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
