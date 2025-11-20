# MedEx - Developer Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [VM/Cloud Deployment](#vmcloud-deployment)
5. [Database Migrations](#database-migrations)
6. [Role Management](#role-management)
7. [Environment Configuration](#environment-configuration)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or Supabase Cloud account)
- Docker (optional, for containerized deployment)

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd medex
npm install
```

2. **Environment Configuration**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
DATABASE_URL=postgresql://user:pass@host:port/db
```

3. **Run Database Migrations**
```bash
# Using Supabase CLI
supabase db push

# Or using psql
psql $DATABASE_URL -f supabase/migrations/<latest_migration>.sql
```

4. **Initialize Admin Users**
```bash
# Create admin@example.com and test@example.com accounts first via UI
# Then assign roles:
chmod +x scripts/init-admin.sh
./scripts/init-admin.sh

# Or using TypeScript:
npm run assign-roles
```

5. **Start Development Server**
```bash
npm run dev
```

Access the app at `http://localhost:8080`

## Local Development

### Development Workflow

1. **Start services**
```bash
npm run dev
```

2. **Make changes** to code in `src/` directory

3. **Run migrations** for database changes
```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push
```

4. **Test locally** before committing

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run assign-roles` - Assign roles to users

## Docker Deployment

### Build and Run with Docker

1. **Build the image**
```bash
docker build -t medex:latest \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
  --build-arg VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
  .
```

2. **Run the container**
```bash
docker run -d \
  --name medex-app \
  -p 80:80 \
  medex:latest
```

3. **Using Docker Compose**
```bash
docker-compose up -d
```

The app will be available at `http://localhost:80`

### Docker Compose Configuration

See `docker-compose.yml` for full configuration. Key services:
- **web**: Frontend application (port 80)
- **database**: PostgreSQL (if using local DB)

## VM/Cloud Deployment

### Ubuntu/Debian Server

1. **Install Dependencies**
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql-client nginx
```

2. **Clone and Setup**
```bash
git clone <repository-url> /var/www/medex
cd /var/www/medex
npm install
npm run build
```

3. **Configure Nginx**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/medex
sudo ln -s /etc/nginx/sites-available/medex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup Systemd Service** (optional)
```bash
sudo systemctl enable medex
sudo systemctl start medex
```

### Cloud Platforms

#### AWS EC2
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Follow VM deployment steps above
```

#### Google Cloud Run
```bash
gcloud run deploy medex \
  --image gcr.io/project-id/medex:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### DigitalOcean App Platform
- Connect GitHub repository
- Set build command: `npm run build`
- Set environment variables in dashboard

## Database Migrations

### Migration Files

All migrations are in `supabase/migrations/` with timestamp prefixes.

Latest migration includes:
- Role audit table
- SMTP settings table
- Email templates table
- Notifications config table
- Impersonation sessions table
- System metrics table
- RLS policies for all tables
- Database functions and triggers

### Running Migrations

**Option 1: Supabase CLI**
```bash
supabase db push
```

**Option 2: Direct psql**
```bash
psql $DATABASE_URL -f supabase/migrations/<timestamp>_comprehensive_enterprise.sql
```

**Option 3: Programmatically**
```typescript
import { supabase } from './client';
const { data, error } = await supabase.rpc('migrate_database');
```

### Rollback (if needed)
```bash
supabase db reset
# Then re-apply up to specific migration
```

## Role Management

### Available Roles
- `super_admin`: Full system access
- `clinic_admin`: Clinic management access
- `doctor`: Prescription and patient management
- `staff`: Limited access
- `patient`: Patient portal access

### Assigning Roles

**Method 1: Init Script**
```bash
./scripts/init-admin.sh
```

**Method 2: TypeScript Script**
```bash
npm run assign-roles
```

**Method 3: Manual SQL**
```sql
SELECT assign_user_role('user@example.com', 'super_admin');
```

**Method 4: CLI Script**
```bash
./scripts/assign-role.sh user@example.com super_admin
```

### Role Protection

The system prevents:
- Removal of `super_admin` role from `admin@example.com`
- All role changes are audit-logged
- RLS policies enforce role-based access

## Environment Configuration

### Required Variables

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
VITE_SUPABASE_PROJECT_ID=xxx
```

**Backend (Supabase Edge Functions)**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (for admin operations)
```

### Security Best Practices

1. **Never commit** `.env` files
2. **Use secrets manager** for production (AWS Secrets Manager, etc.)
3. **Rotate keys** regularly
4. **Use HTTPS** in production
5. **Enable RLS** on all tables

## Troubleshooting

### Common Issues

**1. Can't see admin panel after login**
- Check user roles: `SELECT * FROM user_roles WHERE user_id = 'your-user-id';`
- Run init script: `./scripts/init-admin.sh`
- Clear browser cache and re-login

**2. Database connection errors**
- Verify `DATABASE_URL` is correct
- Check firewall allows PostgreSQL port (5432)
- Verify database is running: `pg_isready`

**3. Migration failures**
- Check migration logs
- Verify database user has required permissions
- Run migrations one at a time to identify issue

**4. SMTP test fails**
- Verify SMTP settings are saved
- Check firewall allows SMTP port (587/465)
- Test with `telnet smtp.host.com 587`

**5. Build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`
- Check Node.js version: `node --version` (should be 18+)

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

Check browser console for frontend errors.

### Health Checks

**Application Health**
```bash
curl http://localhost:80/
```

**Database Health**
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

**Edge Functions Health**
```bash
curl https://your-project.supabase.co/functions/v1/test-smtp
```

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Admin users initialized
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Rate limiting configured
- [ ] CDN configured (for static assets)
- [ ] Email confirmations disabled (or SMTP configured)
- [ ] RLS policies reviewed
- [ ] Security scan completed

## Support

For issues:
1. Check this guide
2. Review [DEVELOPER.md](./DEVELOPER.md)
3. Check GitHub issues
4. Contact support team

## License

See LICENSE file for details.

---

Last Updated: 2025-01-20
Version: 2.0.0
Maintainer: MedEx Development Team
