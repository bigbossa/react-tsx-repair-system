-- เพิ่มคอลัมน์สำหรับเก็บประวัติเหตุผลที่ประเมินไม่ผ่าน
-- Comment_re  = เหตุผลรอบล่าสุด
-- Comment_re2 = เหตุผลรอบก่อนหน้า
-- Comment_re3 = เหตุผลรอบแรกสุด

ALTER TABLE public.repairrequest 
ADD COLUMN IF NOT EXISTS "Comment_re2" TEXT,
ADD COLUMN IF NOT EXISTS "Comment_re3" TEXT;

-- ตรวจสอบว่าเพิ่มสำเร็จ
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repairrequest' 
AND column_name LIKE '%omment%'
ORDER BY column_name;
