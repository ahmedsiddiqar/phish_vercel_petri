# 🎣 Petridish Phishing Awareness Tracker

A Next.js app for running internal phishing simulations. Deploy to Vercel, connect to Supabase, and start tracking who clicks your test links.

---

## 🚀 Setup Guide

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Once created, go to **SQL Editor**
3. Paste and run the contents of `sql/schema.sql`
4. Copy your project credentials from **Settings → API**:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)

---

### 2. Deploy to Vercel

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ADMIN_PASSWORD` | A strong password for the admin panel |

4. Deploy!

---

### 3. Using the App

#### Admin Panel
Visit `https://your-domain.vercel.app/admin`

- Log in with your `ADMIN_PASSWORD`
- **Create campaigns** — give each simulation a name and slug
- **Copy tracking links** — e.g. `https://your-domain.vercel.app/t/it-alert-q2`
- **Send the link** to employees in a phishing test email
- **View who clicked** with timestamps, IP addresses, and browser info

#### Tracking Links
Each link follows the pattern: `/t/[slug]`

When an employee clicks:
1. Their visit is logged to Supabase (IP, user agent, timestamp, referrer)
2. They see a brief "loading" animation
3. Then a reveal: **"You just got phished"**
4. Then the full phishing awareness education page

---

## 📁 Project Structure

```
pages/
  index.jsx          — Blank landing (nothing to see here)
  admin.jsx          — Admin dashboard
  t/[slug].jsx       — Tracking + awareness page
  api/
    track.js         — POST: log a click
    campaigns.js     — GET/POST/PATCH/DELETE campaigns
    clicks.js        — GET: fetch clicks for a campaign
lib/
  supabase.js        — Supabase client setup
sql/
  schema.sql         — Run this in Supabase SQL Editor
```

---

## 🔒 Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is **server-side only** — never use it in client code
- The admin panel uses a simple password header. For production, consider upgrading to proper auth (Supabase Auth, NextAuth, etc.)
- IP addresses are logged for awareness purposes — ensure this complies with your company's privacy policy
- RLS policies prevent unauthorized data access at the database level

---

## 📧 Example Phishing Email Template

```
Subject: [URGENT] Action Required — IT Security Update

Hi [Name],

We've detected unusual activity on your Petridish account.
Please verify your identity immediately:

→ Click here to verify: https://your-domain.vercel.app/t/it-alert-q2

Failure to verify within 24 hours may result in account suspension.

IT Security Team
Petridish
```
