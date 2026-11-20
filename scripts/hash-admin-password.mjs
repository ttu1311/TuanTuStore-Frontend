// Tạo hai biến môi trường cho đăng nhập quản trị (xem README, mục "Admin login"):
//   ADMIN_PASSWORD_HASH  : mã băm scrypt của mật khẩu quản trị (server chỉ giữ mã băm, không giữ mật khẩu)
//   ADMIN_SESSION_SECRET : khóa ngẫu nhiên để ký cookie phiên quản trị
//
// Chạy:  npm run admin:hash   rồi gõ mật khẩu khi được hỏi.
// Mật khẩu CHỈ được nhập qua ô nhập ẩn (không hiện ký tự). Script không nhận mật khẩu qua tham số dòng lệnh hay qua đường ống (pipe),
// để mật khẩu không nằm lại trong lịch sử lệnh của terminal hay trong file nào.
// Dạng mã băm: scrypt:N:r:p:muối:mã băm (base64url), dùng ":" vì Next.js hiểu "$" trong .env là tên biến.
// Phải khớp với cách kiểm tra trong src/lib/adminSession.ts (cùng scrypt, cùng chuẩn hóa NFKC).
import { randomBytes, scrypt } from "node:crypto";

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const MIN_LENGTH = 12;

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

if (process.argv.length > 2) {
  fail("Script không nhận mật khẩu qua tham số dòng lệnh. Chạy: npm run admin:hash rồi gõ mật khẩu khi được hỏi.");
}
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  fail("Cần chạy trong một cửa sổ terminal (không nhận mật khẩu qua pipe hay file).");
}

// Tắt hiện chữ NGAY từ đầu và giữ suốt phiên (kể cả giữa hai câu hỏi), để chữ gõ trước khi dấu nhắc kịp hiện cũng không lộ ra.
// Thoát (kể cả do lỗi) thì trả terminal về bình thường.
process.stdin.setRawMode(true);
process.on("exit", () => {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
});

// Hỏi một dòng mà KHÔNG hiện ký tự đã gõ. Enter: xong. Backspace: xóa ký tự cuối. Ctrl+C: hủy.
// Phím gõ được gom vào `pending`: phần gõ (hoặc dán) dư sau Enter được dùng cho câu hỏi kế tiếp, không bị mất.
let pending = "";

function askHidden(question) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = "";
    let done = false;
    const cleanup = () => {
      stdin.removeListener("data", onData);
      stdin.pause();
    };
    const consume = () => {
      while (pending.length > 0 && !done) {
        const char = Array.from(pending)[0];
        pending = pending.slice(char.length);
        if (char === "\r" || char === "\n") {
          if (char === "\r" && pending.startsWith("\n")) pending = pending.slice(1); // Enter dạng \r\n
          done = true;
          cleanup();
          process.stdout.write("\n");
          resolve(value);
        } else if (char === "\u0003") {
          done = true;
          cleanup();
          reject(new Error("Đã hủy."));
        } else if (char === "\u007f" || char === "\b") {
          value = Array.from(value).slice(0, -1).join("");
        } else if (char >= " ") {
          value += char; // bỏ qua các ký tự điều khiển khác
        }
      }
    };
    const onData = (chunk) => {
      if (chunk.startsWith("\u001b")) return; // phím mũi tên, phím chức năng: bỏ qua
      pending += chunk;
      consume();
    };
    process.stdout.write(question);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
    consume(); // phần dư từ câu hỏi trước
  });
}

function hash(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 256 * N * R + 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key)
    );
  });
}

try {
  console.log("Tạo mật khẩu quản trị cho Đặc sản 3 Miền (ký tự gõ vào sẽ không hiện ra).");
  const password = (await askHidden("Mật khẩu quản trị mới: ")).normalize("NFKC");
  if (Array.from(password).length < MIN_LENGTH) fail(`Mật khẩu phải có ít nhất ${MIN_LENGTH} ký tự.`);
  const again = (await askHidden("Nhập lại mật khẩu: ")).normalize("NFKC");
  if (password !== again) fail("Hai lần nhập không khớp. Chạy lại script.");

  const salt = randomBytes(16);
  const key = await hash(password, salt);
  const passwordHash = ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join(":");
  const sessionSecret = randomBytes(32).toString("base64url");

  console.log(`
Dán hai dòng sau vào .env.local (chạy trên máy), hoặc vào Vercel → Project → Settings → Environment Variables
(đặt cho CẢ Production và Preview), rồi khởi động lại server / deploy lại:

ADMIN_PASSWORD_HASH=${passwordHash}
ADMIN_SESSION_SECRET=${sessionSecret}

- Không commit .env.local. Mã băm không phải mật khẩu, nhưng vẫn nên giữ kín.
- Đổi ADMIN_SESSION_SECRET = đăng xuất mọi phiên quản trị đang có.
- Quên mật khẩu: chạy lại script và thay ADMIN_PASSWORD_HASH.`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
