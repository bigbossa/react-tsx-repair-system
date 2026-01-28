# การติดตั้งตาราง checklist_drafts

## ขั้นตอนการติดตั้ง

### 1. เชื่อมต่อ PostgreSQL Database
เข้าไปที่ database ที่เก็บข้อมูล repair system (DBRE_NAME)

### 2. รัน SQL Script
```bash
# สำหรับ Windows PowerShell
Get-Content .\database\create_checklist_drafts_table.sql | psql -U <username> -d <database_name>

# หรือใช้ psql command line
psql -U <username> -d <database_name> -f ./database/create_checklist_drafts_table.sql
```

### 3. ตรวจสอบว่าตารางถูกสร้างแล้ว
```sql
-- ตรวจสอบตาราง
SELECT * FROM checklist_drafts LIMIT 5;

-- ดู structure
\d checklist_drafts

-- ตรวจสอบ indexes
\di checklist_drafts*
```

## โครงสร้างตาราง

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(255) | ชื่อผู้ใช้ที่บันทึก draft |
| asset_code | VARCHAR(255) | รหัสอุปกรณ์ที่กำลังทำ checklist |
| draft_data | JSONB | ข้อมูล draft: `{ items: boolean[], remarks: string }` |
| updated_at | TIMESTAMP | เวลาที่อัปเดตล่าสุด |
| created_at | TIMESTAMP | เวลาที่สร้าง draft |

## คุณสมบัติ

✅ **UNIQUE Constraint**: ป้องกันการมี draft ซ้ำสำหรับ user และ asset เดียวกัน
✅ **Indexes**: เพิ่มความเร็วในการค้นหา
✅ **JSONB Type**: เก็บข้อมูล draft แบบ flexible และค้นหาได้
✅ **Auto Timestamp**: บันทึกเวลาอัตโนมัติ

## การใช้งาน

หลังจากสร้างตารางแล้ว ระบบจะ:

1. **บันทึก draft อัตโนมัติ** เมื่อ user กดเลือกรายการ checklist หรือพิมพ์หมายเหตุ
2. **โหลด draft เมื่อ login** ทำให้เห็น draft ที่ทำค้างไว้จากเครื่องอื่นได้
3. **ลบ draft เมื่อบันทึกเสร็จ** เมื่อกด "MA เสร็จสิ้น"

## ข้อมูลเพิ่มเติม

- Draft จะถูกบันทึกทันทีที่มีการเปลี่ยนแปลง (real-time)
- ไม่จำกัดจำนวน draft ต่อ user
- สามารถเปิดจากเครื่องไหนก็ได้ (cross-device)
- ข้อมูลจะถูกเก็บไว้จนกว่าจะบันทึก MA เสร็จหรือลบเอง
