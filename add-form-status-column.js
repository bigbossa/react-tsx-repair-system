const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

const pool = new Pool({
  host: process.env.DBLG_HOST,
  port: parseInt(process.env.DBLG_PORT || '5432'),
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  password: process.env.DBLG_PASSWORD,
})

async function addFormStatusColumn() {
  try {
    const client = await pool.connect()
    
    console.log('=== Adding form_status column to feedback table ===')
    
    // เพิ่ม column form_status
    await client.query(`
      ALTER TABLE feedback 
      ADD COLUMN IF NOT EXISTS form_status VARCHAR(10)
    `)
    console.log('✓ Column form_status added successfully')
    
    // ตรวจสอบโครงสร้างใหม่
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      ORDER BY ordinal_position
    `)
    console.log('\n=== Updated table structure ===')
    console.log(JSON.stringify(result.rows, null, 2))
    
    client.release()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

addFormStatusColumn()
