import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { TransactionService } from "@/lib/services/transaction-service";
import { executeQuery } from "@/lib/db";
import { createTopup } from "@/lib/digiflazz";

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
    const { id, payment_status, topup_status, action } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    if (action === "retry") {
      // Fetch transaction
      const txRows = await executeQuery(`SELECT * FROM transactions WHERE id = $1 LIMIT 1`, [id]);
      if (txRows.length === 0) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      const transaction = txRows[0];

      // Fetch product sku
      const prodRows = await executeQuery(`SELECT provider_sku FROM products WHERE id = $1 LIMIT 1`, [transaction.product_id]);
      if (prodRows.length === 0) {
        return NextResponse.json({ error: "Product SKU not found" }, { status: 404 });
      }
      const providerSku = prodRows[0].provider_sku;

      const isTesting = process.env.DIGIFLAZZ_MODE !== 'production';
      let topupStatus = 'processing';
      let providerRef = null;
      let providerResponse = null;

      try {
        const response = await createTopup(
          providerSku,
          transaction.target_id,
          transaction.invoice,
          isTesting
        );
        providerResponse = response;
        const responseData = response?.data;

        if (responseData) {
          providerRef = responseData.sn || null;
          if (responseData.rc === '00') {
            topupStatus = 'success';
          } else if (responseData.rc === '03' || responseData.rc === '39') {
            topupStatus = 'processing';
          } else {
            topupStatus = 'failed';
          }
        } else {
          topupStatus = 'failed';
        }
      } catch (apiError: any) {
        console.error('Digiflazz retry API call failed:', apiError);
        topupStatus = 'failed';
        providerResponse = { error: apiError.message || 'API Call failed' };
      }

      await TransactionService.update(transaction.id, {
        topup_status: topupStatus,
        provider_ref: providerRef,
        provider_response: JSON.stringify(providerResponse),
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({ 
        success: true, 
        topup_status: topupStatus, 
        provider_ref: providerRef 
      });
    }

    if (action === "refund") {
      await TransactionService.update(id, {
        topup_status: "failed",
        provider_ref: "REFUNDED",
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ 
        success: true, 
        topup_status: "failed", 
        provider_ref: "REFUNDED" 
      });
    }

    await TransactionService.updateStatus(id, payment_status, topup_status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
