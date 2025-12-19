import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // ตรวจสอบขนาดไฟล์ไม่เกิน 100MB
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 100MB" },
        { status: 400 }
      )
    }

    // แปลงไฟล์เป็น Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    
    // กำหนด path สำหรับบันทึกไฟล์
    const filepath = path.join(process.cwd(), "public", "uploads", filename)

    // บันทึกไฟล์
    await writeFile(filepath, buffer)

    // ส่ง URL กลับไป
    const fileUrl = `/uploads/${filename}`
    
    return NextResponse.json({ 
      success: true,
      url: fileUrl,
      filename: filename
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
