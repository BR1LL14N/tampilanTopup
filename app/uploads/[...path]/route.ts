import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Sanitize path to prevent directory traversal attacks
    const safePath = pathSegments.map((s) => s.replace(/[^a-zA-Z0-9_.-]/g, "")).join("/");
    const filePath = path.join(process.cwd(), "public", "uploads", safePath);

    // Verify file exists on disk
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } catch (_) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read file and serve with appropriate MIME type
    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("[Uploads Route] Error serving uploaded file:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
