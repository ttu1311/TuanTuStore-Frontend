// POST /api/admin/logout -> xóa cookie phiên quản trị và cờ gợi ý. Chỉ nhận yêu cầu từ chính website này.
import { NextResponse } from "next/server";
import { ADMIN_HINT_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/adminConstants";
import { isSameOrigin } from "@/lib/adminSession";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete(ADMIN_HINT_COOKIE);
  return response;
}
