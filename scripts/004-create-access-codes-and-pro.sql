-- Adds Pro entitlement tracking + revocable bypass / access codes.
-- Used by /api/redeem and /api/auth/me.

ALTER TABLE boomer_users
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pro_source VARCHAR(32),
  ADD COLUMN IF NOT EXISTS pro_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE;

-- Bypass / off-store-paying-customer codes.
CREATE TABLE IF NOT EXISTS boomer_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    plan VARCHAR(32) NOT NULL DEFAULT 'pro',
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_boomer_access_codes_code ON boomer_access_codes(code);

-- Per-user redemption log (so we can revoke + see who used what).
CREATE TABLE IF NOT EXISTS boomer_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id UUID NOT NULL REFERENCES boomer_access_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES boomer_users(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_boomer_code_redemptions_user ON boomer_code_redemptions(user_id);
