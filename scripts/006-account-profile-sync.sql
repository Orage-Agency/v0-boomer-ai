-- Link anonymous device profiles and conversation history to shared accounts.
-- Run after scripts/005-secure-auth-sessions.sql.

ALTER TABLE boomer_profiles
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES boomer_users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_boomer_profiles_account_id
  ON boomer_profiles(account_id)
  WHERE account_id IS NOT NULL;

ALTER TABLE boomer_conversations
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES boomer_users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_boomer_conversations_account_id
  ON boomer_conversations(account_id)
  WHERE account_id IS NOT NULL;

-- Allow a person to use the same install with more than one account while
-- retaining the old anonymous per-device uniqueness behavior.
ALTER TABLE boomer_conversations
  DROP CONSTRAINT IF EXISTS boomer_conversations_device_id_title_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_boomer_conversations_anon_device_title
  ON boomer_conversations(device_id, title)
  WHERE account_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_boomer_conversations_account_device_title
  ON boomer_conversations(account_id, device_id, title)
  WHERE account_id IS NOT NULL;
