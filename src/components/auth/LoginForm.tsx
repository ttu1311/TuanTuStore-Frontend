"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { isValidEmail } from "@/lib/validation";

type Errors = { email?: string; password?: string };

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// One login form for customers AND the Admin.
// After login: ADMIN -> /admin, USER -> /tai-khoan (the effect below does the redirect).
export default function LoginForm() {
  const { isReady, currentUser, login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loginError, setLoginError] = useState(""); // e.g. "Email hoặc mật khẩu không đúng"

  // Already logged in (or just logged in): go to the right page
  useEffect(() => {
    if (isReady && currentUser) router.replace(currentUser.role === "ADMIN" ? "/admin" : "/tai-khoan");
  }, [isReady, currentUser, router]);

  if (!isReady || currentUser) return <LoadingState />;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");

    const newErrors: Errors = {};
    if (email.trim() === "") newErrors.email = "Vui lòng nhập email";
    else if (!isValidEmail(email)) newErrors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
    if (password === "") newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);

    if (newErrors.email) return document.getElementById("email")?.focus();
    if (newErrors.password) return document.getElementById("password")?.focus();

    // The password is checked against the accounts saved in localStorage
    const result = login(email, password, remember);
    if (!result.ok) {
      setLoginError(result.message);
      setPassword("");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors({ ...errors, email: undefined });
          }}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${fieldStyle} ${errors.email ? fieldBad : fieldOk}`}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-sale">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-medium text-ink">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors({ ...errors, password: undefined });
          }}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`${fieldStyle} ${errors.password ? fieldBad : fieldOk}`}
        />
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-sm text-sale">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Ticked: stay logged in after closing the browser (localStorage). Unticked: only this tab (sessionStorage). */}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
          />
          Ghi nhớ đăng nhập
        </label>
      </div>

      <button type="submit" className={`${btnBase} ${btnPrimary} w-full`}>
        Đăng nhập
      </button>

      {loginError && (
        <p role="alert" className="text-sm text-sale">
          {loginError}
        </p>
      )}

      <p className="text-center text-ink-muted">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-medium text-primary underline underline-offset-4">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
