"use client";

import { usePathname } from "next/navigation";
import { accountLinks } from "@/components/account/accountLinks";
import RequireLogin from "@/components/auth/RequireLogin";

// Khung chung của các trang /tai-khoan/...: tiêu đề lớn là tên mục đang mở (lấy từ địa chỉ trang, cùng danh sách với menu
// xổ xuống ở header), dòng nhỏ "Tài khoản của tôi" ở trên, rồi nội dung (các khung AccountCard, xem AccountPanels.tsx).
// Không có menu riêng ở đây: chuyển mục và đăng xuất đều qua menu header.
// Nội dung dùng hết chiều rộng trang; riêng trang chỉ có một form ngắn (accountLinks có narrow) là một khung hẹp căn giữa trang,
// và tiêu đề của trang đó cũng căn giữa (tiêu đề căn trái mà khung ở giữa thì nhìn lệch).
// Chỉ người đã đăng nhập thấy nội dung: khách bị chuyển tới /dang-nhap rồi quay lại đúng trang này.
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = accountLinks.find((link) => link.href === pathname);
  const narrow = current?.narrow;

  return (
    <>
      <div className={narrow ? "text-center" : undefined}>
        <p className="mb-2 text-sm font-semibold text-ink-muted">Tài khoản của tôi</p>
        <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">
          {current?.label ?? "Tài khoản của tôi"}
        </h1>
      </div>
      <RequireLogin>{narrow ? <div className="mx-auto max-w-xl">{children}</div> : children}</RequireLogin>
    </>
  );
}
