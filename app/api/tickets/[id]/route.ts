import { queryRepair } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { notifyStatusChange } from "@/lib/line-notify"

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log('========== GET TICKET DEBUG ==========')
    console.log('Searching for ticket ID:', id)
    
    // Try multiple search strategies
    let result = await queryRepair(
      'SELECT * FROM repairrequest WHERE request_id = $1',
      [id]
    )
    console.log('Try 1 (request_id exact):', result.rows.length)
    
    // If not found, try case-insensitive search on request_id
    if (result.rows.length === 0) {
      result = await queryRepair(
        'SELECT * FROM repairrequest WHERE UPPER(request_id) = UPPER($1)',
        [id]
      )
      console.log('Try 2 (case-insensitive request_id):', result.rows.length)
    }
    
    // Try trimming spaces
    if (result.rows.length === 0) {
      result = await queryRepair(
        'SELECT * FROM repairrequest WHERE TRIM(request_id) = TRIM($1)',
        [id]
      )
      console.log('Try 3 (trimmed request_id):', result.rows.length)
    }
    
    // Try LIKE search
    if (result.rows.length === 0) {
      result = await queryRepair(
        'SELECT * FROM repairrequest WHERE request_id LIKE $1',
        [`%${id}%`]
      )
      console.log('Try 4 (LIKE):', result.rows.length)
      if (result.rows.length > 1) {
        // Find exact match if multiple found
        const exactMatch = result.rows.filter(r => 
          r.request_id.trim().toUpperCase() === id.trim().toUpperCase()
        )
        if (exactMatch.length > 0) {
          result.rows = exactMatch
          console.log('After filtering for exact match:', result.rows.length)
        }
      }
    }
    
    if (result.rows.length === 0) {
      console.log('❌ Ticket not found:', id)
      console.log('======================================')
      return NextResponse.json({ error: "Ticket not found", searchedId: id }, { status: 404 })
    }
    
    console.log('✅ Found ticket:', {
      request_id: result.rows[0].request_id,
      asset_id: result.rows[0].asset_id,
      status: result.rows[0].Status
    })
    console.log('======================================')
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('❌ Failed to fetch ticket:', error)
    console.log('======================================')
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const data = await request.json()
    
    console.log('========== PUT TICKET DEBUG ==========')
    console.log('Updating ticket ID:', id)
    console.log('Update data:', JSON.stringify(data, null, 2))

    const allowedStatusValues = ['0','1','2','3','4',0,1,2,3,4]
    
    // ดึงข้อมูลเก่าก่อนอัปเดต (เพื่อเช็คสถานะเดิม) - ลองหลายรูปแบบ
    console.log('Searching for ticket in database...')
    
    // First, check what's in the database
    const sampleData = await queryRepair(
      'SELECT request_id FROM repairrequest ORDER BY created_at DESC LIMIT 5'
    )
    console.log('Sample request_ids in database:', sampleData.rows.map(r => r.request_id))
    
    let oldTicketResult = await queryRepair(
      'SELECT "Status", username, request_id FROM repairrequest WHERE request_id = $1',
      [id]
    )
    console.log('Try finding by request_id (exact):', oldTicketResult.rows.length)
    
    // If not found, try case-insensitive
    if (oldTicketResult.rows.length === 0) {
      oldTicketResult = await queryRepair(
        'SELECT "Status", username, request_id FROM repairrequest WHERE UPPER(request_id) = UPPER($1)',
        [id]
      )
      console.log('Try finding by request_id (case-insensitive):', oldTicketResult.rows.length)
    }
    
    // Try trimming spaces
    if (oldTicketResult.rows.length === 0) {
      oldTicketResult = await queryRepair(
        'SELECT "Status", username, request_id FROM repairrequest WHERE TRIM(request_id) = TRIM($1)',
        [id]
      )
      console.log('Try finding by request_id (trimmed):', oldTicketResult.rows.length)
    }
    
    // Try with LIKE
    if (oldTicketResult.rows.length === 0) {
      oldTicketResult = await queryRepair(
        'SELECT "Status", username, request_id FROM repairrequest WHERE request_id LIKE $1',
        [`%${id}%`]
      )
      console.log('Try finding by request_id (LIKE):', oldTicketResult.rows.length)
      if (oldTicketResult.rows.length > 1) {
        // Find exact match if multiple found
        oldTicketResult.rows = oldTicketResult.rows.filter(r => 
          r.request_id.trim().toUpperCase() === id.trim().toUpperCase()
        )
        console.log('After filtering for exact match:', oldTicketResult.rows.length)
      }
    }
    
    if (oldTicketResult.rows.length === 0) {
      console.log('❌ Ticket not found for update:', id)
      console.log('All tickets in database:', sampleData.rows)
      console.log('======================================')
      return NextResponse.json({ 
        error: "Ticket not found", 
        searchedId: id,
        message: "ไม่พบรายการซ่อมนี้ในระบบ กรุณาตรวจสอบรหัสรายการซ่อม",
        debug: {
          searchedId: id,
          sampleIds: sampleData.rows.map(r => r.request_id)
        }
      }, { status: 404 })
    }
    
    console.log('✅ Found ticket:', oldTicketResult.rows[0])
    const oldStatus = oldTicketResult.rows.length > 0 ? String(oldTicketResult.rows[0].Status) : null
    const username = oldTicketResult.rows.length > 0 ? oldTicketResult.rows[0].username : null
    const actualRequestId = oldTicketResult.rows[0].request_id // Use the actual ID from database
    
    console.log('Using actual request_id from database:', actualRequestId)
    
    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1
    
    // Handle both 'status' and 'Status' for backward compatibility
    const statusValue = data.Status !== undefined ? data.Status : data.status
    const newStatus = statusValue !== undefined ? String(statusValue) : null
    if (statusValue !== undefined && !allowedStatusValues.includes(statusValue)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }
    
    if (statusValue !== undefined) {
      updates.push(`\"Status\" = $${paramCount}`)
      values.push(Number(statusValue))
      paramCount++
    }
    
    if (data.start_repair !== undefined) {
      updates.push(`" start_repair" = $${paramCount}`)
      values.push(data.start_repair)
      paramCount++
    }
    
    if (data.finish_repair !== undefined) {
      updates.push(`finish_repair = $${paramCount}`)
      values.push(data.finish_repair)
      paramCount++
    }
    
    if (data.finish_with !== undefined) {
      updates.push(`finish_with = $${paramCount}`)
      values.push(data.finish_with)
      paramCount++
    }
    
    if (data.cost !== undefined) {
      updates.push(`cost = $${paramCount}`)
      values.push(data.cost)
      paramCount++
    }
    
    if (data.price_type !== undefined) {
      updates.push(`price_type = $${paramCount}`)
      values.push(data.price_type)
      paramCount++
    }
    
    if (data.description_price !== undefined) {
      updates.push(`description_price = $${paramCount}`)
      values.push(data.description_price)
      paramCount++
    }
    
    if (data.total_date !== undefined) {
      updates.push(`total_date = $${paramCount}`)
      values.push(data.total_date)
      paramCount++
    }
    
    // ถ้ามีการอัปเดต Rep_info (รายละเอียดการซ่อม) ให้เลื่อนข้อมูลเดิมไปเก็บไว้
    if (data.Rep_info !== undefined) {
      // ดึงข้อมูลเดิมก่อน
      const currentDataResult = await queryRepair(
        'SELECT "Rep_info", "Re_Rep1" FROM repairrequest WHERE request_id = $1',
        [id]
      )
      
      if (currentDataResult.rows.length > 0) {
        const currentRepInfo = currentDataResult.rows[0].Rep_info
        const currentReRep1 = currentDataResult.rows[0].Re_Rep1
        
        // ถ้ามีข้อมูลเดิมใน Rep_info ให้เลื่อนไป Re_Rep1 และ Re_Rep2
        if (currentRepInfo && currentRepInfo.trim() !== '') {
          console.log('Moving repair info history:', {
            request_id: id,
            oldRepInfo: currentRepInfo,
            oldReRep1: currentReRep1,
            newRepInfo: data.Rep_info
          })
          
          // เลื่อน Re_Rep1 → Re_Rep2
          updates.push(`"Re_Rep2" = $${paramCount}`)
          values.push(currentReRep1)
          paramCount++
          
          // เลื่อน Rep_info เดิม → Re_Rep1
          updates.push(`"Re_Rep1" = $${paramCount}`)
          values.push(currentRepInfo)
          paramCount++
        }
      }
      
      // บันทึกข้อมูลใหม่ลง Rep_info
      updates.push(`"Rep_info" = $${paramCount}`)
      values.push(data.Rep_info)
      paramCount++
    }
    
    // ถ้ามีการอัปเดต Comment_re (เหตุผลที่ไม่ผ่านการประเมิน) ให้เลื่อนข้อมูลเดิมไปเก็บไว้
    if (data.Comment_re !== undefined) {
      // ดึงข้อมูลเดิมก่อน
      const currentCommentResult = await queryRepair(
        'SELECT "Comment_re", "Comment_re2" FROM repairrequest WHERE request_id = $1',
        [id]
      )
      
      if (currentCommentResult.rows.length > 0) {
        const currentCommentRe = currentCommentResult.rows[0].Comment_re
        const currentCommentRe2 = currentCommentResult.rows[0].Comment_re2
        
        // ถ้ามีข้อมูลเดิมใน Comment_re ให้เลื่อนไป Comment_re2 และ Comment_re3
        if (currentCommentRe && currentCommentRe.trim() !== '') {
          console.log('Moving comment history:', {
            request_id: id,
            oldCommentRe: currentCommentRe,
            oldCommentRe2: currentCommentRe2,
            newCommentRe: data.Comment_re
          })
          
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
      values.push(data.Comment_re)
      paramCount++
    }
    
    if (data.cancel_whit !== undefined) {
      updates.push(`cancel_whit = $${paramCount}`)
      values.push(data.cancel_whit)
      paramCount++
    }
    
    if (data.repair_count !== undefined) {
      updates.push(`repair_count = $${paramCount}`)
      values.push(data.repair_count)
      paramCount++
    }
    
    if (data.type_of_work !== undefined) {
      updates.push(`type_of_work = $${paramCount}`)
      values.push(data.type_of_work)
      paramCount++
    }
    
    if (data.work !== undefined) {
      updates.push(`work = $${paramCount}`)
      values.push(data.work)
      paramCount++
    }
    
    if (data.detail_work !== undefined) {
      updates.push(`detail_work = $${paramCount}`)
      values.push(data.detail_work)
      paramCount++
    }
    
    // Always update updated_at
    updates.push('updated_at = NOW()')
    
    if (updates.length === 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }
    
    // Use the actual request_id from the database for the WHERE clause
    values.push(actualRequestId)
    
    console.log('Executing UPDATE query with:', { updates, values, actualRequestId })
    
    const result = await queryRepair(
      `UPDATE repairrequest 
       SET ${updates.join(', ')} 
       WHERE request_id = $${paramCount} 
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      console.log('Failed to update - ticket not found:', actualRequestId)
      console.log('======================================')
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    
    console.log('Successfully updated ticket:', result.rows[0])
    console.log('======================================')
    
    // ส่งการแจ้งเตือนถ้าสถานะเปลี่ยน
    if (newStatus && oldStatus && newStatus !== oldStatus && username) {
      notifyStatusChange({
        request_id: actualRequestId,
        username: username,
        oldStatus: oldStatus,
        newStatus: newStatus
      }).catch(error => {
        console.error('Failed to send LINE status notification:', error)
        // ไม่ให้ error จาก LINE แจ้งเตือนส่งผลต่อการอัปเดต ticket
      })
    }
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update ticket:', error)
    console.log('======================================')
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
  }
}
