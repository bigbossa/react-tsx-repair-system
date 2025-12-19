-- ลบ unique constraint จาก asset_code เพื่อให้สามารถซ้ำได้

-- ลบ unique constraint
ALTER TABLE public."Assets" 
DROP CONSTRAINT IF EXISTS "Assets_asset_code_key";

-- ลบ unique index (ถ้ามี)
DROP INDEX IF EXISTS public."Assets_asset_code_key";

-- Comment
COMMENT ON COLUMN public."Assets".asset_code IS 'รหัสทรัพย์สิน (สามารถซ้ำได้)';

-- ตรวจสอบผลลัพธ์
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public."Assets"'::regclass
  AND conname LIKE '%asset_code%';
