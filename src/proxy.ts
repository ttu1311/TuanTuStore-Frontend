// Chặn mọi trang /admin Ở SERVER (Next.js 16 gọi middleware là "proxy"; chạy trên Node.js, trước khi trang được tạo).
// Không có cookie phiên quản trị hợp lệ (src/lib/adminSession.ts) -> chuyển tới trang đăng nhập quản trị và KHÔNG gửi trang admin.
// Sửa localStorage (ví dụ tự gắn vai trò ADMIN) không còn mở được /admin.
//
// PHẠM VI: đây là bảo vệ LỐI VÀO GIAO DIỆN ADMIN. Dữ liệu cửa hàng vẫn nằm trong localStorage của từng trình duyệt
// và KHÔNG được bảo vệ (ai dùng trình duyệt đó vẫn đọc / sửa được bằng công cụ nhà phát triển).
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_HINT_COOKIE, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "@/lib/adminConstants";
import { isValidAdminSession } from "@/lib/adminSession";

export function proxy(request: NextRequest) {
  if (isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store"); // trang quản trị không được lưu ở bộ nhớ đệm dùng chung
    return response;
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(loginUrl);
  // Phiên cũ (hết hạn, sai chữ ký) và cờ gợi ý: xóa luôn
  if (request.cookies.has(ADMIN_SESSION_COOKIE)) response.cookies.delete(ADMIN_SESSION_COOKIE);
  if (request.cookies.has(ADMIN_HINT_COOKIE)) response.cookies.delete(ADMIN_HINT_COOKIE);
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
