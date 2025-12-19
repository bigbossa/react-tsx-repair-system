const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

const pool = new Pool({
  host: process.env.DBLG_HOST,
  port: parseInt(process.env.DBLG_PORT || '5432'),
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  password: process.env.DBLG_PASSWORD,
})

async function checkFeedbackTable() {
  try {
    const client = await pool.connect()
    
    console.log('=== Checking feedback table structure ===')
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      ORDER BY ordinal_position
    `)
    console.log('Columns:', JSON.stringify(result.rows, null, 2))
    
    console.log('\n=== Sample data ===')
    const data = await client.query('SELECT * FROM feedback LIMIT 3')
    console.log('Data:', JSON.stringify(data.rows, null, 2))
    
    client.release()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

checkFeedbackTable()
