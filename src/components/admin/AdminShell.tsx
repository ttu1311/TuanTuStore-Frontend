"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { useStore } from "@/context/StoreContext";
import Logo from "@/components/brand/Logo";
import { ADMIN_LOGIN_PATH } from "@/lib/adminConstants";

// Khung của mọi trang /admin: menu bên + thanh trên + nội dung, và nút "Đăng xuất".
// Lớp bảo vệ CHÍNH nằm ở server: src/proxy.ts không gửi trang /admin khi không có cookie phiên quản trị hợp lệ.
// Ở đây chỉ kiểm tra lại (phiên có thể vừa hết hạn trong lúc đang dùng): không hợp lệ thì về trang đăng nhập quản trị.
// Cho tới khi localStorage được đọc xong và phiên được xác nhận, chỉ hiện "Đang tải…", nên nội dung Admin không bị nháy lên.
// PHẠM VI: bảo vệ LỐI VÀO giao diện admin. Dữ liệu cửa hàng vẫn ở localStorage của từng trình duyệt và KHÔNG được bảo vệ.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isReady, refreshAdminSession, adminLogout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    void refreshAdminSession().then((ok) => {
      if (!active) return;
      if (ok) setSessionOk(true);
      else router.replace(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
    });
    return () => {
      active = false;
    };
  }, [refreshAdminSession, pathname, router]);

  function logout() {
    setLoggingOut(true);
    void adminLogout();
  }

  if (!isReady || !sessionOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p role="status" className="text-ink-muted">
          Đang tải…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <Link
          href="/admin"
          aria-label="Đặc sản 3 Miền — Quản trị"
          className="flex h-16 items-center whitespace-nowrap px-5"
        >
          <Logo size="sm" label="Đặc sản 3 Miền — Quản trị" />
        </Link>
        <AdminNav />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 md:px-6">
          <span className="whitespace-nowrap font-semibold text-ink">Quản trị hệ thống</span>
          <span className="flex min-w-0 items-center gap-3 text-sm text-ink-muted">
            {/* Màn hình nhỏ: menu bên cuộn ngang và mục "Về trang cửa hàng" có thể nằm ngoài tầm nhìn,
               nên đường quay về cửa hàng cũng đặt ở đây. Từ cỡ lg trở lên thì menu bên đã hiển thị nó. */}
            <Link
              href="/"
              className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-primary px-4 font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft lg:hidden"
            >
              Về cửa hàng
            </Link>
            <span className="hidden truncate sm:inline">Quản trị viên</span>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 font-semibold text-ink transition-colors duration-200 hover:bg-surface hover:text-sale disabled:opacity-60"
            >
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </button>
          </span>
        </header>
        <main id="main-content" className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
