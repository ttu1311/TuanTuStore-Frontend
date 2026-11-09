// POST /api/captcha/verify  { token }  ->  { success: true }  hoặc  { success: false, message }
// Xác minh token Cloudflare Turnstile Ở PHÍA SERVER (khóa bí mật không bao giờ tới trình duyệt).
// Form đăng ký gọi route này trước khi tạo tài khoản.
//
// ⚠️ GIỚI HẠN HIỆN TẠI: tài khoản vẫn được tạo trong localStorage của trình duyệt (dự án chưa có backend/database),
// nên một bot cố ý vẫn có thể bỏ qua bước này. Khi có backend: API đăng ký phải tự gọi verifyTurnstile() bên dưới
// và chỉ tạo tài khoản khi xác minh thành công.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Khóa bí mật THỬ của Cloudflare (công khai trong tài liệu Turnstile): luôn trả về thành công.
// Chỉ dùng khi chạy dev mà chưa điền TURNSTILE_SECRET_KEY. Bản production không có key thật thì từ chối đăng ký.
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// Tên "action" mà widget ở form đăng ký gửi kèm token, để token của form khác không dùng được ở đây
const EXPECTED_ACTION = "register";

type SiteverifyResponse = { success: boolean; "error-codes"?: string[]; action?: string };

function secretKey() {
  return process.env.TURNSTILE_SECRET_KEY || (process.env.NODE_ENV === "production" ? "" : TEST_SECRET_KEY);
}

async function verifyTurnstile(token: string, ip: string | null): Promise<{ ok: true } | { ok: false; codes: string[] }> {
  const secret = secretKey();
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const response = await fetch(SITEVERIFY_URL, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(8000) });
  const data = (await response.json()) as SiteverifyResponse;
  if (!data.success) return { ok: false, codes: data["error-codes"] ?? [] };
  // Khóa thử không gắn action, nên chỉ kiểm tra action với khóa thật
  if (secret !== TEST_SECRET_KEY && data.action !== EXPECTED_ACTION) return { ok: false, codes: ["action-mismatch"] };
  return { ok: true };
}

function reply(status: number, body: { success: boolean; message?: string }) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!secretKey()) {
    return reply(500, { success: false, message: "Website chưa cấu hình CAPTCHA (TURNSTILE_SECRET_KEY). Vui lòng thử lại sau." });
  }

  let token: unknown;
  try {
    ({ token } = (await request.json()) as { token?: unknown });
  } catch {
    return reply(400, { success: false, message: "Yêu cầu không hợp lệ." });
  }
  // Token Turnstile dài tối đa 2048 ký tự
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return reply(400, { success: false, message: "Vui lòng xác nhận bạn không phải robot." });
  }

  // IP của khách (không bắt buộc), giúp Cloudflare đánh giá chính xác hơn
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    const result = await verifyTurnstile(token, ip);
    if (!result.ok) {
      // Token hết hạn, đã dùng rồi, hoặc không hợp lệ: khách làm lại CAPTCHA
      return reply(400, { success: false, message: "Xác minh CAPTCHA không thành công hoặc đã hết hạn. Vui lòng thử lại." });
    }
    return reply(200, { success: true });
  } catch {
    return reply(502, { success: false, message: "Không kết nối được dịch vụ CAPTCHA. Vui lòng thử lại." });
  }
}
