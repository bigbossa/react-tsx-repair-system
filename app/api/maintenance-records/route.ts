import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'
import crypto from 'crypto'

// GET - ดึงข้อมูล maintenance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const assetCode = searchParams.get('asset_code')
    const company = searchParams.get('company')
    const site = searchParams.get('site')
    const department = searchParams.get('department')
    const userName = searchParams.get('user_name')
    const limit = searchParams.get('limit') || '100'

    // JOIN กับ maintenance_feedback เพื่อดูว่ามี feedback แล้วหรือยัง
    let query = `
      SELECT 
        mr.*,
        mf.id as feedback_id,
        mf.satisfaction_level,
        mf.submitted_at as feedback_submitted_at
      FROM maintenance_records mr
      LEFT JOIN maintenance_feedback mf ON mr.id = mf.maintenance_record_id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (id) {
      query += ` AND mr.id = $${paramIndex}`
      params.push(id)
      paramIndex++
    }

    if (assetCode) {
      query += ` AND mr.asset_code = $${paramIndex}`
      params.push(assetCode)
      paramIndex++
    }

    if (company) {
      query += ` AND mr.company = $${paramIndex}`
      params.push(company)
      paramIndex++
    }

    if (site) {
      query += ` AND mr.site = $${paramIndex}`
      params.push(site)
      paramIndex++
    }

    if (department) {
      query += ` AND mr.department = $${paramIndex}`
      params.push(department)
      paramIndex++
    }

    if (userName) {
      query += ` AND mr.user_name = $${paramIndex}`
      params.push(userName)
      paramIndex++
    }

    query += ` ORDER BY mr.checked_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    console.log('Executing maintenance records query:', { query, params })
    const result = await queryRepair(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error: any) {
    console.error('Error fetching maintenance records:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// POST - บันทึก maintenance record และส่งแบบประเมินความพึงพอใจ
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
      user_contact,
      checklist,
      remarks,
      checked_by
    } = body

    console.log('Received maintenance record data:', {
      asset_id,
      asset_code,
      device_name,
      category,
      company,
      site,
      department,
      user_name,
      checked_by
    })

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!asset_code || !checklist || !checked_by) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // สร้าง feedback token สำหรับความปลอดภัย
    const feedbackToken = crypto.randomBytes(32).toString('hex')

    // บันทึกข้อมูลลงตาราง maintenance_records
    const insertQuery = `
      INSERT INTO maintenance_records (
        asset_id, asset_code, device_name, category, company, site, department,
        user_name, user_contact, checklist, remarks, checked_by, checked_at, 
        feedback_token, feedback_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, false)
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
      user_contact || null,
      JSON.stringify(checklist),
      remarks || '',
      checked_by,
      feedbackToken
    ]

    const result = await queryRepair(insertQuery, values)
    const maintenanceRecord = result.rows[0]

    // สร้าง feedback URL สำหรับแสดงในหน้าโปรแกรม
    const feedbackUrl = `/maintenance-feedback?token=${feedbackToken}&id=${maintenanceRecord.id}`
    const fullFeedbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${feedbackUrl}`

    console.log('✓ Maintenance record created, feedback URL ready for user')

    return NextResponse.json({
      success: true,
      message: 'บันทึก Maintenance Record สำเร็จ',
      data: maintenanceRecord,
      feedbackUrl: feedbackUrl,
      fullFeedbackUrl: fullFeedbackUrl
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating maintenance record:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// PUT - แก้ไขข้อมูล maintenance record
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
      UPDATE maintenance_records 
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
        { success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating maintenance record:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' },
      { status: 500 }
    )
  }
}

// DELETE - ลบข้อมูล maintenance record
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

    const query = 'DELETE FROM maintenance_records WHERE id = $1 RETURNING *'
    const result = await queryRepair(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting maintenance record:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    )
  }
}
