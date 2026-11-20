// POST /api/captcha/verify  { token }  ->  { success: true }  hoặc  { success: false, message }
// Xác minh token Cloudflare Turnstile Ở PHÍA SERVER (khóa bí mật không bao giờ tới trình duyệt).
// Form đăng ký gọi route này trước khi tạo tài khoản. Phần xác minh dùng chung nằm ở src/lib/turnstile.ts.
//
// ⚠️ GIỚI HẠN HIỆN TẠI: tài khoản vẫn được tạo trong localStorage của trình duyệt (dự án chưa có backend/database),
// nên một bot cố ý vẫn có thể bỏ qua bước này. Khi có backend: API đăng ký phải tự gọi verifyTurnstile()
// và chỉ tạo tài khoản khi xác minh thành công.
import { isTurnstileToken, turnstileClientIp, turnstileSecretKey, verifyTurnstile } from "@/lib/turnstile";

// Tên "action" mà widget ở form đăng ký gửi kèm token, để token của form khác không dùng được ở đây
const EXPECTED_ACTION = "register";

function reply(status: number, body: { success: boolean; message?: string }) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!turnstileSecretKey()) {
    return reply(500, { success: false, message: "Website chưa cấu hình CAPTCHA (TURNSTILE_SECRET_KEY). Vui lòng thử lại sau." });
  }

  let token: unknown;
  try {
    ({ token } = (await request.json()) as { token?: unknown });
  } catch {
    return reply(400, { success: false, message: "Yêu cầu không hợp lệ." });
  }
  if (!isTurnstileToken(token)) {
    return reply(400, { success: false, message: "Vui lòng xác nhận bạn không phải robot." });
  }

  try {
    const result = await verifyTurnstile(token, turnstileClientIp(request), EXPECTED_ACTION);
    if (!result.ok) {
      // Token hết hạn, đã dùng rồi, hoặc không hợp lệ: khách làm lại CAPTCHA
      return reply(400, { success: false, message: "Xác minh CAPTCHA không thành công hoặc đã hết hạn. Vui lòng thử lại." });
    }
    return reply(200, { success: true });
  } catch {
    return reply(502, { success: false, message: "Không kết nối được dịch vụ CAPTCHA. Vui lòng thử lại." });
  }
}
