import { Pool } from 'pg'

// User Login Database (useryc)
console.log('User Database Configuration:', {
  host: process.env.DBLG_HOST,
  port: process.env.DBLG_PORT,
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  passwordSet: !!process.env.DBLG_PASSWORD
})

const poolLogin = new Pool({
  host: process.env.DBLG_HOST,
  port: parseInt(process.env.DBLG_PORT || '5432'),
  database: process.env.DBLG_NAME,
  user: process.env.DBLG_USER,
  password: process.env.DBLG_PASSWORD,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
})

// Repair Request Database (RepairRequest)
console.log('Repair Database Configuration:', {
  host: process.env.DBRE_HOST,
  port: process.env.DBRE_PORT,
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  passwordSet: !!process.env.DBRE_PASSWORD
})

const poolRepair = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
})

// Test connections on startup
poolLogin.on('connect', () => {
  console.log('User Database connected successfully')
})

poolLogin.on('error', (err) => {
  console.error('Unexpected user database error:', err)
})

poolRepair.on('connect', () => {
  console.log('Repair Database connected successfully')
})

poolRepair.on('error', (err) => {
  console.error('Unexpected repair database error:', err)
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await poolLogin.query(text, params)
    const duration = Date.now() - start
    console.log('Query executed successfully', { duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function queryRepair(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await poolRepair.query(text, params)
    const duration = Date.now() - start
    console.log('Repair DB Query executed successfully', { duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Repair database query error:', error)
    throw error
  }
}

export { poolLogin as default, poolRepair }
