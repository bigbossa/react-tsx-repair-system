const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

console.log('Testing database connection...')
console.log('Config:', {
  host: process.env.DBLG_HOST,
  port: process.env.DBLG_PORT,
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  passwordLength: process.env.DBLG_PASSWORD?.length
})

const pool = new Pool({
  host: process.env.DBLG_HOST,
  port: parseInt(process.env.DBLG_PORT || '5432'),
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  password: process.env.DBLG_PASSWORD,
})

async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✓ Database connected successfully!')
    
    const result = await client.query('SELECT NOW()')
    console.log('✓ Query test passed:', result.rows[0])
    
    const userTest = await client.query('SELECT COUNT(*) as total FROM useryc')
    console.log('✓ Users table accessible, total users:', userTest.rows[0].total)
    
    client.release()
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('✗ Database connection failed:', error.message)
    console.error('Error code:', error.code)
    await pool.end()
    process.exit(1)
  }
}

testConnection()
