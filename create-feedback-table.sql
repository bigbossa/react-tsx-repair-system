-- สร้างตาราง feedback สำหรับเก็บผลประเมินความพึงพอใจ
CREATE TABLE IF NOT EXISTS feedback (
  form_id SERIAL PRIMARY KEY,
  form_name VARCHAR(100),           -- เก็บ request_id ของ ticket
  form_status VARCHAR(10),          -- เก็บระดับความพึงพอใจ (1-5)
  form_description TEXT,            -- เก็บหมายเหตุ/ข้อเสนอแนะ
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับค้นหา
CREATE INDEX IF NOT EXISTS idx_feedback_form_name ON feedback(form_name);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- ดูโครงสร้างตาราง
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
ORDER BY ordinal_position;
