---
name: supabase-builder
description: >
  Designs a complete, production-ready Supabase backend plan for a new app.
  Use this skill at the start of any project that will use Supabase as its backend.
  Covers tables, fields, relationships, auth model, RLS policies, storage buckets,
  edge functions, and environment variables. Optimized for solo builders and small teams
  using Supabase with Lovable, Cursor, ActivePieces, or Antigravity.
---

# Supabase Builder Skill

## When to Use
- Starting a new project that will use Supabase as the backend
- Need to design the database schema before writing any code or prompts
- Want to plan RLS policies and auth model before users touch real data
- Planning storage needs for file uploads, images, or documents
- Identifying which edge functions are needed vs. what can be done client-side
- Setting up a new Supabase project and need a full env var checklist

## Step-by-Step Instructions

### Step 1 — Understand the App
Confirm the following before designing anything:
- What does the app do? (core use case)
- Who are the user types? (e.g. admin, end user, guest, org member)
- Is this single-tenant or multi-tenant?
- Will users belong to organizations/teams, or is it individual accounts?
- What is the primary data entity? (e.g. job applications, leads, invoices, messages)

### Step 2 — Design the Table Schema
For each table, define:
- **Table name** (snake_case, plural)
- **Primary key** (default: `id uuid DEFAULT uuid_generate_v4()`)
- **All fields** with name, type, nullable status, and default value
- **Timestamps**: always include `created_at` and `updated_at`
- **Foreign keys**: which tables reference each other
- **Indexes**: any fields that will be frequently filtered or joined on

Group tables by domain:
- **Auth / Users** (profiles, roles, org members)
- **Core Data** (primary entities the app operates on)
- **Supporting Data** (lookups, tags, audit logs, config)
- **Billing** (if applicable)

### Step 3 — Define Relationships
Map out all foreign key relationships with direction and cardinality:
- One-to-one (e.g. user → profile)
- One-to-many (e.g. user → job_applications)
- Many-to-many (e.g. tags ↔ resumes via resume_tags junction table)

### Step 4 — Design the Auth Model
Define:
- **Auth strategy**: email/password, magic link, OAuth (Google, GitHub, etc.)
- **User identity**: how `auth.users` maps to the `profiles` table
- **User roles**: how roles are stored (column on profiles, separate roles table, or Supabase custom claims)
- **Multi-tenancy**: if organizations exist, how users belong to orgs and how data is scoped

### Step 5 — Write RLS Policies
For each table, define Row Level Security policies:
- **SELECT**: who can read rows (e.g. "users can only read their own rows")
- **INSERT**: who can create rows (e.g. "authenticated users only")
- **UPDATE**: who can modify rows (e.g. "owner or admin only")
- **DELETE**: who can delete rows (e.g. "admin only" or "owner only")

Flag any table where RLS is intentionally disabled and explain why (e.g. public lookup tables).

Use this format for each policy:
```sql
-- [table_name]: [policy description]
CREATE POLICY "[policy_name]" ON [table_name]
  FOR [SELECT|INSERT|UPDATE|DELETE]
  USING ([condition]);
```

### Step 6 — Define Storage Buckets
For each bucket:
- **Bucket name**: descriptive, kebab-case
- **Access type**: public or private
- **Who can upload**: authenticated users, admins only, service role only
- **File types allowed**: images, PDFs, documents, etc.
- **Max file size** (if applicable)
- **Folder structure convention** (e.g. `user_id/filename.pdf`)

### Step 7 — Plan Edge Functions
For each edge function:
- **Function name**: kebab-case
- **Trigger**: HTTP webhook, scheduled cron, or called from client
- **What it does**: one sentence description
- **Why it can't be client-side**: reason (e.g. requires secret key, heavy processing, third-party API)
- **Input**: what data it receives
- **Output**: what it returns

### Step 8 — List Environment Variables
Compile all environment variables the project will need. Separate by category:

- **Supabase**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Auth providers**: OAuth client IDs and secrets
- **Third-party APIs**: any API keys needed by edge functions
- **App config**: feature flags, app URL, environment (dev/prod)

---

## Output Structure

```
## 🗄️ Database Schema

### Auth / Users
#### `profiles`
| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| id | uuid | NO | references auth.users | PK, FK |
| email | text | NO | — | |
| full_name | text | YES | — | |
| role | text | NO | 'user' | 'user' or 'admin' |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

### Core Data
#### `[table_name]`
...

### Supporting Data
#### `[table_name]`
...

---

## 🔗 Relationships
- `profiles` 1 → many `[table]` via `user_id`
- `[table_a]` many ↔ many `[table_b]` via `[junction_table]`

---

## 🔐 Auth Model
- **Strategy**: [email/password + magic link, Google OAuth, etc.]
- **Identity**: `auth.users.id` maps to `profiles.id` via trigger on signup
- **Roles**: stored as `profiles.role` column ['user', 'admin']
- **Multi-tenant**: [yes/no — description of org model if applicable]

---

## 🛡️ RLS Policies

### `[table_name]`
```sql
-- Users can read their own rows
CREATE POLICY "users_read_own" ON [table_name]
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own rows
CREATE POLICY "users_insert_own" ON [table_name]
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🪣 Storage Buckets

| Bucket | Access | Uploader | File Types | Structure |
|--------|--------|----------|------------|-----------|
| [name] | public/private | [who] | [types] | [path pattern] |

---

## ⚡ Edge Functions

| Function | Trigger | Purpose | Why Server-Side |
|----------|---------|---------|-----------------|
| [name] | HTTP/Cron | [description] | [reason] |

---

## 🔑 Environment Variables

### Supabase Core
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Auth Providers
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Third-Party APIs
```
[API_NAME]_API_KEY=
```

### App Config
```
APP_URL=
NODE_ENV=development
```

---

## 🚀 Setup Checklist
- [ ] Create Supabase project
- [ ] Run all table creation SQL
- [ ] Enable RLS on all tables
- [ ] Create storage buckets with correct policies
- [ ] Deploy edge functions
- [ ] Set all environment variables in Supabase dashboard + local .env
- [ ] Create auth provider connections (OAuth apps)
- [ ] Add `handle_new_user()` trigger for profiles table
- [ ] Test auth flow end-to-end
- [ ] Verify RLS blocks unauthorized access
```

## Quality Rules
- Every table must have `id`, `created_at`, and `updated_at`
- Every table that stores user data must have a `user_id` FK to `profiles.id`
- RLS must be enabled on every table that contains user or org data — no exceptions without explanation
- Edge functions should only be planned when client-side is genuinely insufficient
- Storage bucket access must be explicitly defined — never leave as default
- Environment variables must be split between public (anon key, app URL) and secret (service role key, API keys)
- The setup checklist must be in the correct dependency order (no edge function before tables exist)
