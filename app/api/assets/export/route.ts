import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET /api/assets/export - ดึงข้อมูล assets ทั้งหมดสำหรับ export
export async function GET(request: NextRequest) {
  try {
    console.log('Export API called')
    
    // Query ข้อมูลทั้งหมดจาก database โดยไม่มี filter
    const query = `
      SELECT 
        id,
        asset_code, 
        user_id, 
        user_name, 
        company,
        site, 
        department, 
        device_name,
        brand, 
        cpu, 
        harddisk, 
        ram, 
        ip_address,
        mac_address, 
        serial_number, 
        number, 
        licenseos,
        licensems,
        license1,
        license2,
        license3,
        license4,
        category, 
        cost, 
        purchase_date, 
        ref_devicename,
        created_at, 
        updated_at
      FROM public."Assets"
      ORDER BY asset_code
    `
    
    console.log('Executing query:', query)
    const result = await queryRepair(query)
    console.log('Query result count:', result.rows.length)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error exporting assets:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
