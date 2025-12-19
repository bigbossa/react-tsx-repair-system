import { NextRequest, NextResponse } from "next/server"
import { query, queryRepair } from "@/lib/db"

// GET - ดึงข้อมูล feedback ทั้งหมดหรือตาม request_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const request_id = searchParams.get('request_id')
    
    let result
    if (request_id) {
      // ค้นหาตาม request_id - ใช้ queryRepair เพราะตาราง feedback อยู่ใน database itsupport
      result = await queryRepair(
        `SELECT * FROM feedback WHERE form_name = $1 ORDER BY created_at DESC`,
        [request_id]
      )
    } else {
      // ดึงข้อมูลทั้งหมด
      result = await queryRepair(
        `SELECT * FROM feedback ORDER BY created_at DESC`
      )
    }
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    )
  }
}

// POST - สร้าง feedback ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, form_status, form_description } = body

    console.log('=== Feedback API Called ===')
    console.log('Request ID:', request_id)
    console.log('Form Status (Rating):', form_status)
    console.log('Form Description:', form_description)

    if (!request_id || !form_status) {
      return NextResponse.json(
        { error: "request_id and form_status are required" },
        { status: 400 }
      )
    }

    const rating = parseInt(form_status)
    const comment = form_description || ''

    // ตรวจสอบว่าถ้าประเมินไม่ผ่าน ต้องกรอกเหตุผล
    if (rating < 3 && (!comment || comment.trim() === '')) {
      console.log('ERROR: Comment required for rating < 3')
      return NextResponse.json(
        { error: "กรุณาระบุเหตุผลที่ประเมินไม่ผ่าน" },
        { status: 400 }
      )
    }

    // บันทึก feedback
    console.log('Inserting feedback to database...')
    
    // เก็บ request_id ใน form_name และ rating ใน form_status
    // ใช้ queryRepair เพราะตาราง feedback อยู่ใน database itsupport
    const result = await queryRepair(
      `INSERT INTO feedback (form_name, form_status, form_description, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [request_id, form_status, comment || null, true]
    )
    console.log('Feedback inserted successfully')

    // ถ้าประเมินไม่ผ่าน (rating < 3) เปลี่ยนสถานะกลับไปรอดำเนินการ
    if (rating < 3) {
      console.log('Rating < 3, will move comment history...')
      // ดึงข้อมูล Comment เดิม
      const commentData = await queryRepair(
        `SELECT "Comment_re", "Comment_re2" FROM repairrequest WHERE request_id = $1`,
        [request_id]
      )

      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      const newComment = `[${new Date().toISOString().split('T')[0]}] ประเมินไม่ผ่าน (Rating: ${rating}): ${comment}`

      if (commentData.rows.length > 0) {
        const currentCommentRe = commentData.rows[0].Comment_re
        const currentCommentRe2 = commentData.rows[0].Comment_re2
        
        console.log('=== Moving comment history (like Rep_info) ===')
        console.log('Request ID:', request_id)
        console.log('Old Comment_re:', currentCommentRe)
        console.log('Old Comment_re2:', currentCommentRe2)
        console.log('New Comment:', newComment)

        // ถ้ามีข้อมูลเดิมใน Comment_re ให้เลื่อนไป Comment_re2 และ Comment_re3
        if (currentCommentRe && currentCommentRe.trim() !== '') {
          // เลื่อน Comment_re2 → Comment_re3
          updates.push(`"Comment_re3" = $${paramCount}`)
          values.push(currentCommentRe2)
          paramCount++
          
          // เลื่อน Comment_re เดิม → Comment_re2
          updates.push(`"Comment_re2" = $${paramCount}`)
          values.push(currentCommentRe)
          paramCount++
        }
      }

      // บันทึกข้อมูลใหม่ลง Comment_re
      updates.push(`"Comment_re" = $${paramCount}`)
      values.push(newComment)
      paramCount++

      // เปลี่ยนสถานะเป็น 0 (รอดำเนินการ)
      updates.push(`"Status" = $${paramCount}`)
      values.push(0)
      paramCount++

      // อัปเดต updated_at
      updates.push('updated_at = NOW()')

      // เพิ่ม request_id เป็น parameter สุดท้าย
      values.push(request_id)

      // Execute UPDATE
      const updateResult = await queryRepair(
        `UPDATE repairrequest 
         SET ${updates.join(', ')} 
         WHERE request_id = $${paramCount} 
         RETURNING "Comment_re", "Comment_re2", "Comment_re3"`,
        values
      )

      console.log('=== After update ===')
      if (updateResult.rows.length > 0) {
        console.log('New Comment_re:', updateResult.rows[0].Comment_re)
        console.log('New Comment_re2:', updateResult.rows[0].Comment_re2)
        console.log('New Comment_re3:', updateResult.rows[0].Comment_re3)
      }
      console.log('========================')
    } else {
      // ถ้าประเมินผ่าน (rating >= 3) เปลี่ยนสถานะเป็น "เสร็จสิ้น" (status = 2)
      // อัพเดตจะทำใน FeedbackDialog แล้ว ไม่ต้องทำที่นี่
      console.log('Rating >= 3, status will be updated by FeedbackDialog')
    }

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    )
  }
}
