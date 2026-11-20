// POST /api/admin/login  { password, token }  ->  200 { ok: true } + cookie phiên quản trị
//                                               hoặc { ok: false, message, retryAfter?, missing? }
// Đăng nhập quản trị, kiểm tra Ở SERVER. Bảo vệ LỐI VÀO GIAO DIỆN ADMIN; dữ liệu cửa hàng vẫn ở localStorage và
// KHÔNG được bảo vệ (xem src/lib/adminSession.ts).
//
// Thứ tự: đã cấu hình chưa -> cùng nguồn -> IP này còn phải chờ không -> dữ liệu gửi lên -> CAPTCHA -> mật khẩu.
// Mỗi lần sai mật khẩu, IP đó phải chờ lâu dần (src/lib/adminLoginGuard.ts).
import { NextResponse } from "next/server";
import { ADMIN_HINT_COOKIE, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/adminConstants";
import { recordFailure, recordSuccess, requestIp, secondsUntilAllowed } from "@/lib/adminLoginGuard";
import { adminConfig, createAdminSession, isHttpsRequest, isSameOrigin, verifyAdminPassword } from "@/lib/adminSession";
import { isTurnstileToken, turnstileClientIp, turnstileSecretKey, verifyTurnstile } from "@/lib/turnstile";

const EXPECTED_ACTION = "admin-login"; // tên action của widget Turnstile ở trang đăng nhập quản trị
const ATTEMPT_DELAY_MS = 400; // mọi lần thử đều chậm một chút (đúng hay sai như nhau)
const MAX_PASSWORD_LENGTH = 256;

type Body = { ok: boolean; message?: string; retryAfter?: number; missing?: string[] };

function reply(status: number, body: Body, retryAfter?: number) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return NextResponse.json(body, { status, headers });
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  // Thiếu biến môi trường: từ chối ở MỌI môi trường (không có mật khẩu mặc định), và nói rõ thiếu biến nào
  const config = adminConfig();
  if (!config.ok) {
    return reply(503, {
      ok: false,
      missing: config.missing,
      message: `Chưa cấu hình đăng nhập quản trị. Cần đặt biến môi trường: ${config.missing.join(", ")} (xem README, mục "Admin login").`,
    });
  }
  if (!turnstileSecretKey()) {
    return reply(503, { ok: false, missing: ["TURNSTILE_SECRET_KEY"], message: "Chưa cấu hình CAPTCHA (TURNSTILE_SECRET_KEY)." });
  }
  if (!isSameOrigin(request)) return reply(403, { ok: false, message: "Yêu cầu không hợp lệ." });

  const ip = requestIp(request);
  const wait = secondsUntilAllowed(ip);
  if (wait > 0) {
    return reply(429, { ok: false, retryAfter: wait, message: `Bạn đã nhập sai nhiều lần. Vui lòng chờ ${wait} giây rồi thử lại.` }, wait);
  }

  let password: unknown;
  let token: unknown;
  try {
    ({ password, token } = (await request.json()) as { password?: unknown; token?: unknown });
  } catch {
    return reply(400, { ok: false, message: "Yêu cầu không hợp lệ." });
  }
  if (typeof password !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return reply(400, { ok: false, message: "Vui lòng nhập mật khẩu quản trị." });
  }
  if (!isTurnstileToken(token)) return reply(400, { ok: false, message: "Vui lòng xác nhận bạn không phải robot." });

  await pause(ATTEMPT_DELAY_MS);

  try {
    const captcha = await verifyTurnstile(token, turnstileClientIp(request), EXPECTED_ACTION);
    if (!captcha.ok) return reply(400, { ok: false, message: "Xác minh CAPTCHA không thành công hoặc đã hết hạn. Vui lòng thử lại." });
  } catch {
    return reply(502, { ok: false, message: "Không kết nối được dịch vụ CAPTCHA. Vui lòng thử lại." });
  }

  if (!(await verifyAdminPassword(password, config.hash))) {
    const nextWait = recordFailure(ip);
    return reply(401, { ok: false, retryAfter: nextWait, message: `Mật khẩu không đúng. Thử lại sau ${nextWait} giây.` }, nextWait);
  }

  recordSuccess(ip);
  const response = reply(200, { ok: true });
  // Secure theo giao thức thật của yêu cầu (https trên Vercel; http khi mở bằng địa chỉ mạng nội bộ)
  const secure = isHttpsRequest(request);
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(config.secret), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  // Cờ gợi ý cho giao diện (hiện liên kết "Quản trị"): JavaScript đọc được, KHÔNG cấp quyền gì
  response.cookies.set(ADMIN_HINT_COOKIE, "1", { httpOnly: false, secure, sameSite: "strict", path: "/", maxAge: ADMIN_SESSION_MAX_AGE });
  return response;
}
