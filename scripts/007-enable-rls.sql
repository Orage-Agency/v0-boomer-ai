-- Enable default-deny row security on every table used by the current app.
-- The web and mobile clients access Postgres only through the server API.
-- The current server connection uses neondb_owner (BYPASSRLS), so ownership
-- checks remain enforced in the API; other database roles see no rows until
-- explicit policies are added for them.

ALTER TABLE boomer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_users FORCE ROW LEVEL SECURITY;

ALTER TABLE boomer_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_auth_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE boomer_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_access_codes FORCE ROW LEVEL SECURITY;

ALTER TABLE boomer_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_code_redemptions FORCE ROW LEVEL SECURITY;

ALTER TABLE boomer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE boomer_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_conversations FORCE ROW LEVEL SECURITY;
