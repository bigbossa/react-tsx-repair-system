import { queryRepair } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { notifyNewRepairRequest, notifyNewEquipmentRequest } from "@/lib/line-notify"

function validateTicketPayload(data: any) {
  const errors: string[] = []
  const formType = data?.formType || 'repair'

  const str = (v: any) => (typeof v === 'string' ? v.trim() : '')

  const username = str(data?.username)
  if (!username) errors.push('username is required')

  if (formType === 'repair') {
    const assetId = str(data?.asset_id)
    if (!assetId) errors.push('asset_id is required for repair form')
    const work = str(data?.work)
    if (!work) errors.push('work is required for repair form')
  } else if (formType === 'request') {
    const equipment = str(data?.work)
    if (!equipment) errors.push('equipment (work) is required for request form')
    const detail = str(data?.Ref || data?.detail_work)
    if (!detail) errors.push('detail is required for request form')
  }

  return { errors }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site')
    const sites = searchParams.get('sites') // รองรับหลายสาขา คั่นด้วย comma
    
    let query = ''
    const params: any[] = []
    
    // กรองตามหลายสาขา (sites) หรือ สาขาเดียว (site) - join กับ Assets เพื่อดึง site
    if (sites) {
      const siteList = sites.split(',').map(s => s.trim()).filter(s => s)
      if (siteList.length > 0) {
        const placeholders = siteList.map((_, i) => `$${i + 1}`).join(', ')
        query = `
          SELECT r.*, a.site 
          FROM repairrequest r
          LEFT JOIN public."Assets" a ON r.asset_id = a.asset_code
          WHERE a.site IN (${placeholders})
          ORDER BY r.created_at DESC
        `
        params.push(...siteList)
      } else {
        query = 'SELECT * FROM repairrequest ORDER BY created_at DESC'
      }
    } else if (site) {
      query = `
        SELECT r.*, a.site 
        FROM repairrequest r
        LEFT JOIN public."Assets" a ON r.asset_id = a.asset_code
        WHERE a.site = $1
        ORDER BY r.created_at DESC
      `
      params.push(site)
    } else {
      query = 'SELECT * FROM repairrequest ORDER BY created_at DESC'
    }
    
    const result = await queryRepair(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch repair requests:', error)
    return NextResponse.json({ error: "Failed to fetch repair requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { asset_id, username, Ref, type_of_work, work, detail_work, formType, img, device_name } = data
    const { errors } = validateTicketPayload(data)
    if (errors.length) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }
    
    console.log('Received ticket data:', data)
    console.log('Image URL received:', img)
    
    // Generate request_id in format IT+YY+MM+NNN (e.g., IT6812001)
    const now = new Date()
    const thaiYear = now.getFullYear() + 543 // Convert to Buddhist year
    const year = thaiYear.toString().slice(-2) // Last 2 digits of Thai year
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `IT${year}${month}`
    
    // Get the latest request_id with current month prefix
    const latestResult = await queryRepair(
      `SELECT request_id FROM repairrequest 
       WHERE request_id LIKE $1 
       ORDER BY request_id DESC 
       LIMIT 1`,
      [`${prefix}%`]
    )
    
    let sequence = 0
    if (latestResult.rows.length > 0) {
      // Extract the sequence number from the last request_id
      const lastId = latestResult.rows[0].request_id
      const lastSequence = parseInt(lastId.slice(-3))
      sequence = lastSequence + 1
    }
    
    const request_id = `${prefix}${sequence.toString().padStart(3, '0')}`
    
    const imgValue = img || null
    console.log('Inserting img value:', imgValue)
    
    const result = await queryRepair(
      `INSERT INTO repairrequest (request_id, asset_id, username, "Ref", "Status", type_of_work, work, detail_work, form_type, img, device_name, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) 
       RETURNING *`,
      [request_id, asset_id, username, Ref, 0, type_of_work, work, detail_work, formType || 'repair', imgValue, device_name || null]
    )
    
    console.log('Inserted ticket:', result.rows[0])
    
    // ส่งการแจ้งเตือนผ่าน LINE Notify
    const ticket = result.rows[0]
    if ((formType || 'repair') === 'request') {
      notifyNewEquipmentRequest({
        request_id: ticket.request_id,
        username: ticket.username,
        equipment: ticket.work,
        detail: ticket.Ref || ticket.detail_work || '',
        created_at: ticket.created_at
      }).catch(error => {
        console.error('Failed to send LINE equipment notification:', error)
      })
    } else {
      notifyNewRepairRequest({
        request_id: ticket.request_id,
        asset_id: ticket.asset_id,
        username: ticket.username,
        work: ticket.work,
        type_of_work: ticket.type_of_work,
        detail_work: ticket.detail_work,
        created_at: ticket.created_at
      }).catch(error => {
        console.error('Failed to send LINE notification:', error)
        // ไม่ให้ error จาก LINE แจ้งเตือนส่งผลต่อการสร้าง ticket
      })
    }
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create repair request:', error)
    return NextResponse.json({ error: "Failed to create repair request" }, { status: 500 })
  }
}
