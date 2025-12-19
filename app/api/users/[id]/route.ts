import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

// DELETE /api/users/[id] - ลบผู้ใช้
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const checkQuery = 'SELECT iduser, usersname FROM public.useryc WHERE iduser = $1'
    const checkResult = await dbQuery(checkQuery, [id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' },
        { status: 404 }
      )
    }

    // ลบผู้ใช้
    const deleteQuery = 'DELETE FROM public.useryc WHERE iduser = $1 RETURNING iduser'
    const result = await dbQuery(deleteQuery, [id])

    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'ลบผู้ใช้เรียบร้อยแล้ว'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบผู้ใช้ได้' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)

    // Foreign key constraint error
    if (error?.code === '23503') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องอยู่ในระบบ' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - แก้ไขผู้ใช้
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { usersname, Role, site, department, password } = body

    // สร้าง query แบบ dynamic
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (usersname !== undefined) {
      updates.push(`usersname = $${paramCount}`)
      values.push(usersname)
      paramCount++
    }

    if (Role !== undefined) {
      updates.push(`"Role" = $${paramCount}`)
      values.push(Role)
      paramCount++
    }

    if (site !== undefined) {
      updates.push(`site = $${paramCount}`)
      values.push(site)
      paramCount++
    }

    if (department !== undefined) {
      updates.push(`department = $${paramCount}`)
      values.push(department)
      paramCount++
    }

    if (password !== undefined && password !== '') {
      updates.push(`password = $${paramCount}`)
      values.push(password)
      paramCount++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่มีข้อมูลที่ต้องการอัปเดต' },
        { status: 400 }
      )
    }

    values.push(id)
    const query = `
      UPDATE public.useryc 
      SET ${updates.join(', ')}
      WHERE iduser = $${paramCount}
      RETURNING iduser, userid, username as user_login, usersname as name, "Role", site, department
    `

    const result = await dbQuery(query, values)

    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
