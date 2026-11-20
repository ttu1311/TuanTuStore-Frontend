// ĐĂNG NHẬP QUẢN TRỊ: CHỈ CHẠY Ở SERVER (Route Handler /api/admin/* và src/proxy.ts). Dùng node:crypto.
//
// PHẠM VI BẢO VỆ: đây là bảo vệ LỐI VÀO GIAO DIỆN ADMIN (các trang /admin). Dữ liệu của cửa hàng (sản phẩm, đơn hàng,
// người dùng, mã giảm giá) vẫn nằm trong localStorage của từng trình duyệt, nên KHÔNG được bảo vệ: ai dùng trình duyệt đó
// vẫn đọc và sửa được bằng công cụ nhà phát triển. Mật khẩu của khách hàng vẫn lưu chữ thường (xem src/lib/password.ts).
//
// Cách hoạt động:
// - Mật khẩu quản trị không nằm trong code hay trong repo: server chỉ giữ MÃ BĂM scrypt của nó trong biến môi trường
//   ADMIN_PASSWORD_HASH (tạo bằng `npm run admin:hash`). Dạng: scrypt:N:r:p:muối:mã băm (base64url).
//   Dùng ":" chứ không dùng "$", vì Next.js đọc .env theo kiểu dotenv-expand và hiểu "$" là tên biến.
// - Đăng nhập đúng: server cấp một phiên dạng "v1.<hết hạn>.<số ngẫu nhiên>.<chữ ký>", ký HMAC-SHA256 bằng
//   ADMIN_SESSION_SECRET, đặt vào cookie httpOnly. Không có khóa bí mật thì không làm giả được phiên.
//   Đổi ADMIN_SESSION_SECRET = đăng xuất mọi phiên đang có.
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { ADMIN_SESSION_MAX_AGE } from "@/lib/adminConstants";

const MIN_SECRET_LENGTH = 32;

type ParsedHash = { N: number; r: number; p: number; salt: Buffer; hash: Buffer };

// "scrypt:32768:8:1:<muối>:<mã băm>" -> các phần, hoặc null nếu sai dạng / tham số bất thường
function parseHash(value: string): ParsedHash | null {
  const parts = value.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], "base64url");
  const hash = Buffer.from(parts[5], "base64url");
  const powerOfTwo = Number.isInteger(N) && N >= 2 ** 14 && N <= 2 ** 20 && (N & (N - 1)) === 0;
  if (!powerOfTwo || !Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 4) return null;
  if (salt.length < 16 || hash.length < 32 || hash.length > 64) return null;
  return { N, r, p, salt, hash };
}

export type AdminConfig = { ok: true; hash: ParsedHash; secret: string } | { ok: false; missing: string[] };

// Đọc cấu hình ở mỗi lần gọi (không lưu lại), nên đổi biến môi trường rồi khởi động lại server là có hiệu lực.
// Thiếu hoặc sai dạng biến nào thì báo đúng tên biến đó; khi đó MỌI lần đăng nhập quản trị đều bị từ chối.
export function adminConfig(): AdminConfig {
  const hash = parseHash(process.env.ADMIN_PASSWORD_HASH?.trim() ?? "");
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  const missing: string[] = [];
  if (!hash) missing.push("ADMIN_PASSWORD_HASH");
  if (secret.length < MIN_SECRET_LENGTH) missing.push("ADMIN_SESSION_SECRET");
  return hash && missing.length === 0 ? { ok: true, hash, secret } : { ok: false, missing };
}

function scryptAsync(password: string, salt: Buffer, keylen: number, N: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, { N, r, p, maxmem: 256 * N * r + 1024 * 1024 }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

// Mật khẩu gõ vào có khớp mã băm không. So sánh trong thời gian không đổi (không lộ thông tin qua thời gian trả lời).
// NFKC: cùng một chữ tiếng Việt gõ bằng các bàn phím khác nhau vẫn ra cùng một mật khẩu (giống script tạo mã băm).
export async function verifyAdminPassword(password: string, hash: ParsedHash) {
  const key = await scryptAsync(password.normalize("NFKC"), hash.salt, hash.hash.length, hash.N, hash.r, hash.p);
  return timingSafeEqual(key, hash.hash);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Phiên mới, hết hạn sau ADMIN_SESSION_MAX_AGE giây
export function createAdminSession(secret: string) {
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `v1.${expires}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

// Cookie phiên có hợp lệ không: đúng dạng, đúng chữ ký, chưa hết hạn, và server đã được cấu hình
export function isValidAdminSession(token: string | undefined) {
  if (!token || token.length > 200) return false;
  const config = adminConfig();
  if (!config.ok) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(parts.slice(0, 3).join("."), config.secret));
  const given = Buffer.from(parts[3]);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Cookie có cờ Secure hay không theo GIAO THỨC THẬT của yêu cầu, không theo NODE_ENV:
// https (Vercel) -> Secure; http (npm run start mở qua http://192.168.x.x trong mạng nội bộ) -> không Secure,
// nếu không trình duyệt sẽ không gửi lại cookie và không đăng nhập được.
export function isHttpsRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  return new URL(request.url).protocol === "https:";
}

// Yêu cầu POST tới /api/admin/* phải đến từ chính website này (chặn trang lạ gửi form đăng nhập / đăng xuất thay khách).
// Trình duyệt luôn gửi Origin với fetch POST; công cụ dòng lệnh không có Origin thì cho qua (chúng không mang cookie của khách).
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
