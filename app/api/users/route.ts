import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

// GET /api/users - ดึงข้อมูลผู้ใช้ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let sqlQuery = `
      SELECT 
        iduser,
        userid,
        username as user_login,
        usersname as name,
        "Role",
        site,
        department
      FROM public.useryc
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 1

    if (search) {
      sqlQuery += ` AND (
        userid ILIKE $${paramCount} OR
        username ILIKE $${paramCount} OR
        usersname ILIKE $${paramCount} OR
        site ILIKE $${paramCount} OR
        department ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    sqlQuery += ' ORDER BY iduser DESC'

    const result = await dbQuery(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/users - เพิ่มผู้ใช้ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, name, role, site, department } = body

    // Validation
    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลที่จำเป็น' },
        { status: 400 }
      )
    }

    // Convert role to number (0 = Admin, 1 = User)
    const roleValue = role === 'admin' ? 0 : 1

    const sqlQuery = `
      INSERT INTO public.useryc (
        username, password, usersname, "Role", site, department
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING iduser, userid, username as user_login, usersname as name, "Role", site, department
    `

    const result = await dbQuery(sqlQuery, [
      username,
      password,
      name,
      roleValue,
      site || null,
      department || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'มี Username หรือ User ID นี้อยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
