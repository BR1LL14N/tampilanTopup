import { NextRequest, NextResponse } from 'next/server';
import { processOrderFulfillment } from '@/lib/fulfillment';

export async function POST(req: NextRequest) {
  try {
    const { invoice } = await req.json();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice is required' }, { status: 400 });
    }

    const result = await processOrderFulfillment(invoice);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Fulfillment failed' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Payment verified and topup processed', 
      data: result.transaction 
    });
  } catch (error: any) {
    console.error('Pay transaction API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
