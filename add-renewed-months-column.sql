-- Add renewed_months column to subscription_expiry table
ALTER TABLE subscription_expiry 
ADD COLUMN IF NOT EXISTS renewed_months INTEGER DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'subscription_expiry' 
  AND column_name = 'renewed_months';
