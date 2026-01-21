import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// สร้างตารางถ้ายังไม่มี
async function ensureTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admin_sites (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      site_code VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, site_code)
    )
  `
  await queryRepair(createTableQuery)
}

// GET /api/admin-sites - ดึงข้อมูลสาขาที่ admin รับผิดชอบ
export async function GET(request: NextRequest) {
  try {
    await ensureTableExists()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    let query = 'SELECT * FROM admin_sites'
    const params: any[] = []
    
    if (userId) {
      query += ' WHERE user_id = $1'
      params.push(userId)
    }
    
    query += ' ORDER BY id'
    
    const result = await queryRepair(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching admin sites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin sites' },
      { status: 500 }
    )
  }
}

// POST /api/admin-sites - เพิ่มสาขาที่ admin รับผิดชอบ
export async function POST(request: NextRequest) {
  try {
    await ensureTableExists()
    
    const body = await request.json()
    const { user_id, site_codes } = body
    
    if (!user_id || !Array.isArray(site_codes)) {
      return NextResponse.json(
        { success: false, error: 'user_id and site_codes array are required' },
        { status: 400 }
      )
    }
    
    // ลบสาขาเก่าทั้งหมดของ user นี้
    await queryRepair('DELETE FROM admin_sites WHERE user_id = $1', [user_id])
    
    // เพิ่มสาขาใหม่
    for (const site_code of site_codes) {
      if (site_code && site_code.trim()) {
        await queryRepair(
          'INSERT INTO admin_sites (user_id, site_code) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user_id, site_code.trim()]
        )
      }
    }
    
    // ดึงข้อมูลที่เพิ่มแล้ว
    const result = await queryRepair(
      'SELECT * FROM admin_sites WHERE user_id = $1',
      [user_id]
    )
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error saving admin sites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save admin sites' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin-sites - ลบสาขาที่ admin รับผิดชอบ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const siteCode = searchParams.get('site_code')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }
    
    let query = 'DELETE FROM admin_sites WHERE user_id = $1'
    const params: any[] = [userId]
    
    if (siteCode) {
      query += ' AND site_code = $2'
      params.push(siteCode)
    }
    
    await queryRepair(query, params)
    
    return NextResponse.json({
      success: true,
      message: 'Deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting admin sites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin sites' },
      { status: 500 }
    )
  }
}
