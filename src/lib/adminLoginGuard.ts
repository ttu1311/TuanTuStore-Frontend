// CHỐNG DÒ MẬT KHẨU QUẢN TRỊ (chỉ chạy ở server, trong Route Handler /api/admin/login).
//
// Mỗi địa chỉ IP nhập sai liên tiếp thì phải chờ lâu dần trước lần thử kế tiếp: 1, 2, 4, 8, 16… giây, tối đa 5 phút.
// Nhập đúng thì xóa bộ đếm của IP đó. Chỉ tính theo IP (không có bộ đếm chung), để người khác dò sai
// không khóa được chính quản trị viên.
//
// ⚠️ GIỚI HẠN: bộ đếm nằm trong BỘ NHỚ CỦA MỘT INSTANCE server. Trên Vercel, các yêu cầu có thể rơi vào nhiều instance khác nhau
// và instance bị dừng khi không dùng, nên bộ đếm không dùng chung và có thể bị xóa: nó làm việc dò chậm lại chứ không
// chặn tuyệt đối. Muốn chặn chắc chắn cần một kho dùng chung (ví dụ Redis), tức là cần back-end thật.
// IP lấy từ x-forwarded-for: trên Vercel do nền tảng đặt; khi tự chạy `npm run start` thì khách có thể tự gửi tiêu đề này.

const BASE_WAIT_SECONDS = 1;
const MAX_WAIT_SECONDS = 5 * 60;
const FORGET_AFTER_MS = 60 * 60 * 1000; // IP không thử gì trong 1 giờ thì quên
const MAX_ENTRIES = 5000; // giới hạn bộ nhớ: quá thì bỏ các IP cũ nhất

type Entry = { failures: number; blockedUntil: number; lastSeen: number };

const entries = new Map<string, Entry>();

function cleanUp(now: number) {
  for (const [ip, entry] of entries) {
    if (now - entry.lastSeen > FORGET_AFTER_MS) entries.delete(ip);
  }
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest === undefined) break;
    entries.delete(oldest);
  }
}

// IP của yêu cầu (lấy địa chỉ đầu tiên của x-forwarded-for). Không biết thì gom chung vào "unknown".
export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

// Còn phải chờ bao nhiêu giây trước khi được thử (0 = được thử ngay)
export function secondsUntilAllowed(ip: string) {
  const entry = entries.get(ip);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.blockedUntil - Date.now()) / 1000));
}

// Ghi một lần nhập sai; trả về số giây phải chờ trước lần thử kế tiếp
export function recordFailure(ip: string) {
  const now = Date.now();
  cleanUp(now);
  const failures = (entries.get(ip)?.failures ?? 0) + 1;
  const wait = Math.min(MAX_WAIT_SECONDS, BASE_WAIT_SECONDS * 2 ** (failures - 1));
  entries.delete(ip); // xóa rồi thêm lại: IP vừa hoạt động nằm cuối danh sách (bỏ IP cũ nhất trước)
  entries.set(ip, { failures, blockedUntil: now + wait * 1000, lastSeen: now });
  return wait;
}

export function recordSuccess(ip: string) {
  entries.delete(ip);
}
