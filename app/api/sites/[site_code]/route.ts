import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// PUT /api/sites/[site_code] - แก้ไขข้อมูลสาขา
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ site_code: string }> }
) {
  try {
    const body = await request.json()
    const { site_code: oldSiteCode } = await params
    const { site_code: newSiteCode, site } = body

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'site is required' },
        { status: 400 }
      )
    }

    // ถ้ามีการแก้รหัสสาขา
    if (newSiteCode && newSiteCode !== oldSiteCode) {
      const query = `
        UPDATE public.site
        SET site_code = $1, site = $2, updated_at = NOW()
        WHERE site_code = $3
        RETURNING *
      `
      const result = await queryRepair(query, [newSiteCode, site, oldSiteCode])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Site not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Site updated successfully'
      })
    }

    // ถ้าแก้แค่ชื่อสาขา
    const query = `
      UPDATE public.site
      SET site = $1, updated_at = NOW()
      WHERE site_code = $2
      RETURNING *
    `

    const result = await queryRepair(query, [site, oldSiteCode])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Site updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating site:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update site',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/sites/[site_code] - ลบสาขา
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ site_code: string }> }
) {
  try {
    const { site_code } = await params

    const query = `DELETE FROM public.site WHERE site_code = $1 RETURNING *`
    const result = await queryRepair(query, [site_code])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Site deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting site:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete site',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
