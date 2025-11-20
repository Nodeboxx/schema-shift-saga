# Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Supabase CLI installed: `npm install -g supabase`

## Step 1: Supabase Setup

### Option A: Using Supabase CLI (Recommended)

1. **Create a new Supabase project** at https://supabase.com/dashboard

2. **Link your project**:
```bash
supabase link --project-ref your-project-ref
```
Find your project ref in your Supabase project URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`

3. **Push database migrations**:
```bash
supabase db push
```

This will create all tables, RLS policies, triggers, and functions automatically.

### Option B: Manual Setup

1. Go to your Supabase dashboard → SQL Editor
2. Run each migration file from `supabase/migrations/` in chronological order

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

Get these values from:
- Supabase Dashboard → Settings → API

## Step 3: Seed Initial Data (Optional)

Populate the database with initial medicine data:

```bash
npm run seed
```

Or manually upload CSV files through the Data Import page in the app.

## Step 4: Install Dependencies & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 5: Configure Authentication

In Supabase Dashboard → Authentication → Settings:
- ✅ Enable Email provider
- ✅ Enable "Confirm email" = OFF (for development)
- Set Site URL to your app URL

## Deployment Options

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Deploy to Custom Server
```bash
npm run build
# Upload the 'dist' folder to your server
```

## Troubleshooting

### Database Connection Issues
- Verify `.env` variables are correct
- Check Supabase project is active
- Ensure RLS policies are applied

### Authentication Issues
- Confirm authentication is enabled in Supabase
- Check email confirmation settings
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

### Migration Errors
```bash
# Reset and reapply migrations
supabase db reset
supabase db push
```

## GitHub Integration (via Lovable)

If using Lovable:
1. Click GitHub → Connect to GitHub in Lovable
2. Authorize the Lovable GitHub App
3. Select your GitHub account/organization
4. Click "Create Repository"

Changes made in Lovable will automatically sync to GitHub, and vice versa.

## Manual GitHub Setup

If deploying independently:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review migration files in `supabase/migrations/`
- Check browser console for errors
