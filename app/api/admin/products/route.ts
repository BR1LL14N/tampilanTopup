import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { ProductService } from "@/lib/services/product-service";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const products = await ProductService.getAllDetails();
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const data = await req.json();
    const product = await ProductService.create(data);
    return NextResponse.json({ success: true, product });
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
    const body = await req.json();
    if (body.action === "unlock_all") {
      await ProductService.unlockAllPrices();
      return NextResponse.json({ success: true, message: "Semua kunci harga manual berhasil dibuka." });
    }
    if (body.action === "bulk_lock") {
      const { ids, is_manual_price } = body;
      await ProductService.bulkUpdatePriceLock(!!is_manual_price, ids);
      return NextResponse.json({ success: true, count: ids ? ids.length : "all" });
    }
    if (body.action === "toggle_lock") {
      const { id, is_manual_price } = body;
      if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
      const newStatus = await ProductService.togglePriceLock(id, is_manual_price);
      return NextResponse.json({ success: true, is_manual_price: newStatus });
    }
    if (body.action === "bulk_status" || (Array.isArray(body.ids) && body.status !== undefined)) {
      const { ids, status } = body;
      await ProductService.bulkUpdateStatus(!!status, ids);
      return NextResponse.json({ success: true, count: ids ? ids.length : "all" });
    }
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }
    await ProductService.update(id, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }
    await ProductService.delete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
