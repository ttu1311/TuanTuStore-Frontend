"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";

const items = [
  { label: "Tổng quan", href: "/admin" },
  { label: "Sản phẩm", href: "/admin/san-pham" },
  { label: "Đơn hàng", href: "/admin/don-hang" },
  { label: "Mã giảm giá", href: "/admin/ma-giam-gia" },
  { label: "Thống kê", href: "/admin/thong-ke" },
  { label: "Người dùng", href: "/admin/nguoi-dung" },
  { label: "Yêu cầu liên hệ", href: "/admin/lien-he" },
];

const itemStyle = "flex min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors duration-200";

// Menu bên của các trang Admin (thanh ngang có thể cuộn trên màn hình nhỏ)
export default function AdminNav() {
  const pathname = usePathname();
  const { contactRequests } = useStore();
  // Số yêu cầu đang chờ gọi lại, hiện cạnh mục "Yêu cầu liên hệ"
  const waitingCalls = contactRequests.filter((request) => !request.done).length;

  return (
    <nav aria-label="Quản trị" className="px-3 pb-3 lg:pb-0">
      {/* Điện thoại: hàng cuộn ngang cắt vòng focus ở ngoài mục, nên có đệm 6px (margin âm bù lại); từ lg là cột dọc, không cắt */}
      <ul className="-m-1.5 flex gap-1 overflow-x-auto p-1.5 lg:m-0 lg:flex-col lg:overflow-visible lg:p-0">
        {items.map((item) => {
          // "/admin" phải khớp chính xác, nếu không nó sẽ sáng ở mọi trang admin
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${itemStyle} ${
                  isActive
                    ? "bg-primary-soft font-semibold text-primary"
                    : "font-medium text-ink-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {item.label}
                {item.href === "/admin/lien-he" && waitingCalls > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-sale px-1.5 text-xs font-semibold text-white">
                    {waitingCalls}
                    <span className="sr-only"> đang chờ</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {/* Không có liên kết về cửa hàng và không có nút "Đăng xuất" ở đây: khu quản trị tách riêng,
           thoát ra bằng MỘT nút "Đăng xuất" duy nhất ở thanh trên (AdminShell). */}
      </ul>
    </nav>
  );
}
