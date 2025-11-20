# MedEx Prescription SaaS - Deployment Guide

Complete deployment instructions for all environments: local, Docker, cloud platforms, and VMs.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [VM/Server Deployment](#vmserver-deployment)
- [Database Migrations](#database-migrations)
- [Security Checklist](#security-checklist)

---

## Prerequisites

### Required Software
- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- Git
- Supabase account (or Lovable Cloud enabled)

### Required Accounts
- Supabase project (provided via Lovable Cloud)
- Domain name (for production)
- SSL certificate (automatic with most cloud platforms)

---

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Supabase Configuration (Auto-configured in Lovable)
VITE_SUPABASE_URL=https://mccobdiiknwutougopje.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=mccobdiiknwutougopje

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id

# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=your-sentry-dsn
```

**IMPORTANT:** Never commit `.env` to version control. Add it to `.gitignore`.

---

## Local Development

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd medex-prescription-saas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Run Development Server
```bash
npm run dev
```

Access at: `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

---

## Docker Deployment

### Build Docker Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
  --build-arg VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
  -t medex-saas:latest .
```

### Run Container
```bash
docker run -d \
  -p 80:80 \
  --name medex-web \
  --restart unless-stopped \
  medex-saas:latest
```

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Health Check
```bash
curl http://localhost/
```

---

## Cloud Platforms

### Lovable Cloud (Recommended)
Lovable Cloud handles deployment automatically:
1. Push changes to your Lovable project
2. Click **Publish** in top-right
3. Click **Update** to deploy frontend changes
4. Backend (Edge Functions, DB) deploy automatically

**Custom Domain:**
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure build settings:
# Build command: npm run build
# Publish directory: dist
```

### AWS (S3 + CloudFront)
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Google Cloud Platform (Cloud Run)
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/medex-saas

# Deploy
gcloud run deploy medex-saas \
  --image gcr.io/PROJECT-ID/medex-saas \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_SUPABASE_URL=$VITE_SUPABASE_URL
```

---

## VM/Server Deployment

### Ubuntu/Debian Server Setup

#### 1. Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### 2. Clone and Build
```bash
# Clone repository
git clone <your-repo-url> /var/www/medex
cd /var/www/medex

# Install dependencies
npm install

# Build
npm run build
```

#### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/medex
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/medex/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/medex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

#### 5. Process Manager (PM2)
For serving with Node:
```bash
npm install -g pm2

# If using preview server
pm2 start "npm run preview" --name medex
pm2 startup
pm2 save
```

---

## Database Migrations

### Automatic Migrations (Lovable Cloud)
Migrations in `supabase/migrations/` deploy automatically with your project.

### Manual Migration Execution
If you need to run migrations manually:

#### Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref mccobdiiknwutougopje

# Run migrations
supabase db push

# View migration status
supabase migration list
```

#### Direct SQL Execution
1. Open Lovable Cloud → Database → SQL Editor
2. Paste migration SQL
3. Execute

### Migration Files Location
All migrations are in: `supabase/migrations/`

Latest migration: `20251120163437_45f644b6-05a3-4f8b-b29e-24c4e300a8b8.sql`

---

## Security Checklist

### Pre-Deployment
- [ ] Environment variables configured (not hardcoded)
- [ ] `.env` added to `.gitignore`
- [ ] RLS policies enabled on all tables
- [ ] CORS configured for Edge Functions
- [ ] API rate limiting configured
- [ ] Strong password policy enforced

### Post-Deployment
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] Database backups scheduled
- [ ] Error logging configured (Sentry/etc)
- [ ] Health monitoring active
- [ ] CDN configured (CloudFlare/etc)

### Ongoing Maintenance
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly backup testing
- [ ] Monitor error logs daily
- [ ] Review access logs weekly

---

## Troubleshooting

### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Database Connection Issues
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY

# Test connection from browser console
supabase.from('profiles').select('count')
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart service
sudo systemctl restart nginx
```

### Docker Issues
```bash
# View container logs
docker logs medex-web

# Enter container shell
docker exec -it medex-web sh

# Rebuild without cache
docker-compose build --no-cache
```

---

## Support & Resources

- **Documentation:** [DEVELOPER.md](./DEVELOPER.md)
- **Lovable Docs:** https://docs.lovable.dev
- **Supabase Docs:** https://supabase.com/docs
- **Issues:** Open an issue in the repository

---

## Auto-Healing & Monitoring

### Health Checks
Docker includes automatic health checks:
- HTTP check every 30 seconds
- Auto-restart on failure
- 3 retries before marking unhealthy

### Monitoring Scripts
```bash
# Check service status
./scripts/health-check.sh

# View metrics
./scripts/metrics.sh
```

### Auto-Recovery
PM2 automatically restarts crashed processes:
```bash
pm2 status
pm2 logs medex
```

---

**Last Updated:** 2025-11-20  
**Version:** 1.0.0  
**Maintainer:** Development Team
