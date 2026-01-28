-- Create checklist_drafts table for storing unfinished checklist drafts
-- Allows users to continue their work from other devices

CREATE TABLE IF NOT EXISTS checklist_drafts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  asset_code VARCHAR(255) NOT NULL,
  draft_data JSONB NOT NULL,  -- Stores { items: boolean[], remarks: string }
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint to prevent duplicate drafts for same user and asset
  CONSTRAINT unique_user_asset UNIQUE (username, asset_code)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_checklist_drafts_username ON checklist_drafts(username);
CREATE INDEX IF NOT EXISTS idx_checklist_drafts_asset_code ON checklist_drafts(asset_code);
CREATE INDEX IF NOT EXISTS idx_checklist_drafts_updated_at ON checklist_drafts(updated_at DESC);

-- Add table and column comments
COMMENT ON TABLE checklist_drafts IS 'Stores MA checklist drafts that users can continue from any device';
COMMENT ON COLUMN checklist_drafts.username IS 'Username who created the draft';
COMMENT ON COLUMN checklist_drafts.asset_code IS 'Asset code being checked';
COMMENT ON COLUMN checklist_drafts.draft_data IS 'Draft data in JSON format: { items: boolean[], remarks: string }';
