-- Create boomer_profiles table for storing user profiles
CREATE TABLE IF NOT EXISTS boomer_profiles (
  device_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on device_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_boomer_profiles_device_id ON boomer_profiles(device_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boomer_profiles_updated_at BEFORE UPDATE ON boomer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
