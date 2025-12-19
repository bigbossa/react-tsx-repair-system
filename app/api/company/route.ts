import { NextResponse } from "next/server"
import { queryRepair } from "@/lib/db"

// GET - ดึงข้อมูล company ทั้งหมด
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // ดึงข้อมูล company ตาม ID
      const result = await queryRepair(
        "SELECT * FROM company WHERE id = $1",
        [id]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "ไม่พบข้อมูลบริษัท" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(result.rows[0])
    } else {
      // ดึงข้อมูล company ทั้งหมด เรียงตามชื่อ
      const result = await queryRepair(
        "SELECT * FROM company ORDER BY company_name ASC"
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

// POST - เพิ่ม company ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company_code, company_name } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!company_code || !company_name) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสและชื่อบริษัท" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ารหัสซ้ำหรือไม่
    const checkCode = await queryRepair(
      "SELECT * FROM company WHERE company_code = $1",
      [company_code]
    )

    if (checkCode.rows.length > 0) {
      return NextResponse.json(
        { error: "รหัสบริษัทนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      )
    }

    const result = await queryRepair(
      `INSERT INTO company (company_code, company_name, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING *`,
      [company_code, company_name]
    )

    return NextResponse.json(
      { message: "เพิ่มบริษัทสำเร็จ", data: result.rows[0] },
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

// PUT - แก้ไขข้อมูล company
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, company_code, company_name } = body

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID ของบริษัท" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า company มีอยู่จริง
    const checkResult = await queryRepair(
      "SELECT * FROM company WHERE id = $1",
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลบริษัท" },
        { status: 404 }
      )
    }

    // ตรวจสอบรหัสซ้ำ (ยกเว้นตัวเอง)
    const checkCode = await queryRepair(
      "SELECT * FROM company WHERE company_code = $1 AND id != $2",
      [company_code, id]
    )

    if (checkCode.rows.length > 0) {
      return NextResponse.json(
        { error: "รหัสบริษัทนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      )
    }

    const result = await queryRepair(
      `UPDATE company 
       SET company_code = $1, company_name = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [company_code, company_name, id]
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

// DELETE - ลบ company
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID ของบริษัท" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า company มีอยู่จริง
    const checkResult = await queryRepair(
      "SELECT * FROM company WHERE id = $1",
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลบริษัท" },
        { status: 404 }
      )
    }

    await queryRepair("DELETE FROM company WHERE id = $1", [id])

    return NextResponse.json({
      message: "ลบบริษัทสำเร็จ"
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    )
  }
}
