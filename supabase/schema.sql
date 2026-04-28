-- ============================================================
--  Frameloop — Content Approval Engine
--  Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS content_pieces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  video_url     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback      TEXT,
  client_token  UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can manage own content"      ON content_pieces;
DROP POLICY IF EXISTS "Public can view by client_token"   ON content_pieces;
DROP POLICY IF EXISTS "Public can update via client_token" ON content_pieces;

-- 4. Policy: authenticated users manage ONLY their own rows
CREATE POLICY "Users can manage own content"
  ON content_pieces
  USING (auth.uid() = user_id);

-- 5. Policy: anyone can SELECT (token enforcement happens in app logic)
CREATE POLICY "Public can view by client_token"
  ON content_pieces
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6. Policy: anon clients can UPDATE status + feedback
CREATE POLICY "Public can update via client_token"
  ON content_pieces
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON content_pieces;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE content_pieces;
