// Xác minh token Cloudflare Turnstile Ở PHÍA SERVER (khóa bí mật không bao giờ tới trình duyệt).
// Dùng chung cho form đăng ký (/api/captcha/verify, action "register") và đăng nhập quản trị (/api/admin/login, action "admin-login").

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Khóa bí mật THỬ của Cloudflare (công khai trong tài liệu Turnstile): luôn trả về thành công.
// Chỉ dùng khi chạy dev mà chưa điền TURNSTILE_SECRET_KEY. Bản production không có key thật thì không có khóa nào (từ chối).
export const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

type SiteverifyResponse = { success: boolean; "error-codes"?: string[]; action?: string };

export function turnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY || (process.env.NODE_ENV === "production" ? "" : TEST_SECRET_KEY);
}

// IP của khách (không bắt buộc), giúp Cloudflare đánh giá chính xác hơn
export function turnstileClientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Token có dạng hợp lệ không (Turnstile: tối đa 2048 ký tự)
export function isTurnstileToken(token: unknown): token is string {
  return typeof token === "string" && token.length > 0 && token.length <= 2048;
}

// expectedAction: tên form mà widget gửi kèm token, để token của form khác không dùng được ở đây.
// Ném lỗi khi không kết nối được Cloudflare (nơi gọi trả về 502).
export async function verifyTurnstile(
  token: string,
  ip: string | null,
  expectedAction: string
): Promise<{ ok: true } | { ok: false; codes: string[] }> {
  const secret = turnstileSecretKey();
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const response = await fetch(SITEVERIFY_URL, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(8000) });
  const data = (await response.json()) as SiteverifyResponse;
  if (!data.success) return { ok: false, codes: data["error-codes"] ?? [] };
  // Khóa thử không gắn action, nên chỉ kiểm tra action với khóa thật
  if (secret !== TEST_SECRET_KEY && data.action !== expectedAction) return { ok: false, codes: ["action-mismatch"] };
  return { ok: true };
}
