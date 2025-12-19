const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

const pool = new Pool({
  host: process.env.DBLG_HOST,
  port: parseInt(process.env.DBLG_PORT || '5432'),
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  password: process.env.DBLG_PASSWORD,
})

async function createFeedbackTable() {
  try {
    const client = await pool.connect()
    
    console.log('=== Creating feedback table ===')
    
    // สร้างตาราง feedback
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        form_id SERIAL PRIMARY KEY,
        form_name VARCHAR(100),
        form_status VARCHAR(10),
        form_description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ Table created successfully')
    
    // สร้าง indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_form_name ON feedback(form_name)
    `)
    console.log('✓ Index on form_name created')
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC)
    `)
    console.log('✓ Index on created_at created')
    
    // ตรวจสอบโครงสร้าง
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      ORDER BY ordinal_position
    `)
    console.log('\n=== Table structure ===')
    console.log(JSON.stringify(result.rows, null, 2))
    
    client.release()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

createFeedbackTable()
