-- Add IP address column to conversations table for tracking
ALTER TABLE boomer_conversations 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Add index for faster IP-based queries
CREATE INDEX IF NOT EXISTS idx_conversations_ip ON boomer_conversations(ip_address);
