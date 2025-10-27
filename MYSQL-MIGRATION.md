# MySQL Database Implementation

## Overview

Phase 2 uses MySQL database exclusively. MySQL provides excellent performance, scalability, and is the industry standard for production web applications.

## Why MySQL?

### Advantages

1. **Better Concurrency**: MySQL handles multiple concurrent connections excellently
2. **Scalability**: Proven performance with millions of records
3. **Replication**: Built-in master-slave replication for high availability
4. **Remote Access**: Can be accessed from multiple application servers
5. **Production Ready**: Industry standard for web applications
6. **High Performance**: Excellent for high message volumes (1,000,000+ messages/day)

## Configuration

# MySQL Database Setup

## Setup MySQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS with Homebrew
brew install mysql
```

### 2. Create Database and User

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE wahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'wahub_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON wahub.* TO 'wahub_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 3. Update Environment Variables

Edit your `.env` file:

```env
# Database Configuration
DB_TYPE=mysql

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=wahub_user
DB_PASSWORD=secure_password_here
DB_NAME=wahub
```

### 4. Run Migrations and Seed Data

```bash
# Generate and apply migrations
npm run db:push

# Or use proper migrations for production
npm run db:generate
npm run db:migrate

# Seed database with dummy data (development only)
npm run db:seed
```

### 5. Start Application

```bash
npm start
```

The application will automatically connect to MySQL and create all necessary tables on first run.

## Database Management

### Using Drizzle Kit

Drizzle Kit provides tools for managing your database schema:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly (development)
npm run db:push

# Open Drizzle Studio (visual database browser)
npm run db:studio

# Seed database with test data
npm run db:seed
```

See `drizzle/README.md` for detailed migration documentation.

## Dummy Data for Development

The seed script (`npm run db:seed`) creates:

- **4 test users** with different roles (admin, user, readonly)
- **Multiple WhatsApp accounts** in various states
- **Sample sessions** (active and inactive)
- **Test messages** with different statuses
- **Message queue** entries
- **Rate limit** records

### Test Login Credentials

After seeding:
- Admin: `admin@wahub.local` / `Admin123!`
- User 1: `user1@wahub.local` / `User123!`
- User 2: `user2@wahub.local` / `User123!`
- ReadOnly: `readonly@wahub.local` / `Read123!`

## Migration from Phase 1

If you have data from Phase 1 (before MySQL), you'll need to:

1. Backup any important session data from `wa_credentials/`
2. Configure MySQL as shown above
3. Run migrations: `npm run db:migrate`
4. Seed initial data: `npm run db:seed`
5. Re-register users and reconnect WhatsApp sessions

## Docker Setup with MySQL

### Using Docker Compose

Create `docker-compose.mysql.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: wahub-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: wahub
      MYSQL_USER: wahub_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - wahub-network

  app:
    build: .
    container_name: wahub-app
    environment:
      DB_TYPE: mysql
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: wahub_user
      DB_PASSWORD: secure_password
      DB_NAME: wahub
    ports:
      - "5001:5001"
    depends_on:
      - mysql
    networks:
      - wahub-network
    volumes:
      - ./wa_credentials:/app/wa_credentials
      - ./media:/app/media

volumes:
  mysql_data:

networks:
  wahub-network:
```

Start with:

```bash
docker-compose -f docker-compose.mysql.yml up -d
```

## Performance Tuning

### MySQL Configuration

For high-volume scenarios, optimize MySQL configuration in `/etc/mysql/my.cnf`:

```ini
[mysqld]
# Connection settings
max_connections = 200
wait_timeout = 28800

# Buffer settings
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2

# Query cache
query_cache_type = 1
query_cache_size = 64M

# Character set
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci
```

Restart MySQL after changes:

```bash
sudo systemctl restart mysql
```

### Application Configuration

For high message volumes, adjust these environment variables:

```env
# Increase rate limits for production
MAX_MESSAGES_PER_MINUTE=50
MAX_MESSAGES_PER_HOUR=2000

# Reduce delays for faster throughput
MESSAGE_DELAY_MIN=2000
MESSAGE_DELAY_MAX=5000
```

## Monitoring

### Check Database Size

**SQLite:**
```bash
ls -lh data/wahub.db
```

**MySQL:**
```sql
SELECT 
    table_name AS 'Table',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'wahub'
ORDER BY (data_length + index_length) DESC;
```

### Performance Monitoring

**MySQL:**
```sql
-- Show slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- Show current connections
SHOW PROCESSLIST;

-- Show table status
SHOW TABLE STATUS FROM wahub;
```

## Troubleshooting

### Connection Errors

**Error: "Access denied for user"**
```bash
# Check user privileges
mysql -u root -p
SHOW GRANTS FOR 'wahub_user'@'localhost';
```

**Error: "Can't connect to MySQL server"**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check if port is open
sudo netstat -tlnp | grep 3306
```

### Performance Issues

**Slow Queries**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Check slow queries
SELECT * FROM mysql.slow_log;
```

**Connection Pool Exhausted**
- Increase `max_connections` in MySQL config
- Optimize application queries
- Add connection pooling configuration

## Best Practices

1. **Regular Backups**
   ```bash
   # Daily backup script
   mysqldump -u wahub_user -p wahub > backup_$(date +%Y%m%d).sql
   ```

2. **Index Optimization**
   - Monitor slow queries
   - Add indexes for frequently queried columns
   - Use `EXPLAIN` to analyze queries

3. **Data Archiving**
   - Archive old messages periodically
   - Keep last 30-90 days in main tables
   - Move older data to archive tables

4. **Security**
   - Use strong passwords
   - Restrict database user privileges
   - Enable SSL for remote connections
   - Regular security updates

## Conclusion

MySQL provides excellent performance and scalability for WhatsApp gateway deployments. The migration infrastructure with Drizzle ORM makes it easy to manage schema changes and maintain database consistency across environments.
