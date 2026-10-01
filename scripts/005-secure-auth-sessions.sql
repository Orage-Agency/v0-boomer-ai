-- Secure mobile/web account sessions. Apply before deploying the new auth routes.
-- New passwords are stored as scrypt hashes; existing plaintext hashes are
-- upgraded after the user's next successful login.

ALTER TABLE boomer_users
  ALTER COLUMN password_hash TYPE VARCHAR(255);

CREATE TABLE IF NOT EXISTS boomer_auth_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES boomer_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boomer_auth_sessions_user_id
  ON boomer_auth_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_boomer_auth_sessions_expiry
  ON boomer_auth_sessions(expires_at)
  WHERE revoked_at IS NULL;
