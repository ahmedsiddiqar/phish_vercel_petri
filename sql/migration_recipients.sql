-- ============================================================
-- Migration: Add per-person recipient tracking
-- Run this in your Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Table: recipients (one row per employee per campaign)
CREATE TABLE recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  clicked_at TIMESTAMPTZ DEFAULT NULL,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipients_campaign_id ON recipients(campaign_id);
CREATE INDEX idx_recipients_token ON recipients(token);
CREATE INDEX idx_recipients_email ON recipients(email);

-- RLS
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- Public can read by token (for tracking page lookup)
CREATE POLICY "Public read recipient by token"
  ON recipients FOR SELECT
  TO anon
  USING (TRUE);

-- Public can update click info (for tracking)
CREATE POLICY "Public update recipient click"
  ON recipients FOR UPDATE
  TO anon
  USING (TRUE);

-- Service role full access
CREATE POLICY "Service role full access recipients"
  ON recipients FOR ALL
  TO service_role
  USING (TRUE);

-- Add recipient_id column to clicks table
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES recipients(id) ON DELETE SET NULL;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS recipient_email TEXT;
