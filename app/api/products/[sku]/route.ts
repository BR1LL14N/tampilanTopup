import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sku: string }> }) {
  try {
    const { sku } = await params;
    
    const rows = await executeQuery(
      `SELECT * FROM product_details WHERE provider_sku = $1 LIMIT 1`,
      [sku]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (err: any) {
    console.error("Fetch product by SKU API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
