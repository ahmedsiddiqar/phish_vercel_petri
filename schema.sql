-- ============================================================
-- Petridish Phishing Awareness Tracker - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: campaigns (tracked links)
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE
);

-- Table: clicks (log of everyone who clicked)
CREATE TABLE clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Index for fast lookups
CREATE INDEX idx_clicks_campaign_id ON clicks(campaign_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public INSERT on clicks (for tracking)
CREATE POLICY "Allow public insert on clicks"
  ON clicks FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Policies: Allow public SELECT on campaigns by slug (for landing page)
CREATE POLICY "Allow public select campaigns by slug"
  ON campaigns FOR SELECT
  TO anon
  USING (is_active = TRUE);

-- Policies: Allow service role full access (for admin API)
CREATE POLICY "Service role full access campaigns"
  ON campaigns FOR ALL
  TO service_role
  USING (TRUE);

CREATE POLICY "Service role full access clicks"
  ON clicks FOR ALL
  TO service_role
  USING (TRUE);

-- Seed one default campaign
INSERT INTO campaigns (name, description, slug)
VALUES (
  'Q1 2025 Security Awareness',
  'Quarterly phishing simulation for all employees',
  'q1-security-2025'
);
