// GET /api/admin/session -> { admin: true | false }: cookie phiên quản trị của trình duyệt này có hợp lệ không.
// Giao diện dùng nó để hiện liên kết "Quản trị" và nút xóa đánh giá của Admin. Quyền vào /admin vẫn do src/proxy.ts kiểm tra.
// Phiên không còn hợp lệ (hết hạn, đổi khóa) thì xóa luôn cookie cũ và cờ gợi ý, để liên kết "Quản trị" biến mất.
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_HINT_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/adminConstants";
import { isValidAdminSession } from "@/lib/adminSession";

export async function GET(request: NextRequest) {
  const admin = isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  const response = NextResponse.json({ admin }, { headers: { "Cache-Control": "no-store" } });
  if (!admin) {
    if (request.cookies.has(ADMIN_SESSION_COOKIE)) response.cookies.delete(ADMIN_SESSION_COOKIE);
    if (request.cookies.has(ADMIN_HINT_COOKIE)) response.cookies.delete(ADMIN_HINT_COOKIE);
  }
  return response;
}
