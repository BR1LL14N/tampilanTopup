import { NextRequest, NextResponse } from 'next/server';
import { processOrderFulfillment } from '@/lib/fulfillment';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Akses ditolak. Eksekusi pengisian produk manual hanya dapat dilakukan oleh Administrator terverifikasi.' 
      }, { status: 403 });
    }

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
