# Phishing Simulation — Next.js for Vercel

Converted from Streamlit. Full-stack Next.js app with API routes and Supabase.

## Project Structure

```
pages/
  index.tsx          # Warning / education page  (?token=...&email=...)
  admin.tsx          # Admin dashboard           (/admin)
  api/
    track.ts         # Logs clicks
    recipient.ts     # Fetches a single recipient
    admin/
      recipients.ts  # GET all recipients (password-protected)
      add-recipients.ts # POST — bulk add + generate links
      clear.ts       # POST — wipe all data
lib/
  supabase.ts        # Supabase helpers + business logic
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create phishing-sim --public --push
```

### 2. Import in Vercel
Go to https://vercel.com/new → Import your repo.

### 3. Add Environment Variables
In Vercel → Settings → Environment Variables, add:

| Name             | Value                          |
|------------------|--------------------------------|
| SUPABASE_URL     | https://xxxx.supabase.co       |
| SUPABASE_KEY     | your-supabase-key              |
| ADMIN_PASSWORD   | your-secure-password           |

### 4. Supabase Tables
Run this SQL in Supabase → SQL Editor:

```sql
create table if not exists recipients (
  id         bigserial primary key,
  token      text unique not null,
  email      text not null,
  campaign   text,
  clicked    boolean default false,
  click_ts   timestamptz,
  source     text,
  added_ts   timestamptz default now()
);

create table if not exists events (
  id          bigserial primary key,
  token       text,
  email_param text,
  event_type  text,
  ts          timestamptz default now()
);
```

## Usage

| URL                              | Purpose                        |
|----------------------------------|--------------------------------|
| `/`                              | Landing (no tracking params)   |
| `/?token=abc123`                 | Token tracking                 |
| `/?email=budi@co.com`            | Email tracking                 |
| `/?token=abc123&email=budi@...`  | Both (recommended)             |
| `/admin`                         | Admin dashboard                |

## Changing the Admin Password
Set `ADMIN_PASSWORD` in Vercel environment variables. It is hashed server-side with SHA-256.
Never commit `.env` files.
