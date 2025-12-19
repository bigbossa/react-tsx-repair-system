-- เพิ่มคอลัมน์ form_type ในตาราง repairrequest
-- ใช้คำสั่งนี้ใน pgAdmin หรือ psql

ALTER TABLE repairrequest 
ADD COLUMN form_type VARCHAR(20) DEFAULT 'repair';

-- อัปเดตข้อมูลเดิมให้เป็น 'repair' พึงหมด
UPDATE repairrequest 
SET form_type = 'repair' 
WHERE form_type IS NULL;

-- ตรวจสอบผลลัพธ์
SELECT request_id, asset_id, username, form_type, created_at 
FROM repairrequest 
ORDER BY created_at DESC 
LIMIT 10;
