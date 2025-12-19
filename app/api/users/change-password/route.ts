import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { userid, oldPassword, newPassword } = await request.json()

    if (!userid || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // ตรวจสอบรหัสผ่านเดิม
    const userResult = await pool.query(
      'SELECT user_password FROM users WHERE userid = $1',
      [userid]
    )

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
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' },
      { status: 500 }
    )
  }
}
