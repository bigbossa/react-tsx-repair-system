export interface Ticket {
  id: string
  title: string
  description: string
  category: "electrical" | "plumbing" | "hvac" | "appliance" | "other"
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  userName: string
  userEmail: string
  userPhone: string
  createdAt: string
  updatedAt: string
  notes?: string
  assignedTo?: string
  device_name?: string
  asset_id?: string
  Status?: number
  form_type?: string
  work?: string
  username?: string
}

export interface User {
  id: string
  username: string
  email: string
  role: "user" | "admin"
  name: string
  site?: string
  department?: string
}

export interface Asset {
  id?: number                    // Primary Key (SERIAL)
  asset_code?: string             // รหัสทรัพย์สิน (UNIQUE)
  user_id?: string                // รหัสพนักงาน
  user_name?: string              // ชื่อพนักงาน
  company?: string                // บริษัท
  site?: string                   // สาขา/ไซต์งาน
  department?: string             // แผนก
  device_name?: string            // ชื่ออุปกรณ์
  brand?: string                  // ยี่ห้อ
  cpu?: string                    // CPU
  harddisk?: string               // HDD / SSD
  ram?: string                    // RAM
  ip_address?: string             // IP Address
  mac_address?: string            // MAC Address
  serial_number?: string          // Serial Number
  number?: string                 // หมายเลขอื่นๆ
  licenseos?: string              // License OS (ตรงกับ DB: lowercase)
  licensems?: string              // License MS Office (ตรงกับ DB: lowercase)
  license1?: string               // License อื่นๆ 1
  license2?: string               // License อื่นๆ 2
  license3?: string               // License อื่นๆ 3
  license4?: string               // License อื่นๆ 4
  category?: string               // ประเภทอุปกรณ์
  cost?: string | number          // ราคาทรัพย์สิน (NUMERIC(12,2))
  purchase_date?: string          // วันที่ซื้อ (DATE)
  ref_devicename?: string         // ชื่ออุปกรณ์อ้างอิง
  created_at?: string             // วันที่บันทึก (TIMESTAMP)
  updated_at?: string             // วันที่แก้ไขล่าสุด (TIMESTAMP)
  // Legacy/deprecated fields
  Detail?: string                 // รายละเอียดเพิ่มเติม (deprecated)
  licenseOS?: string              // Legacy field (use licenseos)
  licenseMS?: string              // Legacy field (use licensems)
  license?: string                // Legacy field
}

export interface Feedback {
  form_id: number
  form_name: string
  form_description?: string
  is_active: boolean
  created_at: string
}

export interface RepairRequest {
  request_id: string
  asset_id: string
  username: string
  Ref?: string
  Status: number
  type_of_work?: string
  work?: string
  detail_work?: string
  Rep_info?: string              // รายละเอียดการซ่อมปัจจุบัน
  Re_Rep1?: string               // ประวัติการซ่อมรอบที่ 1
  Re_Rep2?: string               // ประวัติการซ่อมรอบที่ 2
  Comment_re?: string            // เหตุผลประเมินไม่ผ่านปัจจุบัน
  Comment_re2?: string           // เหตุผลประเมินไม่ผ่านรอบที่ 1
  Comment_re3?: string           // เหตุผลประเมินไม่ผ่านรอบที่ 2
  cancel_whit?: string           // ชื่อผู้ใช้ที่ยกเลิก
  start_repair?: string
  finish_repair?: string
  finish_with?: string           // ผู้ทำการซ่อมเสร็จ
  cost?: number
  total_date?: number
  repair_count?: number
  img?: string
  form_type?: string
  created_at?: string
  updated_at?: string
}

