import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// POST /api/assets - เพิ่มข้อมูล asset ใหม่
export async function POST(request: NextRequest) {
  let body: any = {}
  // keep asset_code accessible in catch
  let finalAssetCode: string | null = null
  try {
    body = await request.json()
    
    const {
      asset_code, user_id, user_name, company, site, department, device_name,
      brand, cpu, harddisk, ram, ip_address,
      mac_address, serial_number, number, licenseos, licensems,
      license1, license2, license3, license4, category, cost, purchase_date, ref_devicename,
      // Support legacy field names
      licenseOS, licenseMS
    } = body

    // Use lowercase field names, fallback to legacy camelCase if provided
    const finalLicenseos = licenseos || licenseOS
    const finalLicensems = licensems || licenseMS

    // Basic validation (ไม่ตรวจสอบซ้ำ)
    // ยอมรับทุกค่า ไม่บังคับให้มี device_name หรือ site

    const query = `
      INSERT INTO public."Assets" (
        asset_code, user_id, user_name, company, site, department, device_name,
        brand, cpu, harddisk, ram, ip_address,
        mac_address, serial_number, number, licenseos, licensems,
        license1, license2, license3, license4, category, cost, purchase_date, ref_devicename
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `

    // Convert cost to number if provided, otherwise null
    let costValue: number | null = null
    if (cost !== undefined && cost !== null && cost !== '') {
      const parsed = typeof cost === 'string' 
        ? parseFloat(cost.replace(/,/g, '')) 
        : typeof cost === 'number' 
          ? cost 
          : null
      if (!isNaN(parsed as number) && parsed !== null) {
        costValue = parsed as number
      }
    }

    // Validate and format purchase_date
    let purchaseDateValue: string | null = null
    if (purchase_date && purchase_date !== '' && purchase_date !== 'null') {
      // Try to parse the date and format it as YYYY-MM-DD
      try {
        const date = new Date(purchase_date)
        if (!isNaN(date.getTime())) {
          purchaseDateValue = date.toISOString().split('T')[0]
        }
      } catch (e) {
        // If date parsing fails, try to use as-is if it looks like YYYY-MM-DD
        if (typeof purchase_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(purchase_date)) {
          purchaseDateValue = purchase_date.split('T')[0]
        }
      }
    }

    // เติม "-" ในช่องที่ว่าง
    const fillEmpty = (val: any) => (val && String(val).trim() !== '') ? String(val).trim() : '-'
    
    // asset_code ถ้าว่างหรือเป็น "-" ให้เป็น null
    finalAssetCode = (asset_code && asset_code.trim() !== '' && asset_code.trim() !== '-')
      ? asset_code.trim()
      : null

    const values = [
      finalAssetCode,
      fillEmpty(user_id),
      fillEmpty(user_name),
      fillEmpty(company),
      fillEmpty(site),
      fillEmpty(department),
      fillEmpty(device_name),
      fillEmpty(brand),
      fillEmpty(cpu),
      fillEmpty(harddisk),
      fillEmpty(ram),
      fillEmpty(ip_address),
      fillEmpty(mac_address),
      fillEmpty(serial_number),
      fillEmpty(number),
      fillEmpty(finalLicenseos),
      fillEmpty(finalLicensems),
      fillEmpty(license1),
      fillEmpty(license2),
      fillEmpty(license3),
      fillEmpty(license4),
      fillEmpty(category),
      costValue,
      purchaseDateValue,
      fillEmpty(ref_devicename)
    ]

    const result = await queryRepair(query, values)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Asset added successfully'
    })
  } catch (error: any) {
    console.error('Error adding asset:', error)
    
    // Check for unique constraint violation
    if (error?.code === '23505' || error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
      // If it's device_name constraint violation, show error
      if (error?.message?.includes('device_name') || error?.detail?.includes('device_name') || error?.constraint?.includes('device_name')) {
        const deviceNameMatch = error?.message?.match(/device_name[^"]*"([^"]+)"/i) || 
                               error?.detail?.match(/\(device_name\)=\(([^)]+)\)/i)
        const duplicateValue = deviceNameMatch ? deviceNameMatch[1] : (body.device_name || 'Unknown')
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Device name "${duplicateValue}" มีอยู่ในระบบแล้ว`
          },
          { status: 409 }
        )
      }

      // If it's asset_code constraint violation, skip silently (ข้ามโดยไม่แสดง error)
      if ((error?.message?.includes('asset_code') || error?.detail?.includes('asset_code') || error?.constraint?.includes('asset_code'))) {
        console.log('ข้าม asset_code ซ้ำ - ถือว่าสำเร็จ')
        return NextResponse.json({
          success: true,
          message: 'Asset skipped (duplicate asset_code)',
          skipped: true
        })
      }
      
      // For other unique constraint violations, check if it's device_name related
      if (body.device_name && body.device_name.trim() !== '' && body.device_name.trim() !== '-') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Device name "${body.device_name.trim()}" มีอยู่ในระบบแล้ว`
          },
          { status: 409 }
        )
      }

      // Other unique violations - skip silently
      console.log('ข้าม unique constraint error อื่นๆ')
      return NextResponse.json({
        success: true,
        message: 'Asset skipped (duplicate)',
        skipped: true
      })
    }

    // Check for other database constraint violations
    if (error?.code && error.code.startsWith('23')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้องตามที่กำหนด',
          details: error.message || 'Database constraint violation'
        },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/assets - ดึงข้อมูล assets พึงหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const distinct = searchParams.get('distinct')
    const search = searchParams.get('search')
    const company = searchParams.get('company')
    const department = searchParams.get('department')
    const site = searchParams.get('site')
    const userId = searchParams.get('user_id')
    const userName = searchParams.get('user_name')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    // Return distinct departments list when requested
    if (distinct === 'department') {
      const distinctQuery = `
        SELECT DISTINCT department 
        FROM public."Assets"
        WHERE department IS NOT NULL AND department <> ''
        ORDER BY department
      `
      const result = await queryRepair(distinctQuery)
      return NextResponse.json({
        success: true,
        data: result.rows.map((row: any) => row.department)
      })
    }

    let query = `
      SELECT 
        id, asset_code, user_id, user_name, company, site, department, device_name,
        brand, cpu, harddisk, ram, ip_address,
        mac_address, serial_number, number, 
        licenseos, licensems, 
        license1, license2, license3, license4,
        category, cost, purchase_date, ref_devicename,
        created_at, updated_at
      FROM public."Assets"
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 1

    // Filter by user_id or user_name (for viewing user's assets)
    if (userId || userName) {
      query += ` AND (`
      const conditions: string[] = []
      
      if (userId) {
        conditions.push(`user_id = $${paramCount}`)
        params.push(userId)
        paramCount++
      }
      
      if (userName) {
        conditions.push(`user_name ILIKE $${paramCount}`)
        params.push(`%${userName}%`)
        paramCount++
      }
      
      query += conditions.join(' OR ')
      query += `)`
    }

    if (search) {
      query += ` AND (
        asset_code ILIKE $${paramCount} OR
        user_name ILIKE $${paramCount} OR
        device_name ILIKE $${paramCount} OR
        brand ILIKE $${paramCount} OR
        serial_number ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    if (company && company !== 'all') {
      query += ` AND LOWER(company) = LOWER($${paramCount})`
      params.push(company)
      paramCount++
    }

    if (department && department !== 'all') {
      query += ` AND LOWER(department) = LOWER($${paramCount})`
      params.push(department)
      paramCount++
    }

    if (site && site !== 'all') {
      query += ` AND LOWER(site) = LOWER($${paramCount})`
      params.push(site)
      paramCount++
    }

    const category = searchParams.get('category')
    if (category && category !== 'all') {
      query += ` AND LOWER(category) = LOWER($${paramCount})`
      params.push(category)
      paramCount++
    }

    // Count total for pagination
    const countQuery = query.replace(/SELECT[\s\S]+?FROM/, 'SELECT COUNT(*) FROM')
    const countResult = await queryRepair(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    // Add pagination
    const offset = (page - 1) * pageSize
    query += ` ORDER BY asset_code LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(pageSize, offset)

    const result = await queryRepair(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
