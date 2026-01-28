import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { userid, oldPassword, newPassword } = await request.json()

    console.log('🔐 Change password request for:', userid)

    if (!userid || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // ตรวจสอบรหัสผ่านเดิม
    console.log('📝 Querying user from database...')
    const userResult = await pool.query(
      'SELECT user_password FROM users WHERE userid = $1',
      [userid]
    )
    console.log('✅ Query result:', userResult.rows.length, 'users found')

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้งานนี้' },
        { status: 404 }
      )
    }

    const currentPassword = userResult.rows[0].user_password

    // ตรวจสอบว่ารหัสผ่านเดิมถูกต้องหรือไม่
    if (oldPassword !== currentPassword) {
      return NextResponse.json(
        { error: 'รหัสผ่านเดิมไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // อัปเดตรหัสผ่านใหม่
    await pool.query(
      'UPDATE users SET user_password = $1 WHERE userid = $2',
      [newPassword, userid]
    )

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
    })

  } catch (error) {
    console.error('❌ Change password error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
