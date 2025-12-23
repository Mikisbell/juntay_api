# Workflow: Local → Cloud Deployment

## Overview
Development happens on LOCAL Supabase, then migrations are pushed to CLOUD when ready.

## Ports (Local Supabase)
| Port | Service |
|------|---------|
| 54321 | Supabase API (Kong) |
| 54322 | PostgreSQL Direct |
| 54323 | Dashboard Web |

## Daily Development

### 1. Start Local Environment
```bash
# Ensure Docker is running, then:
npm run dev -- --turbo
```

### 2. Create New Migration
```bash
# Create empty migration file
npx supabase migration new my_feature_name

# Edit the file in supabase/migrations/
```

### 3. Apply Migration to Local
```bash
# Option A: Via psql (if Docker connection issues)
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql

# Option B: Via Supabase CLI (if Docker works)
npx supabase db reset --local
```

### 4. Test Locally
- App runs at http://localhost:3000
- Dashboard at http://localhost:54323

## Deploying to Cloud

### 1. Ensure CLI is Linked to Cloud Project
```bash
npx supabase link --project-ref bvrzwdztdccxaenfwwcy
```

### 2. Push All Pending Migrations
```bash
npx supabase db push
```

### 3. Update .env for Production
Create `.env.production` with Cloud URLs:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bvrzwdztdccxaenfwwcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-cloud-anon-key>
```

## Notes
- Local uses demo credentials (safe for dev)
- Cloud uses real credentials (keep secure)
- Always test migrations locally before pushing to cloud
