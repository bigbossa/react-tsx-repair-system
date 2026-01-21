import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

interface ImportUser {
  username: string
  password: string
  name: string
  role?: string | number
  site?: string
  department?: string
}

// POST /api/users/import - Import users จาก Excel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { users } = body as { users: ImportUser[] }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่มีข้อมูลผู้ใช้ที่จะ import' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; username: string; error: string }>
    }

    // Helper function to convert any value to string safely
    const toStr = (val: any): string => {
      if (val === null || val === undefined) return ''
      return String(val).trim()
    }

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const rowNumber = i + 2 // Row 1 is header, data starts from row 2

      try {
        // Convert all fields to string safely
        const username = toStr(user.username)
        const password = toStr(user.password)
        const name = toStr(user.name)
        const site = toStr(user.site)
        const department = toStr(user.department)

        // Validate required fields
        if (!username || !password || !name) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            username: username || '(ไม่ระบุ)',
            error: 'ข้อมูลไม่ครบ: ต้องมี username, password, name'
          })
          continue
        }

        // Convert role to number (0 = Admin, 1 = User)
        let roleValue = 1 // Default to User
        if (user.role !== undefined) {
          if (typeof user.role === 'number') {
            roleValue = user.role === 0 ? 0 : 1
          } else if (typeof user.role === 'string') {
            const roleLower = user.role.toLowerCase().trim()
            if (roleLower === 'admin' || roleLower === '0') {
              roleValue = 0
            }
          }
        }

        // Check if username already exists
        const checkQuery = `SELECT iduser FROM public.useryc WHERE username = $1`
        const existingUser = await dbQuery(checkQuery, [username])
        
        if (existingUser.rows.length > 0) {
          // Update existing user
          const updateQuery = `
            UPDATE public.useryc 
            SET password = $2, usersname = $3, "Role" = $4, site = $5, department = $6
            WHERE username = $1
          `
          await dbQuery(updateQuery, [
            username,
            password,
            name,
            roleValue,
            site || null,
            department || null
          ])
        } else {
          // Insert new user
          const insertQuery = `
            INSERT INTO public.useryc (username, password, usersname, "Role", site, department)
            VALUES ($1, $2, $3, $4, $5, $6)
          `
          await dbQuery(insertQuery, [
            username,
            password,
            name,
            roleValue,
            site || null,
            department || null
          ])
        }

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: rowNumber,
          username: toStr(user.username) || '(ไม่ระบุ)',
          error: error?.message || 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import สำเร็จ ${results.success} รายการ${results.failed > 0 ? `, ล้มเหลว ${results.failed} รายการ` : ''}`,
      data: results
    })
  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
