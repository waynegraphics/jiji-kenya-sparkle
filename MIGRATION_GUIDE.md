# 🚀 Migration Guide: Lovable Cloud → DirectAdmin VPS

> Complete guide to migrate the JijiKenya marketplace (frontend, database, storage, auth, edge functions) to a self-hosted DirectAdmin VPS.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [VPS Server Setup](#2-vps-server-setup)
3. [Database Migration](#3-database-migration)
4. [Storage Files Migration](#4-storage-files-migration)
5. [Auth Migration (Self-Hosted Supabase)](#5-auth-migration-self-hosted-supabase)
6. [Edge Functions Migration](#6-edge-functions-migration)
7. [Frontend Deployment](#7-frontend-deployment)
8. [Nginx Configuration](#8-nginx-configuration)
9. [Environment Variables](#9-environment-variables)
10. [Post-Migration Checklist](#10-post-migration-checklist)
11. [Automated Backups](#11-automated-backups)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

### Hardware Requirements

| Resource     | Minimum    | Recommended |
|-------------|------------|-------------|
| CPU          | 2 vCPUs    | 4 vCPUs     |
| RAM          | 4 GB       | 8 GB        |
| Storage      | 40 GB SSD  | 100 GB SSD  |
| Bandwidth    | 1 TB/mo    | Unlimited   |

### Software Requirements

- **OS:** Ubuntu 22.04 LTS or Debian 12
- **DirectAdmin** control panel installed
- **Docker & Docker Compose** v2.20+
- **Node.js** 18+ (via nvm)
- **Deno** 1.40+ (for edge functions)
- **PostgreSQL** 15+ (via Docker or native)
- **Nginx** (included with DirectAdmin)
- **Certbot** (for SSL certificates)
- **Git**

### Accounts & Access

- SSH root access to your VPS
- Domain name pointed to your VPS IP (A record)
- Access to Lovable Cloud backend (for data export)

---

## 2. VPS Server Setup

### 2.1 Initial Server Security

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git wget unzip ufw fail2ban

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Enable fail2ban for SSH protection
systemctl enable fail2ban
systemctl start fail2ban
```

### 2.2 Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2.3 Install Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should output v18.x.x
npm --version
```

### 2.4 Install Deno

```bash
curl -fsSL https://deno.land/install.sh | sh
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
deno --version
```

---

## 3. Database Migration

### 3.1 Set Up Self-Hosted Supabase (Includes PostgreSQL)

> Self-hosting Supabase gives you PostgreSQL + Auth + Storage + Realtime — all in one. This is the **recommended** approach as it requires **zero frontend code changes**.

```bash
# Create directory
mkdir -p /opt/supabase && cd /opt/supabase

# Clone Supabase Docker setup
git clone --depth 1 https://github.com/supabase/supabase.git
cd supabase/docker

# Copy environment template
cp .env.example .env
```

### 3.2 Configure Supabase Environment

Edit `/opt/supabase/supabase/docker/.env`:

```env
############
# Secrets - CHANGE ALL OF THESE!
############

# Generate with: openssl rand -base64 32
POSTGRES_PASSWORD=your_strong_db_password_here
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
ANON_KEY=generate-using-supabase-cli-or-jwt-tool
SERVICE_ROLE_KEY=generate-using-supabase-cli-or-jwt-tool

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API
############
SITE_URL=https://yourdomain.com
API_EXTERNAL_URL=https://api.yourdomain.com

############
# Studio (Admin UI)
############
STUDIO_PORT=3000
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your_dashboard_password

############
# Storage
############
STORAGE_BACKEND=file
FILE_SIZE_LIMIT=52428800  # 50MB
```

#### Generate JWT Keys

```bash
# Install Supabase CLI
npm install -g supabase

# Generate ANON_KEY
supabase gen keys --experimental --jwt-secret "your-super-secret-jwt-token-with-at-least-32-characters"
```

Copy the output `anon` and `service_role` keys into your `.env` file.

### 3.3 Start Supabase Services

```bash
cd /opt/supabase/supabase/docker
docker compose up -d

# Verify all services are running
docker compose ps
```

You should see these services running:
- `supabase-db` (PostgreSQL)
- `supabase-auth` (GoTrue)
- `supabase-rest` (PostgREST)
- `supabase-realtime`
- `supabase-storage`
- `supabase-studio` (Admin dashboard)
- `supabase-kong` (API Gateway)

### 3.4 Export Database from Lovable Cloud

Get your database connection string from Lovable Cloud settings, then:

```bash
# Option A: Full dump (schema + data + functions + triggers + RLS)
pg_dump "postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-privileges \
  --schema=public \
  --format=custom \
  --file=jijkenya_backup.dump

# Option B: Plain SQL (readable, good for review)
pg_dump "postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-privileges \
  --schema=public \
  --format=plain \
  --file=jijkenya_backup.sql
```

### 3.5 Import Database to Self-Hosted Supabase

```bash
# Get the database container IP or use localhost with exposed port
# Default Supabase Docker exposes PostgreSQL on port 5432

# Restore the dump
pg_restore \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d postgres \
  --no-owner \
  --no-privileges \
  --schema=public \
  jijkenya_backup.dump

# If using plain SQL format instead:
psql -h localhost -p 5432 -U postgres -d postgres -f jijkenya_backup.sql
```

### 3.6 Verify Database Integrity

```bash
psql -h localhost -p 5432 -U postgres -d postgres -c "
  SELECT schemaname, tablename 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  ORDER BY tablename;
"
```

#### Expected Tables (Complete List)

| Table | Description |
|-------|------------|
| `base_listings` | Core listing data (all ads) |
| `vehicle_listings` | Vehicle-specific fields |
| `property_listings` | Property-specific fields |
| `job_listings` | Job posting fields |
| `electronics_listings` | Electronics fields |
| `phone_listings` | Phone/tablet fields |
| `fashion_listings` | Fashion/clothing fields |
| `furniture_listings` | Furniture fields |
| `pet_listings` | Pet listing fields |
| `agriculture_listings` | Agriculture fields |
| `beauty_listings` | Beauty product fields |
| `construction_listings` | Construction fields |
| `equipment_listings` | Equipment fields |
| `kids_listings` | Kids/baby items |
| `leisure_listings` | Leisure/sports fields |
| `profiles` | User profiles |
| `user_roles` | Admin/moderator roles |
| `messages` | User-to-user chat |
| `favorites` | Saved listings |
| `follows` | User follows |
| `reviews` | Seller reviews |
| `notifications` | User notifications |
| `main_categories` | Category tree (parent) |
| `sub_categories` | Category tree (child) |
| `kenya_counties` | Location: counties |
| `kenya_towns` | Location: towns |
| `seller_subscriptions` | Active subscriptions |
| `subscription_packages` | Subscription plans |
| `payment_transactions` | M-Pesa payments |
| `listing_tiers` | Listing boost tiers |
| `listing_tier_purchases` | Tier purchases |
| `listing_promotions` | Promotion purchases |
| `promotion_types` | Promotion plans |
| `bump_packages` | Bump credit packages |
| `bump_transactions` | Bump usage log |
| `addons` | Add-on products |
| `addon_tiers` | Add-on pricing |
| `seller_addons` | Purchased add-ons |
| `affiliates` | Affiliate accounts |
| `affiliate_clicks` | Click tracking |
| `affiliate_referrals` | Referral tracking |
| `affiliate_payouts` | Payout history |
| `blog_posts` | Blog content |
| `reports` | User reports |
| `moderation_logs` | Admin action logs |
| `support_tickets` | Support tickets |
| `ticket_responses` | Ticket replies |
| `contact_submissions` | Contact form entries |
| `announcements` | Platform announcements |
| `career_openings` | Job openings |
| `career_applications` | Job applications |
| `ai_settings` | AI configuration |
| `ai_usage_logs` | AI usage tracking |
| `mpesa_settings` | M-Pesa config |
| `platform_settings` | Platform config |
| `featured_durations` | Featured listing plans |
| `featured_settings` | Featured display config |
| `email_templates` | Email templates |
| `communication_channels` | Communication config |
| `category_form_fields` | Dynamic form fields |
| `listing_dynamic_fields` | Dynamic field values |
| `custom_field_values` | Custom field submissions |
| `verification_requests` | Seller verifications |
| `seller_registrations` | Registration fees |
| `user_suspensions` | User suspensions |
| `user_warnings` | User warnings |
| `rate_limit_tracker` | Rate limiting |
| `safe_profiles` | Secure profile view |

### 3.7 Verify Database Functions

```bash
psql -h localhost -p 5432 -U postgres -d postgres -c "
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  ORDER BY routine_name;
"
```

#### Expected Functions

- `is_admin()` — Admin role check
- `has_role()` — Role verification
- `handle_new_user()` — Auto-create profile on signup
- `increment_listing_views()` — Atomic view counter
- `increment_ads_used()` — Subscription usage counter
- `bump_listing()` — Bump ad with wallet deduction
- `add_bump_credits()` — Add bump credits
- `apply_tier_to_listing()` — Apply tier boost
- `apply_promotion_to_listing()` — Apply promotion
- `remove_tier_from_listing()` — Remove tier
- `update_seller_rating()` — Recalculate seller rating
- `create_notification()` — Create notification
- `notify_on_new_message()` — Message notification trigger
- `notify_on_new_follow()` — Follow notification trigger
- `notify_on_new_review()` — Review notification trigger
- `notify_on_favorite()` — Favorite notification trigger
- `notify_on_listing_status_change()` — Listing approval/rejection
- `notify_on_subscription_change()` — Subscription status
- `notify_admins_on_contact()` — Admin alert: contact form
- `notify_admins_on_report()` — Admin alert: reports
- `notify_admins_on_new_listing()` — Admin alert: new listing
- `notify_admins_on_verification()` — Admin alert: verification
- `notify_admins_on_ticket()` — Admin alert: support ticket
- `check_rate_limit()` — Rate limiting
- `mask_phone()` — Phone number masking
- `get_user_emails()` — Admin email lookup
- `admin_set_account_type()` — Admin account management
- `sync_listing_tier_priority()` — Auto-sync tier priority
- `update_updated_at_column()` — Timestamp trigger

### 3.8 Verify RLS Policies

```bash
psql -h localhost -p 5432 -U postgres -d postgres -c "
  SELECT schemaname, tablename, policyname, cmd, qual
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
"
```

All RLS policies are included in the `pg_dump` and will be restored automatically.

---

## 4. Storage Files Migration

### 4.1 Storage Buckets Overview

| Bucket | Public | Contents |
|--------|--------|----------|
| `listings` | ✅ Yes | Listing images |
| `blog` | ✅ Yes | Blog post thumbnails |
| `verifications` | ❌ No | ID documents (sensitive) |
| `resumes` | ❌ No | Career applications |
| `messages` | ❌ No | Chat attachments |

### 4.2 Export Storage Files

Create a migration script `export-storage.js`:

```javascript
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  "https://pookcecmoirdsavrgcmb.supabase.co",
  "YOUR_SERVICE_ROLE_KEY" // Use service role key for full access
);

const BUCKETS = ["listings", "blog", "verifications", "resumes", "messages"];

async function exportBucket(bucketName) {
  console.log(`\n📦 Exporting bucket: ${bucketName}`);
  
  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list("", { limit: 10000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error(`  ❌ Error listing ${bucketName}:`, error.message);
    return;
  }

  console.log(`  Found ${files.length} files`);
  const outputDir = path.join("./storage-export", bucketName);
  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of files) {
    if (file.id === null) continue; // Skip folders
    
    try {
      const { data, error: dlError } = await supabase.storage
        .from(bucketName)
        .download(file.name);

      if (dlError) {
        console.error(`  ❌ Failed: ${file.name}`, dlError.message);
        continue;
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      fs.writeFileSync(path.join(outputDir, file.name), buffer);
      console.log(`  ✅ ${file.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  ❌ Error downloading ${file.name}:`, err.message);
    }
  }
}

async function main() {
  console.log("🚀 Starting storage export...\n");
  
  for (const bucket of BUCKETS) {
    await exportBucket(bucket);
  }
  
  console.log("\n✅ Storage export complete!");
  console.log(`📁 Files saved to: ${path.resolve("./storage-export")}`);
}

main();
```

Run it:

```bash
npm install @supabase/supabase-js
node export-storage.js
```

### 4.3 Import Storage Files to Self-Hosted Supabase

```bash
# Create buckets via Supabase Studio (http://localhost:3000)
# Or via SQL:

psql -h localhost -p 5432 -U postgres -d postgres -c "
  INSERT INTO storage.buckets (id, name, public) VALUES 
    ('listings', 'listings', true),
    ('blog', 'blog', true),
    ('verifications', 'verifications', false),
    ('resumes', 'resumes', false),
    ('messages', 'messages', false)
  ON CONFLICT (id) DO NOTHING;
"
```

Create an import script `import-storage.js`:

```javascript
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Point to your self-hosted Supabase
const supabase = createClient(
  "http://localhost:8000", // Kong API Gateway
  "YOUR_NEW_SERVICE_ROLE_KEY"
);

const BUCKETS = ["listings", "blog", "verifications", "resumes", "messages"];

async function importBucket(bucketName) {
  const dir = path.join("./storage-export", bucketName);
  if (!fs.existsSync(dir)) {
    console.log(`⏭️ Skipping ${bucketName} (no export found)`);
    return;
  }

  const files = fs.readdirSync(dir);
  console.log(`\n📦 Importing ${files.length} files to ${bucketName}`);

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, { upsert: true });

    if (error) {
      console.error(`  ❌ ${fileName}: ${error.message}`);
    } else {
      console.log(`  ✅ ${fileName}`);
    }
  }
}

async function main() {
  for (const bucket of BUCKETS) {
    await importBucket(bucket);
  }
  console.log("\n✅ Storage import complete!");
}

main();
```

### 4.4 Restore Storage RLS Policies

```sql
-- Listings bucket: public read, authenticated upload
CREATE POLICY "Public read listings" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "Auth users upload listings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users delete own listing images" ON storage.objects
  FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Blog bucket: public read, admin upload
CREATE POLICY "Public read blog" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Admins upload blog" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND public.is_admin(auth.uid()));

-- Verifications: owner + admin only
CREATE POLICY "Users view own verifications" ON storage.objects
  FOR SELECT USING (bucket_id = 'verifications' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())
  ));

CREATE POLICY "Users upload verifications" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Messages: participants only
CREATE POLICY "Message participants access" ON storage.objects
  FOR SELECT USING (bucket_id = 'messages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth users upload message files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'messages' AND auth.uid() IS NOT NULL);

-- Resumes: applicant + admin only
CREATE POLICY "Users view own resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())
  ));

CREATE POLICY "Users upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);
```

---

## 5. Auth Migration (Self-Hosted Supabase)

### 5.1 Auth Users Export

Supabase stores users in `auth.users`. Export them:

```bash
pg_dump "postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-privileges \
  --schema=auth \
  --table=auth.users \
  --table=auth.identities \
  --data-only \
  --format=plain \
  --file=auth_users_export.sql
```

### 5.2 Import Auth Users

```bash
psql -h localhost -p 5432 -U postgres -d postgres -f auth_users_export.sql
```

> ⚠️ **Important:** User passwords are hashed and will work as-is. Users do NOT need to reset passwords.

### 5.3 Configure Auth Settings

Edit the GoTrue config in your Docker `.env`:

```env
# Auth settings
GOTRUE_SITE_URL=https://yourdomain.com
GOTRUE_URI_ALLOW_LIST=https://yourdomain.com/*
GOTRUE_DISABLE_SIGNUP=false

# Email settings (configure your SMTP)
GOTRUE_SMTP_HOST=mail.yourdomain.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=noreply@yourdomain.com
GOTRUE_SMTP_PASS=your_smtp_password
GOTRUE_SMTP_ADMIN_EMAIL=noreply@yourdomain.com
GOTRUE_MAILER_AUTOCONFIRM=false
```

---

## 6. Edge Functions Migration

### 6.1 Edge Functions Overview

| Function | JWT | Description |
|----------|-----|-------------|
| `mpesa-stk-push` | ❌ | Initiate M-Pesa payment |
| `mpesa-callback` | ❌ | M-Pesa payment webhook |
| `ai-search` | ❌ | AI-powered search |
| `ai-generate-listing` | ❌ | AI listing generation |
| `ai-price-suggestion` | ❌ | AI price suggestions |
| `sitemap` | ❌ | Dynamic XML sitemap |
| `auto-draft-expired` | ❌ | Auto-expire listings |
| `renew-subscription` | ❌ | Subscription renewal |

### 6.2 Option A: Deno Standalone Server (Lightweight)

Create `/opt/edge-functions/serve.ts`:

```typescript
const FUNCTIONS_DIR = "/opt/app/supabase/functions";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const functionName = pathParts[0];

  if (!functionName) {
    return new Response("Edge Functions Server", { status: 200 });
  }

  try {
    const mod = await import(`${FUNCTIONS_DIR}/${functionName}/index.ts`);
    
    // Edge functions expect a default export or handle Request directly
    if (typeof mod.default === "function") {
      return await mod.default(req);
    }
    
    return new Response("Function not callable", { status: 500 });
  } catch (err) {
    console.error(`Error in ${functionName}:`, err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

Deno.serve({ port: 8001 }, handler);
```

### 6.3 Option B: Use Supabase Edge Runtime (Docker)

Already included in self-hosted Supabase. Place your functions in:

```
/opt/supabase/supabase/docker/volumes/functions/
```

Copy the functions:

```bash
cp -r /opt/app/supabase/functions/* /opt/supabase/supabase/docker/volumes/functions/
```

### 6.4 Set Edge Function Secrets

```bash
# In your Docker .env or as environment variables:
export SUPABASE_URL=https://api.yourdomain.com
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export SUPABASE_ANON_KEY=your-anon-key
export LOVABLE_API_KEY=your-lovable-api-key  # For AI features
```

### 6.5 Create Systemd Service (for Option A)

```bash
cat > /etc/systemd/system/edge-functions.service << 'EOF'
[Unit]
Description=Edge Functions Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/edge-functions
ExecStart=/root/.deno/bin/deno run --allow-all serve.ts
Restart=always
RestartSec=5
Environment=SUPABASE_URL=https://api.yourdomain.com
Environment=SUPABASE_SERVICE_ROLE_KEY=your-key
Environment=SUPABASE_ANON_KEY=your-key

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable edge-functions
systemctl start edge-functions
```

---

## 7. Frontend Deployment

### 7.1 Clone and Build

```bash
# Clone repository
cd /opt
git clone https://github.com/your-username/jiji-kenya.git app
cd app

# Install dependencies
npm install

# Create production .env
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_PUBLISHABLE_KEY=your-new-anon-key
VITE_SUPABASE_PROJECT_ID=self-hosted
EOF

# Build for production
npm run build
```

### 7.2 Serve with Nginx

The built files will be in `/opt/app/dist/`. See Nginx config in the next section.

### 7.3 Set Up Auto-Deploy (Optional)

Create `/opt/scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

cd /opt/app
git pull origin main
npm install
npm run build

echo "✅ Deployed at $(date)"
```

Add a webhook or cron job to trigger on push.

---

## 8. Nginx Configuration

### 8.1 Main Site Config

Create `/etc/nginx/sites-available/yourdomain.com`:

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

# Main application
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React SPA)
    root /opt/app/dist;
    index index.html;

    # SPA routing — serve index.html for all frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
}
```

### 8.2 API Subdomain Config

Create `/etc/nginx/sites-available/api.yourdomain.com`:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Proxy to Supabase Kong API Gateway
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (for Realtime)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 8.3 Enable Sites & SSL

```bash
# Enable sites
ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/

# Test config
nginx -t

# Get SSL certificates
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d api.yourdomain.com

# Reload Nginx
systemctl reload nginx
```

---

## 9. Environment Variables

### 9.1 Frontend `.env`

```env
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_PUBLISHABLE_KEY=your-new-anon-key
VITE_SUPABASE_PROJECT_ID=self-hosted
```

### 9.2 Backend / Edge Functions Environment

```env
SUPABASE_URL=https://api.yourdomain.com
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:your_password@localhost:5432/postgres
LOVABLE_API_KEY=your-lovable-api-key
```

### 9.3 M-Pesa Callback URL Update

After migration, update the M-Pesa callback URL in your `mpesa_settings` table:

```sql
UPDATE mpesa_settings 
SET callback_url = 'https://api.yourdomain.com/functions/v1/mpesa-callback'
WHERE id = (SELECT id FROM mpesa_settings LIMIT 1);
```

---

## 10. Post-Migration Checklist

### Critical Verification

- [ ] **DNS** — `yourdomain.com` and `api.yourdomain.com` resolve to VPS IP
- [ ] **SSL** — Both domains have valid HTTPS certificates
- [ ] **Frontend** — Homepage loads correctly at `https://yourdomain.com`
- [ ] **Auth** — User signup, login, and password reset work
- [ ] **Existing Users** — Old users can log in with existing credentials
- [ ] **Listings** — All listings display with images
- [ ] **Search** — Category browsing and search work
- [ ] **Posting** — Creating a new listing with images works
- [ ] **Messaging** — User-to-user chat functions
- [ ] **Payments** — M-Pesa STK push initiates correctly
- [ ] **M-Pesa Callback** — Payment confirmation processes
- [ ] **Admin Panel** — `/apa` admin dashboard accessible
- [ ] **Realtime** — Notifications and message updates work
- [ ] **Sitemap** — `https://api.yourdomain.com/functions/v1/sitemap` generates XML
- [ ] **Storage** — Images load from self-hosted storage
- [ ] **RLS Policies** — Non-admin users cannot access admin data

### Security Hardening

- [ ] **Firewall** — Only ports 22, 80, 443 open
- [ ] **Fail2ban** — Active and monitoring SSH
- [ ] **Supabase Studio** — Not publicly accessible (bind to localhost or VPN)
- [ ] **Database** — PostgreSQL not exposed to public internet
- [ ] **Service Role Key** — Only used server-side, never in frontend
- [ ] **CORS** — Edge functions only accept requests from your domain

### Performance

- [ ] **Gzip** — Enabled in Nginx
- [ ] **Static Asset Caching** — Long cache headers for JS/CSS/images
- [ ] **Database Indexes** — Verify indexes exist on frequently queried columns

---

## 11. Automated Backups

### 11.1 Database Backup Script

Create `/opt/scripts/backup-db.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/backups/database"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Dump database
pg_dump -h localhost -p 5432 -U postgres -d postgres \
  --format=custom \
  --file="$BACKUP_DIR/jijkenya_${TIMESTAMP}.dump"

# Compress
gzip "$BACKUP_DIR/jijkenya_${TIMESTAMP}.dump"

# Remove old backups
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +${RETENTION_DAYS} -delete

echo "✅ Backup completed: jijkenya_${TIMESTAMP}.dump.gz"
```

### 11.2 Storage Backup Script

Create `/opt/scripts/backup-storage.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/backups/storage"
TIMESTAMP=$(date +%Y%m%d)
STORAGE_DIR="/opt/supabase/supabase/docker/volumes/storage"

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/storage_${TIMESTAMP}.tar.gz" -C "$STORAGE_DIR" .

# Retain 14 days
find "$BACKUP_DIR" -name "storage_*.tar.gz" -mtime +14 -delete

echo "✅ Storage backup: storage_${TIMESTAMP}.tar.gz"
```

### 11.3 Cron Schedule

```bash
crontab -e
```

Add:

```cron
# Database backup: daily at 2 AM
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1

# Storage backup: daily at 3 AM
0 3 * * * /opt/scripts/backup-storage.sh >> /var/log/backup-storage.log 2>&1

# SSL certificate renewal: twice daily
0 0,12 * * * certbot renew --quiet
```

---

## 12. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|---------|
| Frontend shows blank page | Check `try_files` in Nginx config; ensure `/index.html` fallback |
| Auth "Invalid JWT" errors | Verify `JWT_SECRET` matches between GoTrue and PostgREST |
| CORS errors in browser | Check edge function CORS headers allow your domain |
| Images not loading | Verify storage buckets exist and public buckets have SELECT policies |
| Realtime not connecting | Ensure WebSocket proxy headers in Nginx (`Upgrade`, `Connection`) |
| M-Pesa callback failing | Update `callback_url` in `mpesa_settings` to new domain |
| RLS policy errors | Ensure `is_admin()` and `has_role()` functions were imported |
| Database connection refused | Check PostgreSQL is listening and `.env` has correct credentials |
| Supabase Studio 404 | Access via `http://localhost:3000` (don't expose publicly) |

### Useful Commands

```bash
# Check Supabase containers
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml ps

# View logs
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml logs -f

# Restart specific service
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml restart supabase-auth

# Check Nginx errors
tail -f /var/log/nginx/error.log

# Check edge function logs
journalctl -u edge-functions -f

# Test database connection
psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT count(*) FROM base_listings;"
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   DirectAdmin VPS                    │
│                                                      │
│  ┌──────────┐    ┌──────────────────────────────┐   │
│  │  Nginx   │───▶│  /opt/app/dist (React SPA)   │   │
│  │ :80/:443 │    └──────────────────────────────┘   │
│  │          │                                        │
│  │          │    ┌──────────────────────────────┐   │
│  │ api.*    │───▶│  Supabase Kong (API Gateway) │   │
│  └──────────┘    │  :8000                       │   │
│                  └──────┬───────────────────────┘   │
│                         │                            │
│          ┌──────────────┼──────────────┐            │
│          ▼              ▼              ▼            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │ PostgREST│  │ GoTrue   │  │ Supabase     │     │
│  │ (REST)   │  │ (Auth)   │  │ Storage      │     │
│  └────┬─────┘  └────┬─────┘  └──────────────┘     │
│       │              │                               │
│       ▼              ▼                               │
│  ┌─────────────────────────┐                        │
│  │   PostgreSQL 15          │                        │
│  │   (All data + RLS)       │                        │
│  └─────────────────────────┘                        │
│                                                      │
│  ┌─────────────────────────┐                        │
│  │ Deno Edge Functions     │                        │
│  │ :8001                   │                        │
│  └─────────────────────────┘                        │
└─────────────────────────────────────────────────────┘
```

---

## Important Notes

1. **Zero Frontend Code Changes**: By self-hosting Supabase, the `@supabase/supabase-js` client works identically — only the URL and keys change in `.env`.

2. **User Passwords Preserved**: Auth users are exported with hashed passwords. No password resets needed.

3. **RLS Intact**: All Row-Level Security policies transfer with `pg_dump`. Your data protection rules remain enforced.

4. **M-Pesa**: Remember to update the callback URL in both `mpesa_settings` DB table AND your Safaricom developer portal.

5. **AI Features**: The `LOVABLE_API_KEY` secret is needed for AI-powered features (search, listing generation, price suggestions). Ensure it's set in edge function environment variables.

6. **Monitoring**: Consider adding uptime monitoring (UptimeRobot, Hetrixtools) and server monitoring (Netdata, Grafana).

---

*Last updated: February 2026*
