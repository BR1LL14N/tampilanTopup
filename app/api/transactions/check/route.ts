import { NextRequest, NextResponse } from "next/server";
import { TransactionService } from "@/lib/services/transaction-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoice = searchParams.get("invoice");

    if (!invoice) {
      return NextResponse.json({ error: "Invoice is required" }, { status: 400 });
    }

    const transaction = await TransactionService.getDetailsByInvoice(invoice.trim().toUpperCase());

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (err: any) {
    console.error("Check transaction API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
