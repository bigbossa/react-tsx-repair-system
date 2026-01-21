import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET - ดึงข้อมูลแบบประเมิน
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const id = searchParams.get('id')

    if (!token || !id) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลที่ต้องการ' },
        { status: 400 }
      )
    }

    // ตรวจสอบ token และดึงข้อมูล maintenance record
    const query = `
      SELECT 
        mr.*,
        mf.id as feedback_id,
        mf.satisfaction_level,
        mf.service_speed,
        mf.technician_rating,
        mf.comments,
        mf.submitted_at
      FROM maintenance_records mr
      LEFT JOIN maintenance_feedback mf ON mr.id = mf.maintenance_record_id
      WHERE mr.id = $1 AND mr.feedback_token = $2
    `

    const result = await queryRepair(query, [id, token])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล หรือ Token ไม่ถูกต้อง' },
        { status: 404 }
      )
    }

    const record = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        asset_code: record.asset_code,
        device_name: record.device_name,
        category: record.category,
        user_name: record.user_name,
        checked_by: record.checked_by,
        checked_at: record.checked_at,
        remarks: record.remarks,
        checklist: record.checklist,
        alreadySubmitted: !!record.feedback_id,
        feedback: record.feedback_id ? {
          satisfaction_level: record.satisfaction_level,
          service_speed: record.service_speed,
          technician_rating: record.technician_rating,
          comments: record.comments,
          submitted_at: record.submitted_at
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching maintenance feedback:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST - บันทึกผลประเมินความพึงพอใจ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      token,
      maintenance_record_id,
      satisfaction_level,
      service_speed,
      technician_rating,
      comments
    } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!token || !maintenance_record_id || !satisfaction_level) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // ตรวจสอบ token
    const verifyQuery = `
      SELECT id, asset_code, user_name 
      FROM maintenance_records 
      WHERE id = $1 AND feedback_token = $2
    `
    const verifyResult = await queryRepair(verifyQuery, [maintenance_record_id, token])

    if (verifyResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token ไม่ถูกต้อง หรือข้อมูลไม่ถูกต้อง' },
        { status: 403 }
      )
    }

    const record = verifyResult.rows[0]

    // ตรวจสอบว่าเคยประเมินแล้วหรือไม่
    const checkExistingQuery = `
      SELECT id FROM maintenance_feedback 
      WHERE maintenance_record_id = $1
    `
    const existingResult = await queryRepair(checkExistingQuery, [maintenance_record_id])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'ท่านได้ทำแบบประเมินนี้ไปแล้ว' },
        { status: 400 }
      )
    }

    // บันทึกผลประเมิน
    const insertQuery = `
      INSERT INTO maintenance_feedback (
        maintenance_record_id,
        asset_code,
        user_name,
        satisfaction_level,
        service_speed,
        technician_rating,
        comments,
        submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `

    const values = [
      maintenance_record_id,
      record.asset_code,
      record.user_name,
      satisfaction_level,
      service_speed || null,
      technician_rating || null,
      comments || ''
    ]

    const result = await queryRepair(insertQuery, values)
    const feedbackData = result.rows[0]

    console.log('✓ Feedback submitted successfully for asset:', record.asset_code)

    return NextResponse.json({
      success: true,
      message: 'บันทึกผลประเมินสำเร็จ ขอบคุณสำหรับความคิดเห็นของท่าน',
      data: feedbackData
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting maintenance feedback:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}

// GET feedback list for admin/reports
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '100'
    const company = searchParams.get('company')
    const site = searchParams.get('site')

    let query = `
      SELECT 
        mf.*,
        mr.asset_code,
        mr.device_name,
        mr.category,
        mr.company,
        mr.site,
        mr.department,
        mr.checked_by,
        mr.checked_at
      FROM maintenance_feedback mf
      INNER JOIN maintenance_records mr ON mf.maintenance_record_id = mr.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

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

    query += ` ORDER BY mf.submitted_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await queryRepair(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error('Error fetching maintenance feedback list:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}
