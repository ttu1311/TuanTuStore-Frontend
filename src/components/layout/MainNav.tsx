"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";
import { regions } from "@/lib/regions";
import type { Region } from "@/types";

// Mọi liên kết bắt đầu bằng "/" nên dùng được từ mọi trang.
// "/#id" nghĩa là: về trang chủ, rồi cuộn tới phần có id đó.
// Các mục vùng miền mang màu chấm của vùng đó, giống như tuyến ở trang chủ.
const navItems: { label: string; href: string; region?: Region }[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Miền Bắc", href: "/#mien-bac", region: "bac" },
  { label: "Miền Trung", href: "/#mien-trung", region: "trung" },
  { label: "Miền Nam", href: "/#mien-nam", region: "nam" },
  { label: "Hộp quà", href: "/hop-qua" },
  { label: "Giới thiệu", href: "/#gioi-thieu" },
  { label: "Liên hệ", href: "/#lien-he" },
];

// Menu chính. Nó tự đọc địa chỉ của trang hiện tại (usePathname),
// nên không trang nào phải báo cho Header biết nó đang ở đâu.
// Với tài khoản ADMIN, nó còn hiện "Quản trị", đường quay lại /admin.
export default function MainNav() {
  const pathname = usePathname();
  const { isReady, currentUser } = useStore();
  // Cùng quy tắc với AdminShell: vai trò của người đang đăng nhập, đọc từ danh sách người dùng trong StoreContext.
  // Ẩn liên kết chỉ để tiện cho người dùng; /admin tự kiểm tra lại vai trò (xem AdminShell).
  const showAdminLink = isReady && currentUser?.role === "ADMIN";

  return (
    <nav aria-label="Điều hướng chính" className="border-t border-line">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <ul className="flex h-[52px] items-stretch gap-6 overflow-x-auto lg:gap-8 lg:overflow-visible">
          {showAdminLink && (
            // Đứng đầu danh sách, để điện thoại thấy nó mà không phải cuộn menu ngang.
            // Từ cỡ lg trở lên nó chuyển sang tận bên phải, tách khỏi các liên kết cửa hàng.
            <li className="flex items-center lg:order-last lg:ml-auto">
              <Link
                href="/admin"
                className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-primary px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft"
              >
                <Icon name="shield" size={16} />
                Quản trị
              </Link>
            </li>
          )}
          {navItems.map((item) => {
            // "Sản phẩm" cũng sáng ở trang chi tiết sản phẩm (/san-pham/<id>). Các liên kết "#section" không bao giờ sáng.
            const isActive = item.href === "/san-pham" ? pathname.startsWith("/san-pham") : item.href === pathname;

            return (
              <li key={item.label} className="flex">
                <SameRouteLink
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-full items-center gap-2 whitespace-nowrap border-b-2 text-base transition-colors duration-200 ${
                    isActive
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent font-medium text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.region && (
                    <span className={`h-2 w-2 rounded-full ${regions[item.region].dotClass}`} aria-hidden="true" />
                  )}
                  {item.label}
                </SameRouteLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
