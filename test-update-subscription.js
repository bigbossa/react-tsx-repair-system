require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD
})

async function testUpdate() {
  try {
    console.log('Testing UPDATE query...')
    
    // Get first subscription
    const getResult = await pool.query('SELECT * FROM subscription_expiry LIMIT 1')
    if (getResult.rows.length === 0) {
      console.log('No subscriptions found')
      return
    }
    
    const sub = getResult.rows[0]
    console.log('Testing with subscription ID:', sub.id)
    
    // Try to update it
    const result = await pool.query(
      `UPDATE subscription_expiry 
      SET expiry_date = $1, alert_date = $2, payment_due_date = $3, 
          program_name = $4, sub_name = $5, contact_name = $6, 
          phone = $7, company_name = $8, description = $9, status = $10, renewed_months = $11
      WHERE id = $12
      RETURNING *`,
      [sub.expiry_date, sub.alert_date, sub.payment_due_date, sub.program_name, sub.sub_name, sub.contact_name, sub.phone, sub.company_name, sub.description, sub.status || 'renewed', 1, sub.id]
    )
    
    console.log('✓ UPDATE successful!')
    console.log('Updated row:', result.rows[0])
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await pool.end()
  }
}

testUpdate()
