import { NextRequest, NextResponse } from 'next/server';
import { queryRepair } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific subscription
      const result = await queryRepair(
        'SELECT * FROM subscription_expiry WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } else {
      // Get all subscriptions
      const result = await queryRepair(
        'SELECT * FROM subscription_expiry ORDER BY expiry_date ASC'
      );
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      expiry_date,
      alert_date,
      payment_due_date,
      program_name,
      sub_name,
      contact_name,
      phone,
      company_name,
      description,
      status,
      renewed_months
    } = body;

    const result = await queryRepair(
      `INSERT INTO subscription_expiry 
      (expiry_date, alert_date, payment_due_date, program_name, sub_name, contact_name, phone, company_name, description, status, renewed_months)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [expiry_date, alert_date, payment_due_date, program_name, sub_name, contact_name, phone, company_name, description, status || 'renewed', renewed_months || 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      expiry_date,
      alert_date,
      payment_due_date,
      program_name,
      sub_name,
      contact_name,
      phone,
      company_name,
      description,
      status,
      renewed_months
    } = body;

    const result = await queryRepair(
      `UPDATE subscription_expiry 
      SET expiry_date = $1, alert_date = $2, payment_due_date = $3, 
          program_name = $4, sub_name = $5, contact_name = $6, 
          phone = $7, company_name = $8, description = $9, status = $10, renewed_months = $11
      WHERE id = $12
      RETURNING *`,
      [expiry_date, alert_date, payment_due_date, program_name, sub_name, contact_name, phone, company_name, description, status || 'renewed', renewed_months || 0, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update subscription', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const result = await queryRepair(
      'DELETE FROM subscription_expiry WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
