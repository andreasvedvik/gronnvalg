-- Supabase Schema for Grønnest Familie-modus
-- Run this in your Supabase SQL Editor to set up the database

-- Create shared_lists table
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL DEFAULT 'Handleliste',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  share_code TEXT NOT NULL UNIQUE
);

-- Create index for faster share_code lookups
CREATE INDEX IF NOT EXISTS idx_shared_lists_share_code ON shared_lists(share_code);

-- Enable Row Level Security
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared lists (they need the share code)
CREATE POLICY "Anyone can read shared lists"
  ON shared_lists
  FOR SELECT
  USING (true);

-- Allow anyone to create shared lists
CREATE POLICY "Anyone can create shared lists"
  ON shared_lists
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update shared lists (in a real app, you'd want more restrictions)
CREATE POLICY "Anyone can update shared lists"
  ON shared_lists
  FOR UPDATE
  USING (true);

-- Allow anyone to delete shared lists
CREATE POLICY "Anyone can delete shared lists"
  ON shared_lists
  FOR DELETE
  USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE shared_lists;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_shared_lists_updated_at
  BEFORE UPDATE ON shared_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
