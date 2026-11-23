"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";

// Mọi liên kết bắt đầu bằng "/" nên dùng được từ mọi trang.
// "/#id" nghĩa là: về trang chủ, rồi cuộn tới phần có id đó.
// Lọc theo miền có sẵn ở trang Sản phẩm và ở các tab miền của trang chủ; thông tin liên hệ nằm ở footer (id="lien-he").
const navItems: { label: string; href: string }[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Hộp quà", href: "/hop-qua" },
];

// Mục đang mở chỉ khác bằng chữ màu primary và đậm hơn (không có gạch chân). Vòng focus vẽ VÀO TRONG (offset âm): liên kết cao
// bằng cả thanh menu, mà thanh cuộn ngang trên điện thoại cắt mọi thứ lòi ra ngoài, nên vòng ở ngoài sẽ bị cắt mất.
const linkBase =
  "flex h-full items-center gap-1.5 whitespace-nowrap text-base transition-colors duration-200 focus-visible:[outline-offset:-3px]";
const linkIdle = "font-medium text-ink-muted hover:text-ink";
const linkActive = "font-semibold text-primary";

// Chữ của một mục menu, kèm chỗ giữ sẵn cho bản chữ đậm: ::after chứa cùng chữ ở độ đậm 600, ẩn đi và cao 0,
// nên mục đổi từ chữ thường sang chữ đậm không làm menu rộng ra hay các mục xê dịch.
function NavLabel({ text }: { text: string }) {
  return (
    <span
      data-label={text}
      className="inline-flex flex-col items-center after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)]"
    >
      {text}
    </span>
  );
}

// Menu chính. Nó tự đọc địa chỉ của trang hiện tại (usePathname),
// nên không trang nào phải báo cho Header biết nó đang ở đâu.
// Trình duyệt có phiên quản trị hợp lệ (isAdmin, hỏi server khi có cờ gợi ý tt_admin_hint) thì hiện thêm "Quản trị".
// Liên kết này chỉ để tiện: nó không cấp quyền gì, /admin vẫn do src/proxy.ts kiểm tra cookie phiên ở server.
export default function MainNav() {
  const pathname = usePathname();
  const { isAdmin } = useStore();
  const showAdminLink = isAdmin;

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
                className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-primary px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:[outline-offset:-3px]"
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
                  className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
                >
                  <NavLabel text={item.label} />
                </SameRouteLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
