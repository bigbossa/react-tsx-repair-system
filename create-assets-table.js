/**
 * สคริปต์สร้างตาราง Assets
 * รันด้วย: node create-assets-table.js
 */

const { Pool } = require('pg')
const fs = require('fs')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DBRE_HOST,
  port: parseInt(process.env.DBRE_PORT || '5432'),
  database: process.env.DBRE_NAME,
  user: process.env.DBRE_USER,
  password: process.env.DBRE_PASSWORD,
})

async function createAssetsTable() {
  console.log('🔧 กำลังสร้างตาราง Assets...\n')

  try {
    // อ่านไฟล์ SQL
    const sqlContent = fs.readFileSync('create-assets-table.sql', 'utf8')
    
    // รันคำสั่ง SQL
    await pool.query(sqlContent)
    
    console.log('✅ สร้างตาราง Assets สำเร็จ!')
    console.log('✅ สร้าง Indexes สำเร็จ!')
    console.log('✅ เพิ่ม Comments สำเร็จ!')
    console.log('\n🎉 ตาราง Assets พร้อมใช้งานแล้ว!')
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  ตาราง Assets มีอยู่แล้ว')
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', error.message)
    }
  } finally {
    await pool.end()
  }
}

createAssetsTable()
