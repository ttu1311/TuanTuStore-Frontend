"use client";

import { usePathname } from "next/navigation";
import { accountLinks } from "@/components/account/accountLinks";
import RequireLogin from "@/components/auth/RequireLogin";

// Khung chung của các trang /tai-khoan/...: một cột, tiêu đề lớn là tên mục đang mở (lấy từ địa chỉ trang, cùng danh sách
// với menu xổ xuống ở header), nội dung nằm trong một thẻ. Không có menu riêng ở đây: chuyển mục và đăng xuất đều qua menu header.
// Thẻ hẹp (max-w-2xl) cho dễ đọc; trang có bảng hoặc lưới sản phẩm (accountLinks có wide) rộng hơn (max-w-4xl).
// Chỉ người đã đăng nhập thấy nội dung: khách bị chuyển tới /dang-nhap rồi quay lại đúng trang này.
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = accountLinks.find((link) => link.href === pathname);

  return (
    <>
      <p className="mb-2 text-sm font-semibold text-ink-muted">Tài khoản của tôi</p>
      <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">
        {current?.label ?? "Tài khoản của tôi"}
      </h1>
      <RequireLogin>
        <section
          className={`min-w-0 rounded-xl border border-line bg-white p-6 md:p-8 ${current?.wide ? "max-w-4xl" : "max-w-2xl"}`}
        >
          {children}
        </section>
      </RequireLogin>
    </>
  );
}
