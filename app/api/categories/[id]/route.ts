import { NextRequest, NextResponse } from 'next/server'
import { queryRepair } from '@/lib/db'

// PUT /api/categories/[id] - แก้ไขข้อมูลหมวดหมู่
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { category } = body

    if (!category) {    
      return NextResponse.json(
        { success: false, error: 'category is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE public.category
      SET category = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `

    const result = await queryRepair(query, [category, id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'หมวดหมู่นี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - ลบหมวดหมู่
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `DELETE FROM public.category WHERE id = $1 RETURNING *`
    const result = await queryRepair(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
    