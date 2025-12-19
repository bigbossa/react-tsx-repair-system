import { NextResponse } from "next/server"
import { queryRepair } from "@/lib/db"

// GET - ดึงข้อมูลอุปกรณ์ทั้งหมด
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // ดึงข้อมูลอุปกรณ์ตาม ID
      const result = await queryRepair(
        "SELECT * FROM devices WHERE id = $1",
        [id]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "ไม่พบข้อมูลอุปกรณ์" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(result.rows[0])
    } else {
      // ดึงข้อมูลอุปกรณ์ทั้งหมด เรียงตาม created_at ล่าสุด
      const result = await queryRepair(
        "SELECT * FROM devices ORDER BY created_at DESC"
      )
      
      return NextResponse.json(result.rows)
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    )
  }
}

// POST - เพิ่มอุปกรณ์ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { devices_name, amount_device, price, detail_device } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!devices_name || !amount_device || !price) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      )
    }

    const result = await queryRepair(
      `INSERT INTO devices (devices_name, amount_device, price, detail_device, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [devices_name, amount_device, price, detail_device || null]
    )

    return NextResponse.json(
      { message: "เพิ่มอุปกรณ์สำเร็จ", data: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล" },
      { status: 500 }
    )
  }
}

// PUT - แก้ไขข้อมูลอุปกรณ์
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, devices_name, amount_device, price, detail_device } = body

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID ของอุปกรณ์" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าอุปกรณ์มีอยู่จริง
    const checkResult = await queryRepair(
      "SELECT * FROM devices WHERE id = $1",
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลอุปกรณ์" },
        { status: 404 }
      )
    }

    const result = await queryRepair(
      `UPDATE devices 
       SET devices_name = $1, amount_device = $2, price = $3, detail_device = $4, updated_at = NOW() 
       WHERE id = $5 
       RETURNING *`,
      [devices_name, amount_device, price, detail_device || null, id]
    )

    return NextResponse.json({
      message: "แก้ไขข้อมูลสำเร็จ",
      data: result.rows[0]
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 }
    )
  }
}

// DELETE - ลบอุปกรณ์
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID ของอุปกรณ์" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าอุปกรณ์มีอยู่จริง
    const checkResult = await queryRepair(
      "SELECT * FROM devices WHERE id = $1",
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลอุปกรณ์" },
        { status: 404 }
      )
    }

    await queryRepair("DELETE FROM devices WHERE id = $1", [id])

    return NextResponse.json({
      message: "ลบอุปกรณ์สำเร็จ"
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    )
  }
}
