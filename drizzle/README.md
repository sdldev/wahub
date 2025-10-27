# Database Migrations

This directory contains Drizzle ORM migration files for the wahub database.

## Prerequisites

Before running migrations, ensure you have:

1. MySQL server installed and running
2. Database and user created
3. Environment variables configured in `.env`

## Setup MySQL

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE wahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'wahub_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON wahub.* TO 'wahub_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

## Configuration

Create a `.env` file in the project root with the following:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=wahub_user
DB_PASSWORD=your_secure_password
DB_NAME=wahub
```

## Running Migrations

### Generate Migration Files

When you modify the schema files in `src/db/schema/`, generate a new migration:

```bash
npm run db:generate
```

This will create a new migration file in the `drizzle` directory.

### Apply Migrations

To apply all pending migrations to your database:

```bash
npm run db:migrate
```

### Push Schema Changes (Development)

For rapid development, you can push schema changes directly without generating migration files:

```bash
npm run db:push
```

**Note:** This is recommended for development only. Use proper migrations for production.

## Seeding the Database

To populate the database with dummy data for development:

```bash
npm run db:seed
```

This will create:
- 4 test users (admin, user1, user2, readonly)
- Multiple WhatsApp accounts
- Sample sessions, messages, and rate limits

### Default Login Credentials

After seeding, you can use these credentials:

- **Admin**: admin@wahub.local / Admin123!
- **User 1**: user1@wahub.local / User123!
- **User 2**: user2@wahub.local / User123!
- **ReadOnly**: readonly@wahub.local / Read123!

## Drizzle Studio

To explore and manage your database with a visual interface:

```bash
npm run db:studio
```

This will open Drizzle Studio in your browser at `https://local.drizzle.studio`

## Migration Workflow

### Development

1. Modify schema files in `src/db/schema/`
2. Run `npm run db:push` for quick iteration
3. Test your changes
4. When ready, run `npm run db:generate` to create a migration
5. Commit the migration file to version control

### Production

1. Pull latest code with migration files
2. Run `npm run db:migrate` to apply migrations
3. Restart the application

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check MySQL is running: `systemctl status mysql`
2. Verify credentials in `.env`
3. Test connection: `mysql -u wahub_user -p`

### Migration Errors

If migrations fail:

1. Check the error message in the console
2. Verify database exists and user has proper permissions
3. Review the migration file in `drizzle/` directory
4. Fix any issues and try again

### Reset Database (Development Only)

To completely reset your database:

```bash
# Drop all tables
mysql -u wahub_user -p wahub -e "DROP DATABASE wahub; CREATE DATABASE wahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Re-run migrations
npm run db:migrate

# Re-seed data
npm run db:seed
```

## Best Practices

1. **Never** modify existing migration files
2. **Always** generate migrations for schema changes in production
3. **Test** migrations in development before applying to production
4. **Backup** your database before running migrations in production
5. **Version control** all migration files
6. Use `db:push` for rapid development, `db:generate` + `db:migrate` for production
