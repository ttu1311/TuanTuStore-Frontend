import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Logo from "@/components/brand/Logo";
import { ADMIN_SESSION_COOKIE, safeAdminNext } from "@/lib/adminConstants";
import { adminConfig, isValidAdminSession } from "@/lib/adminSession";
import { turnstileSecretKey } from "@/lib/turnstile";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị — Đặc sản 3 Miền",
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = { searchParams: Promise<{ next?: string | string[] }> };

// Trang đăng nhập quản trị: tách riêng khỏi đăng nhập của khách (/dang-nhap), không có liên kết nào từ menu hay chân trang.
// Mật khẩu được kiểm tra ở server (/api/admin/login). Trang này đọc cấu hình mỗi lần mở (dùng searchParams nên không dựng sẵn):
// thiếu biến môi trường nào thì form không hiện, thay bằng thông báo nêu đúng tên biến cần đặt.
// Đã đăng nhập quản trị rồi thì đi thẳng tới trang admin (?next= chỉ nhận đường dẫn trong /admin).
export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const next = safeAdminNext((await searchParams).next);
  if (isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) redirect(next);

  const config = adminConfig();
  const missing = [...(config.ok ? [] : config.missing), ...(turnstileSecretKey() ? [] : ["TURNSTILE_SECRET_KEY"])];

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
        <Link href="/" className="inline-flex rounded-md">
          <Logo label="Đặc sản 3 Miền — về trang chủ" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-ink">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-ink-muted">Trang dành riêng cho chủ cửa hàng.</p>
        <AdminLoginForm next={next} missing={missing} />
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/" className="font-medium text-primary underline underline-offset-4">
            Về cửa hàng
          </Link>
        </p>
      </div>
    </main>
  );
}
