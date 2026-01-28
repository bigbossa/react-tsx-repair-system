import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET - ดึงข้อมูล drafts ของ user
export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const query = `
      SELECT asset_code, device_name, draft_data, updated_at
      FROM checklist_drafts
      WHERE username = $1
      ORDER BY updated_at DESC
    `
    
    const result = await queryRepair(query, [username])
    
    // แปลง array เป็น object format
    // ใช้ asset_code หรือ device_name เป็น key (สำหรับเครื่องที่ไม่มี asset_code)
    const drafts: Record<string, { items: boolean[], remarks: string }> = {}
    result.rows.forEach((row: any) => {
      const key = row.asset_code || row.device_name
      if (key) {
        drafts[key] = row.draft_data
      }
    })

    return NextResponse.json({
      success: true,
      data: drafts
    })

  } catch (error) {
    console.error('Error fetching checklist drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}

// POST - บันทึกหรืออัปเดต draft
export async function POST(request: NextRequest) {
  try {
    const { username, asset_code, device_name, draft_data } = await request.json()

    if (!username || (!asset_code && !device_name) || !draft_data) {
      return NextResponse.json(
        { error: 'Username, (asset_code or device_name), and draft_data are required' },
        { status: 400 }
      )
    }

    // ลบ record เก่าก่อน (ถ้ามี) แล้วค่อย INSERT ใหม่
    // เพราะ UPSERT ไม่ทำงานกับ NULL values
    if (asset_code) {
      // ลบโดยใช้ asset_code
      await queryRepair(
        `DELETE FROM checklist_drafts WHERE username = $1 AND asset_code = $2`,
        [username, asset_code]
      )
    } else {
      // ลบโดยใช้ device_name
      await queryRepair(
        `DELETE FROM checklist_drafts WHERE username = $1 AND device_name = $2 AND asset_code IS NULL`,
        [username, device_name]
      )
    }

    // INSERT ใหม่
    const query = `
      INSERT INTO checklist_drafts (username, asset_code, device_name, draft_data, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `

    const result = await queryRepair(query, [username, asset_code || null, device_name || null, draft_data])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error saving checklist draft:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// DELETE - ลบ draft
export async function DELETE(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    const asset_code = request.nextUrl.searchParams.get('asset_code')
    const device_name = request.nextUrl.searchParams.get('device_name')

    if (!username || (!asset_code && !device_name)) {
      return NextResponse.json(
        { error: 'Username and (asset_code or device_name) are required' },
        { status: 400 }
      )
    }

    // ลบโดยใช้ asset_code หรือ device_name
    const query = asset_code 
      ? `DELETE FROM checklist_drafts WHERE username = $1 AND asset_code = $2 RETURNING *`
      : `DELETE FROM checklist_drafts WHERE username = $1 AND device_name = $2 RETURNING *`

    const result = await queryRepair(query, [username, asset_code || device_name])

    return NextResponse.json({
      success: true,
      deleted: result.rowCount || 0
    })

  } catch (error) {
    console.error('Error deleting checklist draft:', error)
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
