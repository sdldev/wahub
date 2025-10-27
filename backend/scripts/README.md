# Database Scripts

This directory contains database-related scripts for development and testing.

## seed.ts

Seeds the MySQL database with dummy data for development and testing purposes.

### Usage

```bash
npm run db:seed
```

### Prerequisites

1. MySQL server must be running
2. Database must be created (see `MYSQL-MIGRATION.md`)
3. Environment variables must be configured in `.env`

### What it creates

The seed script populates the database with:

#### Users (4 test accounts)
- **Admin**: Full access
  - Email: `admin@wahub.local`
  - Password: `Admin123!`
  - Role: `admin`

- **User 1**: Standard user with 2 WhatsApp accounts
  - Email: `user1@wahub.local`
  - Password: `User123!`
  - Role: `user`

- **User 2**: Standard user
  - Email: `user2@wahub.local`
  - Password: `User123!`
  - Role: `user`

- **ReadOnly**: Read-only access
  - Email: `readonly@wahub.local`
  - Password: `Read123!`
  - Role: `readonly`

#### WhatsApp Accounts (4 accounts)
- Admin's account (connected)
- User1's first account (connected)
- User1's second account (disconnected)
- User2's account (connecting)

#### Sessions (4 sessions)
- 2 active sessions (admin, user1)
- 2 inactive sessions with QR codes

#### Messages (4 test messages)
- Completed messages
- Pending messages
- Failed message with error

#### Message Queue (3 queued messages)
- Pending messages with different priorities
- Scheduled message for future delivery

#### Rate Limits (2 entries)
- Sample rate limit counters

### Important Notes

⚠️ **Warning**: This script clears ALL existing data before seeding!

🔒 **Security**: The passwords are hashed using bcrypt (10 rounds)

🔑 **API Keys**: Each user gets a randomly generated API key (displayed after seeding)

### Development Workflow

1. Set up MySQL database
2. Run migrations: `npm run db:migrate`
3. Seed data: `npm run db:seed`
4. Start development server: `npm run dev`

### Resetting Development Database

To completely reset your development database:

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS wahub; CREATE DATABASE wahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Re-run migrations
npm run db:migrate

# Re-seed data
npm run db:seed
```

### Customizing Seed Data

You can modify `seed.ts` to add more test data or change the default values. The script is well-commented and structured for easy customization.

### Testing the Seed Data

After seeding, you can test the data:

1. **Login Test**:
   ```bash
   curl -X POST http://localhost:5001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@wahub.local","password":"Admin123!"}'
   ```

2. **API Key Test**:
   ```bash
   # Use the API key displayed after seeding
   curl -X GET http://localhost:5001/user/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Database Verification**:
   ```bash
   mysql -u wahub_user -p wahub -e "SELECT * FROM users;"
   ```
