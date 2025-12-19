import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET /api/assets/[id] - ดึงข้อมูล asset ตาม id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `
      SELECT 
        id, asset_code, user_id, user_name, site, department, device_name,
        brand, cpu, harddisk, ram, ip_address,
        mac_address, serial_number, number, 
        licenseos, licensems, 
        license1, license2, license3, license4,
        category, cost, purchase_date, ref_devicename,
        created_at, updated_at
      FROM public."Assets"
      WHERE id = $1
    `

    const result = await queryRepair(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/assets/[id] - อัพเดทข้อมูล asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const {
      asset_code, user_id, user_name, site, department, device_name,
      brand, cpu, harddisk, ram, ip_address,
      mac_address, serial_number, number, licenseos, licensems,
      license1, license2, license3, license4, category, cost, purchase_date, ref_devicename,
      // Support legacy field names
      licenseOS, licenseMS
    } = body

    // Use lowercase field names, fallback to legacy camelCase if provided
    const finalLicenseos = licenseos || licenseOS
    const finalLicensems = licensems || licenseMS

    const fillEmpty = (val: any) => (val && String(val).trim() !== '') ? String(val).trim() : '-'

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

    let purchaseDateValue: string | null = null
    if (purchase_date && purchase_date !== '' && purchase_date !== 'null') {
      try {
        const date = new Date(purchase_date)
        if (!isNaN(date.getTime())) {
          purchaseDateValue = date.toISOString().split('T')[0]
        }
      } catch (e) {
        if (typeof purchase_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(purchase_date)) {
          purchaseDateValue = purchase_date.split('T')[0]
        }
      }
    }

    const finalAssetCode = (asset_code && asset_code.trim() !== '' && asset_code.trim() !== '-')
      ? asset_code.trim()
      : null

    const query = `
      UPDATE public."Assets"
      SET 
        asset_code = $1,
        user_id = $2,
        user_name = $3,
        site = $4,
        department = $5,
        device_name = $6,
        brand = $7,
        cpu = $8,
        harddisk = $9,
        ram = $10,
        ip_address = $11,
        mac_address = $12,
        serial_number = $13,
        number = $14,
        licenseos = $15,
        licensems = $16,
        license1 = $17,
        license2 = $18,
        license3 = $19,
        license4 = $20,
        category = $21,
        cost = $22,
        purchase_date = $23,
        ref_devicename = $24,
        updated_at = NOW()
      WHERE id = $25
      RETURNING *
    `

    const values = [
      finalAssetCode,
      fillEmpty(user_id),
      fillEmpty(user_name),
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
      fillEmpty(ref_devicename),
      id
    ]

    const result = await queryRepair(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Asset updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating asset:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/assets/[id] - ลบข้อมูล asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `DELETE FROM public."Assets" WHERE id = $1 RETURNING *`
    const result = await queryRepair(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting asset:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
