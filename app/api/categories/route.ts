import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// GET /api/categories - ดึงข้อมูลหมวดหมู่ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT id, category, created_at, updated_at
      FROM public.category
      ORDER BY category ASC
    `

    const result = await queryRepair(query, [])

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/categories - เพิ่มหมวดหมู่ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category } = body

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'category is required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO public.category (category, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      RETURNING *
    `

    const result = await queryRepair(query, [category])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully'
    })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'หมวดหมู่นี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
