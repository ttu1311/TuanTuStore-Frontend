"use client";

import { useEffect, useRef, useState } from "react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/auth/TurnstileWidget";
import { btnBase, btnPrimary } from "@/components/ui/buttons";

const fieldStyle =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

// Form đăng nhập quản trị: một ô mật khẩu + CAPTCHA. Mật khẩu được gửi tới /api/admin/login và kiểm tra Ở SERVER;
// đúng thì server đặt cookie phiên (httpOnly) và trang tải lại vào /admin. Sai thì phải chờ (số giây do server trả về,
// tăng dần sau mỗi lần sai) trước khi thử lại.
// missing: tên các biến môi trường server còn thiếu. Khi đó không hiện form, chỉ báo cần đặt biến gì.
export default function AdminLoginForm({ next, missing }: { next: string; missing: string[] }) {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); // token Turnstile; "" = chưa có / hết hạn
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0); // số giây còn phải chờ trước lần thử kế tiếp
  const [submitting, setSubmitting] = useState(false);
  const captchaRef = useRef<TurnstileHandle>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Đếm ngược thời gian chờ
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  if (missing.length > 0) {
    return (
      <div role="alert" className="mt-6 rounded-lg border border-sale/30 bg-sale/5 px-4 py-3 text-sm text-ink">
        <p className="font-semibold text-sale">Chưa cấu hình đăng nhập quản trị.</p>
        <p className="mt-1">Cần đặt các biến môi trường sau trên server rồi khởi động lại (hoặc deploy lại):</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {missing.map((name) => (
            <li key={name}>
              <code className="font-mono text-[0.85em]">{name}</code>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-ink-muted">Xem hướng dẫn trong README, mục “Admin login”.</p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || wait > 0) return;
    setError("");
    if (password === "") {
      setError("Vui lòng nhập mật khẩu quản trị.");
      passwordRef.current?.focus();
      return;
    }
    if (token === "") {
      setError("Vui lòng xác nhận bạn không phải robot.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string; retryAfter?: number };
      if (response.ok && data.ok) {
        // Tải lại hẳn trang: proxy và giao diện đọc phiên mới từ cookie
        window.location.assign(next);
        return;
      }
      setError(data.message ?? "Không đăng nhập được. Vui lòng thử lại.");
      if (typeof data.retryAfter === "number" && data.retryAfter > 0) setWait(data.retryAfter);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    }
    // Mỗi token CAPTCHA chỉ dùng một lần: lấy token mới cho lần thử sau
    setPassword("");
    captchaRef.current?.reset();
    setSubmitting(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block font-medium text-ink">
          Mật khẩu quản trị
        </label>
        <input
          ref={passwordRef}
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={error !== "" && password === "" ? true : undefined}
          aria-describedby={error ? "admin-login-error" : undefined}
          className={fieldStyle}
        />
      </div>

      <TurnstileWidget ref={captchaRef} action="admin-login" onToken={setToken} />

      {error && (
        <p id="admin-login-error" role="alert" className="text-sm text-sale">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || wait > 0}
        className={`${btnBase} ${btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {submitting ? "Đang kiểm tra…" : wait > 0 ? `Chờ ${wait} giây` : "Đăng nhập"}
      </button>
    </form>
  );
}
