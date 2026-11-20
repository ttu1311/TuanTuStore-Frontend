// Tên cookie và đường dẫn của đăng nhập quản trị. Dùng được ở cả server lẫn trình duyệt: file này KHÔNG chứa bí mật nào.
// Phần kiểm tra mật khẩu và chữ ký phiên nằm ở src/lib/adminSession.ts (chỉ chạy ở server).

// Cookie phiên quản trị: httpOnly (JavaScript của trang không đọc được), ký bằng ADMIN_SESSION_SECRET
export const ADMIN_SESSION_COOKIE = "tt_admin";

// Cờ gợi ý "có thể đang đăng nhập quản trị" (JavaScript đọc được). Nó KHÔNG cấp quyền gì: chỉ để giao diện biết
// có nên hỏi /api/admin/session hay không (hiện liên kết "Quản trị"), để khách thường không phải gọi API đó ở mỗi trang.
// Quyền vào /admin luôn do src/proxy.ts kiểm tra cookie phiên ở server.
export const ADMIN_HINT_COOKIE = "tt_admin_hint";

export const ADMIN_SESSION_MAX_AGE = 2 * 60 * 60; // phiên quản trị dài 2 giờ (giây)

export const ADMIN_LOGIN_PATH = "/dang-nhap-quan-tri";
export const ADMIN_HOME_PATH = "/admin";

// Trình duyệt có cờ gợi ý không (chỉ gọi ở trình duyệt)
export function hasAdminHint() {
  return typeof document !== "undefined" && document.cookie.split(";").some((part) => part.trim().startsWith(`${ADMIN_HINT_COOKIE}=`));
}

// ?next= của trang đăng nhập quản trị: chỉ nhận đường dẫn bên trong /admin, còn lại về trang tổng quan
export function safeAdminNext(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || path.length > 300 || path.startsWith("//") || path.includes("\\")) return ADMIN_HOME_PATH;
  return path === ADMIN_HOME_PATH || path.startsWith(`${ADMIN_HOME_PATH}/`) ? path : ADMIN_HOME_PATH;
}
