const { Client } = require('pg')

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'itsupport',
  user: 'postgres',
  password: '25800852'
})

async function createCompanyTable() {
  try {
    await client.connect()
    console.log('Connected to database')

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS company (
        id SERIAL PRIMARY KEY,
        company_code VARCHAR(50) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    await client.query(createTableQuery)
    console.log('✓ Table "company" created successfully')

    // สร้าง index
    await client.query('CREATE INDEX IF NOT EXISTS idx_company_code ON company(company_code)')
    console.log('✓ Indexes created successfully')

    // เพิ่มข้อมูลตัวอย่าง
    const insertQuery = `
      INSERT INTO company (company_code, company_name) VALUES
      ('PT', 'บริษัท พร้อมแมส่ง จำกัด'),
      ('YC', 'บริษัท ยงอมบริด จำกัด (มหาชน)'),
      ('YH', 'บริษัท ยงเจริง จำกัด (มหาชน)'),
      ('AP', 'บริษัท อัสฟาเวสต์บเอสสทุ จำกัด')
      ON CONFLICT (company_code) DO NOTHING
    `

    await client.query(insertQuery)
    console.log('✓ Sample data inserted successfully')

    // ตรวจสอบข้อมูล
    const result = await client.query('SELECT COUNT(*) FROM company')
    console.log(`✓ Total companies in database: ${result.rows[0].count}`)

    console.log('\n✓ Setup completed successfully!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

createCompanyTable()
