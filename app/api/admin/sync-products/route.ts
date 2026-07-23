import { NextRequest } from "next/server";
import { POST as triggerPost } from "../sync/trigger/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return triggerPost(req);
}

