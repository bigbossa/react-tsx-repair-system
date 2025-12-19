const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

async function testFeedbackInsert() {
  console.log('=== Testing Feedback Table ===')
  console.log('Database:', process.env.DBLG_NAME)
  console.log('Host:', process.env.DBLG_HOST)
  
  const pool = new Pool({
    host: process.env.DBLG_HOST,
    port: parseInt(process.env.DBLG_PORT || '5432'),
    database: process.env.DBLG_NAME,
    user: process.env.DBLG_USER,
    password: process.env.DBLG_PASSWORD,
  })

  try {
    const client = await pool.connect()
    console.log('✓ Connected to database')
    
    // ตรวจสอบว่าตารางมีอยู่จริง
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'feedback'
      )
    `)
    console.log('Table exists:', tableCheck.rows[0].exists)
    
    if (tableCheck.rows[0].exists) {
      // ดูโครงสร้างตาราง
      const structure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        ORDER BY ordinal_position
      `)
      console.log('\nTable structure:')
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
      
      // ทดสอบ INSERT
      console.log('\nTesting INSERT...')
      const result = await client.query(`
        INSERT INTO feedback (form_name, form_status, form_description, is_active) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, ['TEST001', '5', 'Test feedback', true])
      
      console.log('✓ INSERT successful:', result.rows[0])
      
      // ลบข้อมูลทดสอบ
      await client.query(`DELETE FROM feedback WHERE form_name = 'TEST001'`)
      console.log('✓ Test data cleaned up')
    }
    
    client.release()
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Detail:', error)
  } finally {
    await pool.end()
  }
}

testFeedbackInsert()
