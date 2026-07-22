import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { requestDepositTicket } from '@/lib/digiflazz';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { amount, bank, ownerName } = await req.json();

    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount < 10000) {
      return NextResponse.json({ error: 'Nominal deposit minimal Rp 10.000' }, { status: 400 });
    }

    if (!bank) {
      return NextResponse.json({ error: 'Pilih bank tujuan deposit' }, { status: 400 });
    }

    const res = await requestDepositTicket(parsedAmount, bank.toUpperCase(), ownerName || 'PEMILIK TOKO');

    if (res?.data?.rc === '00' || res?.data?.amount) {
      return NextResponse.json({
        success: true,
        depositTicket: res.data
      });
    } else {
      const errMsg = res?.data?.message || res?.message || 'Gagal membuat tiket deposit Digiflazz';
      return NextResponse.json({ error: errMsg, raw: res }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Digiflazz deposit ticket error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
