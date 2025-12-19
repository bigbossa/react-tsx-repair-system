import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET /api/sites - ดึงข้อมูลสาขาทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT id, site_code, site, created_at, updated_at
      FROM public.site
      ORDER BY site_code ASC
    `

    const result = await queryRepair(query, [])

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/sites - เพิ่มสาขาใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { site_code, site } = body

    if (!site_code || !site) {
      return NextResponse.json(
        { success: false, error: 'site_code and site are required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO public.site (site_code, site, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `

    const result = await queryRepair(query, [site_code, site])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Site created successfully'
    })
  } catch (error: any) {
    console.error('Error creating site:', error)
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'รหัสสาขานี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create site',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
