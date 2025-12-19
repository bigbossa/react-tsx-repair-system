-- สร้างตาราง devices สำหรับจัดเก็บข้อมูลอุปกรณ์เบิกจ่าย
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    devices_name VARCHAR(50) NOT NULL,
    amount_device INTEGER NOT NULL DEFAULT 0,
    price VARCHAR(255) NOT NULL,
    detail_device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_devices_name ON devices(devices_name);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);

-- เพิ่มข้อมูลตัวอย่าง (optional)
INSERT INTO devices (devices_name, amount_device, price, detail_device) VALUES
('Mouse', 10, '150', 'เมาส์คอมพิวเตอร์ไร้สาย'),
('Keyboard', 8, '300', 'คีย์บอร์ดมาตรฐาน'),
('Monitor Cable (HDMI)', 15, '200', 'สาย HDMI ความยาว 1.5 เมตร'),
('USB Cable', 20, '50', 'สาย USB Type-A to Type-B'),
('Ethernet Cable', 25, '100', 'สายแลน Cat6 ความยาว 3 เมตร'),
('Power Cable', 30, '80', 'สายไฟคอมพิวเตอร์'),
('RAM DDR4 8GB', 5, '1500', 'RAM DDR4 8GB 2666MHz'),
('SSD 256GB', 3, '1200', 'SSD SATA 256GB'),
('Cooling Fan', 12, '250', 'พัดลมระบายความร้อนคอมพิวเตอร์'),
('UPS 650VA', 4, '2000', 'เครื่องสำรองไฟ 650VA')
ON CONFLICT DO NOTHING;
