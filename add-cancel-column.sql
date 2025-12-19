-- เพิ่มคอลัมน์ cancel_whit ในตาราง repairrequest
ALTER TABLE repairrequest 
ADD COLUMN cancel_whit TEXT;

-- ตรวจสอบว่าเพิ่มสำเร็จ
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repairrequest' 
AND column_name = 'cancel_whit';
