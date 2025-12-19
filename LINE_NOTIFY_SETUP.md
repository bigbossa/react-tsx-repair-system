# LINE Official Account Integration Guide

## การตั้งค่า LINE Official Account (Messaging API)

### ขั้นตอนการสร้าง LINE Official Account:

1. **สร้าง LINE Developers Account**
   - ไปที่ https://developers.line.biz/console/
   - เข้าสู่ระบบด้วยบัญชี LINE Business ของคุณ
   - หากยังไม่มี ให้สร้างบัญชีใหม่

2. **สร้าง Provider (ถ้ายังไม่มี)**
   - คลิก "Create a new provider"
   - ตั้งชื่อ Provider (เช่น "Repair System")

3. **สร้าง Messaging API Channel**
   - ภายใต้ Provider เลือก "Create a new channel"
   - เลือก "Messaging API"
   - กรอกข้อมูล:
     - Channel name: "Repair System Notification"
     - Channel description: "ระบบแจ้งเตือนคำขอซ่อม"
     - Category: เลือกตามความเหมาะสม
     - Subcategory: เลือกตามความเหมาะสม
   - ยอมรับข้อตกลง และคลิก "Create"

4. **ตั้งค่า Channel**
   - เข้าไปที่ Channel ที่สร้าง
   - ไปที่แท็บ "Messaging API"
   - **Channel Access Token:**
     - คลิก "Issue" เพื่อสร้าง Channel access token (long-lived)
     - คัดลอก token ที่ได้
   - **Channel Secret:**
     - คัดลอก Channel secret จากส่วน "Basic settings"
   - **Webhook:**
     - เปิดใช้งาน "Use webhook" (ถ้าต้องการรับข้อความจากผู้ใช้)
     - กรอก Webhook URL (เช่น `https://yourdomain.com/api/webhook/line`)

5. **เพิ่มข้อมูลในไฟล์ .env**
   ```env
   LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
   LINE_CHANNEL_SECRET=your_channel_secret_here
   LINE_ADMIN_USER_ID=optional_admin_user_id
   ```

6. **หา Admin User ID (Optional)**
   - เพิ่มบัญชี Official Account เป็นเพื่อน
   - ส่งข้อความถึง Bot
   - ดู log จาก webhook เพื่อหา User ID
   - หรือใช้ LINE Developers Console ตรวจสอบ

7. **ตั้งค่าเพิ่มเติม**
   - ไปที่ LINE Official Account Manager: https://manager.line.biz/
   - เลือก Official Account ที่สร้าง
   - ไปที่ "Settings" → "Response settings"
   - ปิด "Auto-response messages" (ถ้าไม่ต้องการข้อความอัตโนมัติ)
   - เปิด "Webhooks"

8. **รีสตาร์ทเซิร์ฟเวอร์**
   ```bash
   npm run dev
   ```

## คุณสมบัติที่เพิ่มแล้ว

### 1. แจ้งเตือนเมื่อมีคำขอใหม่ (Flex Message)
เมื่อมีคำขอซ่อมใหม่เข้ามา ระบบจะส่ง Flex Message ที่สวยงามไปยัง LINE ทันที โดยแสดง:
- เลขที่คำขอ
- ผู้แจ้ง
- รหัสทรัพย์สิน
- ชนิดของงานและประเภท
- รายละเอียด
- วันเวลาที่แจ้ง

**โหมดการส่ง:**
- ถ้ามี `LINE_ADMIN_USER_ID` จะส่งเฉพาะให้ Admin
- ถ้าไม่มี จะส่งแบบ Broadcast (ทุกคนที่เป็นเพื่อนกับ Bot)

### 2. แจ้งเตือนเมื่อเปลี่ยนสถานะ
ส่งการแจ้งเตือนเมื่อสถานะคำขอเปลี่ยนแปลง พร้อมแสดงสถานะเดิมและใหม่

## ฟังก์ชันที่มีให้ใช้งาน

```typescript
// ส่งการแจ้งเตือนคำขอใหม่
await notifyNewRepairRequest({
  request_id: "IT6812001",
  asset_id: "PC-001",
  username: "John Doe",
  work: "PC&Computer",
  type_of_work: "ซ่อม",
  detail_work: "คอมพิวเตอร์เปิดไม่ติด",
  created_at: new Date()
})

// ส่งการแจ้งเตือนเปลี่ยนสถานะ
await notifyStatusChange({
  request_id: "IT6812001",
  username: "John Doe",
  oldStatus: "0",
  newStatus: "1",
  lineUserId: "U1234567890..." // Optional: ส่งให้ผู้ใช้เฉพาะคน
})
```

## ความแตกต่างระหว่าง LINE Notify และ Messaging API

| คุณสมบัติ | LINE Notify | Messaging API |
|-----------|-------------|---------------|
| การตั้งค่า | ง่าย | ซับซ้อนกว่า |
| Flex Message | ❌ | ✅ |
| ส่งถึงผู้ใช้เฉพาะคน | ❌ | ✅ |
| Broadcast | ❌ | ✅ |
| รับข้อความจากผู้ใช้ | ❌ | ✅ |
| Rich Menu | ❌ | ✅ |
| ค่าใช้จ่าย | ฟรี | ฟรี (มีจำกัด) |

## การทดสอบ

1. **ทดสอบส่งข้อความ:**
   - เพิ่ม Official Account เป็นเพื่อน (สแกน QR Code จาก Console)
   - สร้างคำขอซ่อมใหม่ในระบบ
   - ตรวจสอบว่าได้รับข้อความหรือไม่

2. **ตรวจสอบ Logs:**
   - ดู Console logs เพื่อตรวจสอบว่าส่งสำเร็จหรือไม่
   - ตรวจสอบ error messages ถ้ามี

## หมายเหตุ
- การแจ้งเตือนไม่ส่งผลต่อการทำงานหลักของระบบ หากส่งไม่สำเร็จจะแสดง log แต่ไม่ขัดขวางการสร้างคำขอ
- Channel Access Token และ Channel Secret ควรเก็บเป็นความลับ
- ตรวจสอบให้แน่ใจว่าไฟล์ `.env` อยู่ใน `.gitignore`
- Messaging API มีจำนวนข้อความฟรีจำกัด ดูรายละเอียดที่ LINE Developers Console
- Flex Message สามารถปรับแต่งได้ที่ https://developers.line.biz/flex-simulator/
