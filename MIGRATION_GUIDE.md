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

> ⚠️ **Lovable Cloud Limitation:** You do NOT have access to a database connection string or `pg_dump`. Instead, export your data using the **SQL Editor** in the Lovable Cloud panel, which outputs CSV files per table.

#### Step 1: Export Schema (DDL)

Run this query in the Lovable Cloud SQL Editor to get your full schema DDL:

```sql
SELECT 
  'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || ' ();' as ddl
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

> 💡 **Better approach:** Your schema is already defined in your `supabase/migrations/` folder in the GitHub repo. Apply all migration files in order to your self-hosted Supabase to recreate the exact schema, functions, triggers, and RLS policies:

```bash
# On your VPS, after setting up self-hosted Supabase:
cd /opt/app
for f in supabase/migrations/*.sql; do
  echo "Applying: $f"
  psql -h localhost -p 5432 -U postgres -d postgres -f "$f"
done
```

#### Step 2: Export Table Data as CSV

For each table, run in the Lovable Cloud SQL Editor and use the **Export** button to download CSV:

```sql
-- Export each table one by one:
SELECT * FROM base_listings;
SELECT * FROM profiles;
SELECT * FROM vehicle_listings;
SELECT * FROM property_listings;
SELECT * FROM job_listings;
SELECT * FROM electronics_listings;
-- ... repeat for all tables listed in Section 3.6
```

> 📝 **Note:** The SQL Editor may have a row limit. For large tables, use pagination:
> ```sql
> SELECT * FROM base_listings ORDER BY created_at LIMIT 1000 OFFSET 0;
> SELECT * FROM base_listings ORDER BY created_at LIMIT 1000 OFFSET 1000;
> -- Continue until no more rows
> ```

#### Step 3: Export Database Functions

Run this in the SQL Editor to get all function definitions:

```sql
SELECT pg_get_functiondef(oid) || ';' as function_def
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;
```

Copy the output and save as `functions_export.sql`.

#### Step 4: Export RLS Policies

```sql
SELECT 
  'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename ||
  ' FOR ' || cmd ||
  CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
  CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
  ';' as policy_ddl
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Copy the output and save as `rls_policies.sql`.

#### Step 5: Export Triggers

```sql
SELECT pg_get_triggerdef(oid) || ';' as trigger_def
FROM pg_trigger
WHERE tgrelid IN (
  SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace
)
AND NOT tgisinternal
ORDER BY tgname;
```

### 3.5 Import Database to Self-Hosted Supabase

#### Option A: Apply Migrations from GitHub Repo (Recommended)

Your GitHub repo already contains all schema definitions in `supabase/migrations/`. This is the cleanest approach:

```bash
cd /opt/app

# Apply all migrations in order
for f in $(ls supabase/migrations/*.sql | sort); do
  echo "Applying migration: $f"
  psql -h localhost -p 5432 -U postgres -d postgres -f "$f"
done
```

#### Option B: Import Functions & Policies from SQL Editor Export

```bash
# If you exported functions and policies separately:
psql -h localhost -p 5432 -U postgres -d postgres -f functions_export.sql
psql -h localhost -p 5432 -U postgres -d postgres -f rls_policies.sql
```

#### Import CSV Data

For each CSV file exported from the SQL Editor:

```bash
# Import CSV files into tables
# Make sure tables exist first (via migrations above)

psql -h localhost -p 5432 -U postgres -d postgres -c "
  COPY base_listings FROM '/path/to/base_listings.csv' WITH (FORMAT csv, HEADER true);
"

psql -h localhost -p 5432 -U postgres -d postgres -c "
  COPY profiles FROM '/path/to/profiles.csv' WITH (FORMAT csv, HEADER true);
"

# Repeat for each table...
```

> 💡 **Tip:** If COPY fails due to column ordering, use a helper script:
> ```bash
> # For each CSV, import with explicit column mapping
> psql -h localhost -p 5432 -U postgres -d postgres -c "\copy base_listings FROM '/path/to/base_listings.csv' CSV HEADER"
> ```

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

> ⚠️ **Lovable Cloud Limitation:** You do NOT have access to the `SERVICE_ROLE_KEY`, so the programmatic export script won't work for private buckets. Use the methods below instead.

#### Method A: Download Public Files via URL (Listings & Blog)

For **public** buckets (`listings`, `blog`), files are accessible via direct URLs. First, get the file list from the SQL Editor:

```sql
-- Get all storage file paths
SELECT bucket_id, name, created_at
FROM storage.objects
WHERE bucket_id IN ('listings', 'blog')
ORDER BY bucket_id, name;
```

Then download them using the public URL pattern:

```bash
mkdir -p storage-export/listings storage-export/blog

# Public files can be downloaded directly:
# Pattern: https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/{bucket}/{path}

# Example using wget with a file list:
while IFS= read -r filepath; do
  wget -q "https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/listings/$filepath" \
    -O "storage-export/listings/$filepath"
done < listings_files.txt
```

#### Method B: Download from Lovable Cloud Storage Panel (All Buckets)

For **private** buckets (`verifications`, `resumes`, `messages`):

1. Open the **Lovable Cloud** panel → **Storage** section
2. Navigate to each bucket
3. Download files manually (or in batches if the UI supports it)
4. Organize them locally in the same folder structure:

```
storage-export/
├── listings/
├── blog/
├── verifications/
├── resumes/
└── messages/
```

#### Method C: Export Using Anon Key (Public Buckets Only)

For public buckets, you can use the anon key:

```javascript
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  "https://pookcecmoirdsavrgcmb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2tjZWNtb2lyZHNhdnJnY21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDA2NzQsImV4cCI6MjA4NTQ3NjY3NH0.YzM6kMu9T4GLZWWQ5C9GZfYfz0gxBB7lNrDlrQnpy8g"
);

const PUBLIC_BUCKETS = ["listings", "blog"];

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
    if (file.id === null) continue;
    
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
  console.log("🚀 Starting public storage export...\n");
  for (const bucket of PUBLIC_BUCKETS) {
    await exportBucket(bucket);
  }
  console.log("\n✅ Public storage export complete!");
  console.log("⚠️  Private buckets (verifications, resumes, messages) must be downloaded manually from the Lovable Cloud Storage panel.");
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

> ⚠️ **Lovable Cloud Limitation:** You do NOT have access to `pg_dump` or the database connection string. Use the SQL Editor to export auth user data.

#### Export via SQL Editor

Run these queries in the Lovable Cloud SQL Editor and export the results as CSV:

```sql
-- Export auth users (contains hashed passwords - they'll work as-is on import)
SELECT id, instance_id, aud, role, email, encrypted_password, 
       email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
       recovery_token, recovery_sent_at, email_change_token_new, email_change,
       email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
       is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
       phone_change, phone_change_token, phone_change_sent_at, 
       email_change_token_current, email_change_confirm_status, banned_until,
       reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at,
       is_anonymous
FROM auth.users;

-- Export auth identities
SELECT id, user_id, identity_data, provider, provider_id, 
       last_sign_in_at, created_at, updated_at
FROM auth.identities;
```

#### Import Auth Users to Self-Hosted Supabase

Save the exported CSVs, then import:

```bash
# Import users
psql -h localhost -p 5432 -U postgres -d postgres -c "\copy auth.users FROM '/path/to/auth_users.csv' CSV HEADER"

# Import identities  
psql -h localhost -p 5432 -U postgres -d postgres -c "\copy auth.identities FROM '/path/to/auth_identities.csv' CSV HEADER"
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

## 13. Logs & Monitoring Migration

### 13.1 Database Logs (PostgreSQL)

Self-hosted Supabase automatically logs all PostgreSQL activity. Configure log retention:

```bash
# Edit PostgreSQL config in Docker
docker exec -it supabase-db bash -c "cat >> /etc/postgresql/postgresql.conf << 'EOF'

# Logging configuration
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000   # Log queries taking >1s
log_statement = 'mod'               # Log INSERT/UPDATE/DELETE
log_connections = on
log_disconnections = on
EOF"

# Restart database
docker compose restart supabase-db
```

### 13.2 Auth Logs (GoTrue)

Auth logs are output by the GoTrue container. View and persist them:

```bash
# View live auth logs
docker compose logs -f supabase-auth

# Persist auth logs to file
docker compose logs supabase-auth > /opt/backups/logs/auth_$(date +%Y%m%d).log
```

Configure GoTrue log level in `.env`:

```env
GOTRUE_LOG_LEVEL=info    # Options: debug, info, warn, error
```

### 13.3 Edge Function Logs

If using Deno standalone (Option A from Section 6):

```bash
# Logs are captured by systemd journal
journalctl -u edge-functions -f

# Export logs
journalctl -u edge-functions --since "2026-02-01" --until "2026-02-28" > /opt/backups/logs/edge_feb2026.log
```

If using Supabase Edge Runtime (Option B):

```bash
docker compose logs -f supabase-functions
```

### 13.4 API Gateway / Network Logs (Kong)

Kong logs all API requests (equivalent to Lovable Cloud network logs):

```bash
# View API request logs
docker compose logs -f supabase-kong

# These include:
# - HTTP method, path, status code
# - Response time
# - Client IP
# - Auth token presence
```

### 13.5 Storage Logs

```bash
docker compose logs -f supabase-storage
```

### 13.6 Realtime Logs

```bash
docker compose logs -f supabase-realtime
```

### 13.7 Centralized Log Management (Recommended)

For production, set up centralized logging:

```bash
# Option A: Loki + Grafana (lightweight)
# Add to docker-compose.override.yml:
cat > /opt/supabase/supabase/docker/docker-compose.override.yml << 'EOF'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your_grafana_password
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  loki-data:
  grafana-data:
EOF

docker compose up -d loki grafana
```

```bash
# Option B: Simple log rotation with logrotate
cat > /etc/logrotate.d/supabase << 'EOF'
/opt/backups/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
}
EOF
```

### 13.8 Automated Log Export Cron

```bash
cat > /opt/scripts/export-logs.sh << 'SCRIPT'
#!/bin/bash
set -e
LOG_DIR="/opt/backups/logs"
DATE=$(date +%Y%m%d)
mkdir -p "$LOG_DIR"

docker compose -f /opt/supabase/supabase/docker/docker-compose.yml logs --since 24h supabase-auth > "$LOG_DIR/auth_${DATE}.log" 2>&1
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml logs --since 24h supabase-kong > "$LOG_DIR/api_${DATE}.log" 2>&1
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml logs --since 24h supabase-db > "$LOG_DIR/db_${DATE}.log" 2>&1
docker compose -f /opt/supabase/supabase/docker/docker-compose.yml logs --since 24h supabase-storage > "$LOG_DIR/storage_${DATE}.log" 2>&1

# Compress logs older than 7 days
find "$LOG_DIR" -name "*.log" -mtime +7 -exec gzip {} \;
# Delete compressed logs older than 90 days
find "$LOG_DIR" -name "*.log.gz" -mtime +90 -delete

echo "✅ Logs exported: ${DATE}"
SCRIPT

chmod +x /opt/scripts/export-logs.sh

# Add to cron (daily at 4 AM)
echo "0 4 * * * /opt/scripts/export-logs.sh >> /var/log/log-export.log 2>&1" >> /etc/crontab
```

---

## 14. Secrets Migration

### 14.1 Current Secrets Inventory

| Secret | Purpose | Where Used |
|--------|---------|-----------|
| `SUPABASE_URL` | API endpoint | Edge functions |
| `SUPABASE_ANON_KEY` | Public API key | Frontend + Edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key (⚠️ private) | Edge functions only |
| `SUPABASE_DB_URL` | Direct DB connection | Edge functions |
| `SUPABASE_PUBLISHABLE_KEY` | Same as anon key | Frontend |
| `LOVABLE_API_KEY` | AI features | Edge functions |

### 14.2 Secrets on Self-Hosted VPS

On a self-hosted VPS, secrets are managed as environment variables:

```bash
# Create secrets file (restricted permissions)
cat > /opt/supabase/.secrets << 'EOF'
SUPABASE_URL=https://api.yourdomain.com
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
SUPABASE_DB_URL=postgresql://postgres:your_password@localhost:5432/postgres
LOVABLE_API_KEY=your-lovable-api-key
EOF

# Secure the file
chmod 600 /opt/supabase/.secrets
chown root:root /opt/supabase/.secrets
```

Load in systemd services:

```ini
# In edge-functions.service
[Service]
EnvironmentFile=/opt/supabase/.secrets
```

> ⚠️ **NEVER** commit `.secrets` to git. Add it to `.gitignore`.

---

## 15. Realtime Migration

### 15.1 Realtime Tables

The following tables use Supabase Realtime for live updates:

```sql
-- Verify which tables have realtime enabled
SELECT * FROM supabase_realtime.subscription;
```

### 15.2 Enable Realtime on Self-Hosted

```sql
-- Re-enable realtime for required tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### 15.3 Verify Realtime Works

```bash
# Check realtime container is healthy
docker compose logs supabase-realtime | tail -20

# Test WebSocket connection
# Open browser console on your deployed site:
# You should see realtime events when messages/notifications are created
```

---

## 16. User Roles & Admin Access

### 16.1 Verify Admin Roles Migrated

```sql
-- Check user_roles table
SELECT ur.user_id, ur.role, p.display_name, au.email
FROM user_roles ur
JOIN profiles p ON p.user_id = ur.user_id
JOIN auth.users au ON au.id = ur.user_id
ORDER BY ur.role;
```

### 16.2 Expected Admin Accounts

| Email | Role | Purpose |
|-------|------|---------|
| `waynegraphicsdesigns@gmail.com` | Super Admin | Primary admin |
| `ahem58@gmail.com` | Admin | Secondary admin |

### 16.3 Security Functions Verification

```sql
-- Test is_admin function
SELECT is_admin('admin-user-uuid-here');  -- Should return true

-- Test has_role function  
SELECT has_role('admin-user-uuid-here', 'admin');  -- Should return true

-- Verify safe_profiles view works
SELECT * FROM safe_profiles LIMIT 5;
-- Phone/WhatsApp should be NULL for non-owner/non-admin queries
```

---

## Important Notes

1. **Zero Frontend Code Changes**: By self-hosting Supabase, the `@supabase/supabase-js` client works identically — only the URL and keys change in `.env`.

2. **User Passwords Preserved**: Auth users are exported with hashed passwords. No password resets needed.

3. **RLS Intact**: All Row-Level Security policies transfer with `pg_dump`. Your data protection rules remain enforced.

4. **M-Pesa**: Remember to update the callback URL in both `mpesa_settings` DB table AND your Safaricom developer portal.

5. **AI Features**: The `LOVABLE_API_KEY` secret is needed for AI-powered features (search, listing generation, price suggestions). Ensure it's set in edge function environment variables.

6. **Monitoring**: Consider adding uptime monitoring (UptimeRobot, Hetrixtools) and server monitoring (Netdata, Grafana).

7. **Logs**: All log types from Lovable Cloud (DB, Auth, Edge Functions, API/Network, Storage) have equivalents via Docker container logs. Use Grafana/Loki for a dashboard experience similar to Lovable Cloud logs.

8. **Secrets Security**: On VPS, secrets are stored as environment files with `chmod 600`. Never expose `SERVICE_ROLE_KEY` in frontend code.

---

*Last updated: February 2026*
