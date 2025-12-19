const { Pool } = require('pg')

const poolRepair = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'itsupport',
})

async function queryRepair(text, params) {
  const res = await poolRepair.query(text, params)
  return res
}

async function checkTicket() {
  try {
    const result = await queryRepair(
      'SELECT request_id, form_type, work, asset_id FROM repairrequest WHERE request_id = $1',
      ['IT6812007']
    )
    console.log('Ticket IT6812007:')
    console.log(JSON.stringify(result.rows, null, 2))
    
    // Check all recent tickets
    const allResult = await queryRepair(
      'SELECT request_id, form_type, work, asset_id FROM repairrequest ORDER BY created_at DESC LIMIT 10'
    )
    console.log('\n\nRecent 10 tickets:')
    console.log(JSON.stringify(allResult.rows, null, 2))
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkTicket()
