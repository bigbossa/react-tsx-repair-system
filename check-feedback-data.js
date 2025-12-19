const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

async function checkFeedback() {
  const pool = new Pool({
    host: process.env.DBRE_HOST,
    port: parseInt(process.env.DBRE_PORT || '5432'),
    database: process.env.DBRE_NAME,
    user: process.env.DBRE_USER,
    password: process.env.DBRE_PASSWORD,
  })

  try {
    const client = await pool.connect()
    console.log('=== Checking feedback data ===')
    
    // ดูข้อมูลพึงหมดในตาราง feedback
    const result = await client.query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 10')
    console.log('Total records:', result.rows.length)
    console.log('\nFeedback data:')
    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Request ID: ${row.form_name}`)
      console.log(`   Rating: ${row.form_status}`)
      console.log(`   Description: ${row.form_description}`)
      console.log(`   Created at: ${row.created_at}`)
    })
    
    client.release()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkFeedback()
