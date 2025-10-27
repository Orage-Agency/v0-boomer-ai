-- Create conversations table for chat history
CREATE TABLE IF NOT EXISTS boomer_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  messages JSONB NOT NULL,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(device_id, title)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_device_id ON boomer_conversations(device_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON boomer_conversations(updated_at DESC);
