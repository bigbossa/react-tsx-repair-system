/**
 * สคริปต์ทดสอบการเชื่อมต่อตาราง Assets ใหม่
 * รันด้วย: node test-assets-connection.js
 */

const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD,
})

async function testAssetsTable() {
  console.log('🔍 ทดสอบการเชื่อมต่อตาราง Assets...\n')

  try {
    // 1. ตรวจสอบว่าตารางมีอยู่หรือไม่
    console.log('1️⃣ ตรวจสอบตาราง Assets...')
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Assets'
      );
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ ไม่พบตาราง Assets')
      console.log('📝 กรุณารันคำสั่ง SQL ใน create-assets-table.sql')
      return
    }
    console.log('✅ พบตาราง Assets\n')

    // 2. ตรวจสอบ columns
    console.log('2️⃣ ตรวจสอบ columns...')
    const columnsQuery = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Assets'
      ORDER BY ordinal_position;
    `)
    
    console.log(`พบ ${columnsQuery.rows.length} columns:`)
    columnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`)
    })
    console.log('')

    // 3. นับจำนวนข้อมูล
    console.log('3️⃣ นับจำนวนข้อมูล...')
    const countQuery = await pool.query('SELECT COUNT(*) as count FROM public."Assets"')
    console.log(`✅ มีข้อมูล ${countQuery.rows[0].count} รายการ\n`)

    // 4. แสดงข้อมูลตัวอย่าง (5 รายการแรก)
    if (parseInt(countQuery.rows[0].count) > 0) {
      console.log('4️⃣ ข้อมูลตัวอย่าง (5 รายการแรก):')
      const sampleQuery = await pool.query(`
        SELECT 
          id, asset_code, user_id, user_name, site, department, 
          device_name, category, cost, purchase_date
        FROM public."Assets"
        ORDER BY created_at DESC
        LIMIT 5
      `)
      
      console.table(sampleQuery.rows)
    } else {
      console.log('4️⃣ ไม่มีข้อมูลในตาราง')
    }

    // 5. ทดสอบ Insert (ถ้าต้องการ)
    console.log('\n5️⃣ ทดสอบ INSERT ข้อมูล...')
    const testAssetCode = `TEST_${Date.now()}`
    
    const insertQuery = await pool.query(`
      INSERT INTO public."Assets" (
        asset_code, user_id, user_name, site, department,
        device_name, brand, cpu, harddisk, ram,
        ip_address, mac_address, serial_number, number,
        license, category, cost, purchase_date, ref_devicename
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING id, asset_code, device_name
    `, [
      testAssetCode,
      'TEST001',
      'ทดสอบระบบ',
      'สำนักงานใหญ่',
      'IT',
      'คอมพิวเตอร์ทดสอบ',
      'Test Brand',
      'Intel Core i5',
      'SSD 256GB',
      '8GB DDR4',
      '192.168.1.100',
      'AA:BB:CC:DD:EE:FF',
      'SN12345',
      'NUM001',
      'WIN-KEY-123',
      'Computer',
      15000.00,
      new Date(),
      ''
    ])
    
    console.log('✅ Insert สำเร็จ:', insertQuery.rows[0])
    
    // 6. ทดสอบ DELETE ข้อมูลทดสอบ
    console.log('\n6️⃣ ลบข้อมูลทดสอบ...')
    await pool.query('DELETE FROM public."Assets" WHERE asset_code = $1', [testAssetCode])
    console.log('✅ ลบข้อมูลทดสอบสำเร็จ')

    console.log('\n✅ การทดสอบเสร็จสมบูรณ์! ตาราง Assets พร้อมใช้งาน 🎉')

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message)
    console.error('รายละเอียด:', error)
  } finally {
    await pool.end()
  }
}

testAssetsTable()
