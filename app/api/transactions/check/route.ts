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

    // If transaction is still pending payment, proactively query Midtrans API for real-time status
    if (transaction.payment_status === "pending") {
      try {
        const { SettingService } = await import("@/lib/services/setting-service");
        const dbGateway = await SettingService.get("payment_gateway", "midtrans");
        
        if (dbGateway === "midtrans") {
          const dbMidtransMode = await SettingService.get("midtrans_mode", "sandbox");
          const isProduction = dbMidtransMode === "production";
          const serverKey = isProduction
            ? process.env.MIDTRANS_SERVER_KEY
            : (process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY);

          if (serverKey) {
            const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
            const checkUrl = isProduction
              ? `https://api.midtrans.com/v2/${transaction.invoice}/status`
              : `https://api.sandbox.midtrans.com/v2/${transaction.invoice}/status`;

            const midRes = await fetch(checkUrl, {
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": authHeader,
              },
              cache: "no-store",
            });

            if (midRes.ok) {
              const midData = await midRes.json();
              if (midData && (midData.transaction_status === "settlement" || (midData.transaction_status === "capture" && midData.fraud_status === "accept"))) {
                console.log(`[Check API] Invoice ${transaction.invoice} verified PAID via Midtrans API. Fulfilling order...`);
                const { processOrderFulfillment } = await import("@/lib/fulfillment");
                await processOrderFulfillment(transaction.invoice);
                
                // Return fresh updated transaction with paid & fulfillment details
                const freshTx = await TransactionService.getDetailsByInvoice(transaction.invoice);
                if (freshTx) {
                  return NextResponse.json({ transaction: freshTx });
                }
              } else if (midData && ["expire", "cancel", "deny"].includes(midData.transaction_status)) {
                console.log(`[Check API] Invoice ${transaction.invoice} is ${midData.transaction_status} on Midtrans. Updating status...`);
                await TransactionService.update(transaction.id, {
                  payment_status: midData.transaction_status === "expire" ? "expired" : "failed",
                  topup_status: "failed",
                  updated_at: new Date().toISOString(),
                });
                const freshTx = await TransactionService.getDetailsByInvoice(transaction.invoice);
                if (freshTx) {
                  return NextResponse.json({ transaction: freshTx });
                }
              }
            }
          }
        }
      } catch (checkErr) {
        console.error("[Check API] Error proactively verifying Midtrans status:", checkErr);
      }
    }

    return NextResponse.json({ transaction });
  } catch (err: any) {
    console.error("Check transaction API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
