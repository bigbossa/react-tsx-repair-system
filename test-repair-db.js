require('dotenv').config()
const { Pool } = require('pg')

// Try connecting to useryc database
const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: 'useryc', // Try useryc database
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD,
})

async function testRepairDB() {
  try {
    console.log('Testing RepairRequest database connection...')
    console.log('Config:', {
      host: process.env.DBRE_HOST,
      port: process.env.DBRE_PORT,
      database: process.env.DBRE_NAME,
      user: process.env.DBRE_USER,
      passwordLength: process.env.DBRE_PASSWORD?.length
    })

    // Test connection
    const result = await pool.query('SELECT NOW()')
    console.log('✓ Database connected:', result.rows[0])

    // List all databases
    const databases = await pool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false
    `)
    console.log('\n✓ Available databases:')
    databases.rows.forEach(db => {
      console.log(`  - ${db.datname}`)
    })

    // Check all tables in useryc database
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_name
    `)
    console.log('\n✓ All tables in useryc database:')
    tables.rows.forEach(t => {
      console.log(`  - ${t.table_schema}.${t.table_name}`)
    })

    // Try to find RepairRequest table
    const repairTable = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'RepairRequest'
    `)
    if (repairTable.rows.length > 0) {
      console.log('\n✓ Found RepairRequest table!')
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'RepairRequest'
        ORDER BY ordinal_position
      `)
      console.log('Columns:')
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
    }

    await pool.end()
  } catch (error) {
    console.error('✗ Error:', error.message)
    process.exit(1)
  }
}

testRepairDB()
