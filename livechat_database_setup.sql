-- =========================================================================
-- LIVE CHAT DATABASE SETUP — KOTACOFFEE
-- =========================================================================

-- 1. Create live_chats table
CREATE TABLE IF NOT EXISTS live_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE live_chats ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone (anon/authenticated) can insert messages
CREATE POLICY "Allow public insert on live_chats" 
ON live_chats FOR INSERT 
TO public 
WITH CHECK (true);

-- 4. Policy: Anyone can read messages
CREATE POLICY "Allow public read on live_chats" 
ON live_chats FOR SELECT 
TO public 
USING (true);

-- Note: We allow public read for now so the live chat works without login, 
-- but in production we might want to restrict reading to only the user's own session ID and admins.
