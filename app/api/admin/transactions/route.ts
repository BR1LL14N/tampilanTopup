import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { TransactionService } from "@/lib/services/transaction-service";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const transactions = await TransactionService.getAllDetails();
    return NextResponse.json({ transactions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id, payment_status, topup_status } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }
    await TransactionService.updateStatus(id, payment_status, topup_status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
