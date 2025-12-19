-- สร้างตาราง Assets ใหม่
CREATE TABLE IF NOT EXISTS public."Assets" (
    id SERIAL PRIMARY KEY,                     -- Primary Key เพิ่มให้เพื่อใช้เป็น unique row ID

    asset_code VARCHAR(100) UNIQUE,            -- รหัสทรัพย์สิน (ไม่ซ้ำ)
    user_id VARCHAR(50),                       -- รหัสพนักงาน
    user_name VARCHAR(200),                    -- ชื่อพนักงาน
    site VARCHAR(100),                         -- สาขา/ไซต์งาน
    department VARCHAR(200),                   -- แผนก

    device_name VARCHAR(200),                  -- ชื่ออุปกรณ์
    brand VARCHAR(100),                        -- ยี่ห้อ
    cpu VARCHAR(200),                          -- CPU
    harddisk VARCHAR(200),                     -- HDD / SSD
    ram VARCHAR(100),                          -- RAM

    ip_address VARCHAR(50),                    -- IP Address
    mac_address VARCHAR(50),                   -- MAC Address
    serial_number VARCHAR(200),                -- Serial Number

    number VARCHAR(100),                       -- หมายเลขอื่นๆ
    license VARCHAR(200),                      -- License / Windows key
    category VARCHAR(100),                     -- ประเภทอุปกรณ์

    cost NUMERIC(12,2),                        -- ราคาทรัพย์สิน
    purchase_date DATE,                        -- วันที่ซื้อ

    ref_devicename VARCHAR(200),               -- ชื่ออุปกรณ์อ้างอิง เช่น asset เดิม
    created_at TIMESTAMP DEFAULT NOW(),        -- วันที่บันทึก
    updated_at TIMESTAMP DEFAULT NOW()         -- วันที่แก้ไขล่าสุด
);

-- สร้าง Index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON public."Assets"(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public."Assets"(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_department ON public."Assets"(department);
CREATE INDEX IF NOT EXISTS idx_assets_site ON public."Assets"(site);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public."Assets"(category);

-- Comment สำหรับตาราง
COMMENT ON TABLE public."Assets" IS 'ตารางเก็บข้อมูลทรัพย์สินพึงหมด';
COMMENT ON COLUMN public."Assets".id IS 'Primary Key';
COMMENT ON COLUMN public."Assets".asset_code IS 'รหัสทรัพย์สิน (ไม่ซ้ำ)';
COMMENT ON COLUMN public."Assets".user_id IS 'รหัสพนักงานผู้ใช้งาน';
COMMENT ON COLUMN public."Assets".user_name IS 'ชื่อพนักงานผู้ใช้งาน';
COMMENT ON COLUMN public."Assets".cost IS 'ราคาทรัพย์สิน (บาท)';
COMMENT ON COLUMN public."Assets".purchase_date IS 'วันที่ซื้อทรัพย์สิน';
