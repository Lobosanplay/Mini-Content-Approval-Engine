-- ============================================================
--  Frameloop — Migration: Multi-URL, Multi-Assignee, Expiry
--  Run this in your Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Add multi-URL support (JSONB array)
ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single URL to array
UPDATE content_pieces 
SET video_urls = jsonb_build_array(video_url)
WHERE video_url IS NOT NULL AND (video_urls IS NULL OR video_urls = '[]'::jsonb);

-- 2. Add description column if missing
ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Add assigned_to / assigned_by columns if missing
ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Add expiry and view tracking columns
ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS max_views INT DEFAULT 3;

-- Update existing rows to have expiry
UPDATE content_pieces 
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

-- 5. Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'admin')),
  full_name  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Create content_assignees junction table
CREATE TABLE IF NOT EXISTS content_assignees (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id     UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_responded  BOOLEAN DEFAULT FALSE,
  responded_at   TIMESTAMPTZ,
  UNIQUE(content_id, user_id)
);

ALTER TABLE content_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their assignments" ON content_assignees;
DROP POLICY IF EXISTS "Creators can manage assignments" ON content_assignees;
DROP POLICY IF EXISTS "Assignees can update their response" ON content_assignees;

CREATE POLICY "Users can view their assignments"
  ON content_assignees FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM content_pieces
      WHERE id = content_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage assignments"
  ON content_assignees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content_pieces
      WHERE id = content_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Assignees can update their response"
  ON content_assignees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('assigned', 'approved', 'rejected', 'feedback_added')),
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. Enable realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE content_assignees;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
