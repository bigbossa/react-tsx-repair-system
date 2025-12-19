require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD
})

async function addColumn() {
  try {
    console.log('Adding renewed_months column...')
    
    await pool.query(`
      ALTER TABLE subscription_expiry 
      ADD COLUMN IF NOT EXISTS renewed_months INTEGER DEFAULT 0
    `)
    
    console.log('✓ Column added successfully!')
    
    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_expiry' 
        AND column_name = 'renewed_months'
    `)
    
    console.log('Verification:', result.rows)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

addColumn()
