"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { useStore } from "@/context/StoreContext";

// Khung của mọi trang /admin: menu bên + thanh trên + nội dung.
// Chỉ ADMIN mới thấy: khách chưa đăng nhập bị chuyển tới /dang-nhap, khách hàng (USER) bị chuyển về trang chủ.
// Cho tới khi localStorage được đọc xong, chỉ hiện thông báo đang tải, nên nội dung Admin không bị nháy lên.
// LƯU Ý: đây là bản demo front-end. Nó cải thiện trải nghiệm người dùng nhưng KHÔNG phải bảo mật thật.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isReady, currentUser } = useStore();
  const router = useRouter();
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser) router.replace("/dang-nhap");
    else if (currentUser.role !== "ADMIN") router.replace("/");
  }, [isReady, currentUser, router]);

  if (!isReady || !isAdmin) {
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
          aria-label="TuanTuStore — Quản trị"
          className="flex h-16 items-center whitespace-nowrap px-6 font-display text-2xl font-bold tracking-tight text-ink"
        >
          TuanTu<span className="text-primary">Store</span>
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
            <span className="hidden truncate sm:inline">{currentUser.name}</span>
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase text-white"
            >
              {currentUser.name.trim().charAt(0) || "Q"}
            </span>
          </span>
        </header>
        <main id="main-content" className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
