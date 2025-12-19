require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD
})

async function addStatusColumn() {
  try {
    console.log('Adding status column...')
    
    await pool.query(`
      ALTER TABLE subscription_expiry 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'renewed'
    `)
    
    console.log('✓ Status column added successfully!')
    
    // Verify both columns
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_expiry' 
        AND (column_name = 'status' OR column_name = 'renewed_months')
      ORDER BY column_name
    `)
    
    console.log('Verification:')
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (default: ${row.column_default})`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

addStatusColumn()
