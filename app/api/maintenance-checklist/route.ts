import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET - ดึงข้อมูล maintenance checklist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const assetCode = searchParams.get('asset_code')
    const company = searchParams.get('company')
    const site = searchParams.get('site')
    const department = searchParams.get('department')
    const limit = searchParams.get('limit') || '100'

    let query = 'SELECT * FROM maintenance_checklists WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (id) {
      query += ` AND id = $${paramIndex}`
      params.push(id)
      paramIndex++
    }

    if (assetCode) {
      query += ` AND asset_code = $${paramIndex}`
      params.push(assetCode)
      paramIndex++
    }

    if (company) {
      query += ` AND company = $${paramIndex}`
      params.push(company)
      paramIndex++
    }

    if (site) {
      query += ` AND site = $${paramIndex}`
      params.push(site)
      paramIndex++
    }

    if (department) {
      query += ` AND department = $${paramIndex}`
      params.push(department)
      paramIndex++
    }

    query += ` ORDER BY checked_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await queryRepair(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error('Error fetching maintenance checklists:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST - บันทึก maintenance checklist ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      asset_id,
      asset_code,
      device_name,
      category,
      company,
      site,
      department,
      user_name,
      checklist,
      remarks,
      checked_by
    } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!asset_code || !checklist || !checked_by) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO maintenance_checklists (
        asset_id, asset_code, device_name, category, company, site, department,
        user_name, checklist, remarks, checked_by, checked_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `

    const values = [
      asset_id || null,
      asset_code,
      device_name || '-',
      category || '-',
      company || '-',
      site || '-',
      department || '-',
      user_name || '-',
      JSON.stringify(checklist),
      remarks || '',
      checked_by
    ]

    const result = await queryRepair(query, values)

    return NextResponse.json({
      success: true,
      message: 'บันทึก Checklist สำเร็จ',
      data: result.rows[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating maintenance checklist:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT - แก้ไขข้อมูล maintenance checklist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, checklist, remarks } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ ID' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE maintenance_checklists 
      SET checklist = $1, remarks = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `

    const values = [
      JSON.stringify(checklist),
      remarks || '',
      id
    ]

    const result = await queryRepair(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating maintenance checklist:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' },
      { status: 500 }
    )
  }
}

// DELETE - ลบข้อมูล maintenance checklist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ ID' },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM maintenance_checklists WHERE id = $1 RETURNING *'
    const result = await queryRepair(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting maintenance checklist:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    )
  }
}
