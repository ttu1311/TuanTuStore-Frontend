"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";
import { regionKeys, regions } from "@/lib/regions";

// Mọi liên kết bắt đầu bằng "/" nên dùng được từ mọi trang.
// "/#id" nghĩa là: về trang chủ, rồi cuộn tới phần có id đó.
// "Giới thiệu" đứng ngay sau "Trang chủ"; "Bản đồ" mở trang bản đồ riêng (/ban-do).
// Ba miền gộp vào MỘT mục "3 Miền" có bảng thả xuống (RegionMenu), đặt ngay sau "Sản phẩm".
const navItems: { label: string; href: string }[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/#gioi-thieu" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Hộp quà", href: "/hop-qua" },
  { label: "Bản đồ", href: "/ban-do" },
  { label: "Liên hệ", href: "/lien-he" },
];

const linkBase = "flex h-full items-center gap-1.5 whitespace-nowrap border-b-2 text-base transition-colors duration-200";
const linkIdle = "border-transparent font-medium text-ink-muted hover:text-ink";
const linkActive = "border-primary font-semibold text-primary";

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
      {/* relative: bảng "3 Miền" mở ngay dưới thanh menu (ngoài danh sách cuộn ngang, nên không bị cắt trên điện thoại) */}
      <div className="relative mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
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
              <Fragment key={item.label}>
                <li className="flex">
                  <SameRouteLink
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
                  >
                    {item.label}
                  </SameRouteLink>
                </li>
                {item.href === "/san-pham" && <RegionMenu />}
              </Fragment>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// "3 Miền ▾": bảng thả xuống với Miền Bắc / Trung / Nam, mỗi dòng mở trang sản phẩm đã lọc theo miền đó.
// Đóng khi bấm ra ngoài, nhấn Esc, chọn một dòng, hoặc chuyển trang.
function RegionMenu() {
  const pathname = usePathname();
  const { products } = useStore();
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0); // vị trí ngang của bảng, thẳng dưới nút (màn hình lớn)
  const [shownPath, setShownPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Chuyển sang trang khác thì đóng bảng (chỉnh state ngay lúc render, như React khuyến nghị)
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    const button = buttonRef.current;
    const container = button?.closest("nav > div");
    if (button && container) setLeft(button.getBoundingClientRect().left - container.getBoundingClientRect().left);
    setOpen(!open);
  }

  return (
    <li className="flex">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="region-menu"
        onClick={toggle}
        className={`${linkBase} ${open ? linkActive : linkIdle}`}
      >
        3 Miền
        <Icon name="chevron-down" size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="region-menu"
          // Điện thoại: rộng theo thanh menu. Màn hình lớn: rộng 18rem, thẳng dưới nút
          className="absolute inset-x-4 top-full z-40 mt-px rounded-b-xl border border-t-0 border-line bg-white p-2 shadow-card md:inset-x-6 lg:right-auto lg:w-72 lg:[left:var(--menu-left)]"
          style={{ "--menu-left": `${left}px` } as React.CSSProperties}
        >
          <ul>
            {regionKeys.map((key) => {
              const count = products.filter((product) => product.region === key).length;
              return (
                <li key={key}>
                  <Link
                    href={`/san-pham?region=${key}`}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-ink transition-colors duration-200 hover:bg-surface"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${regions[key].dotClass}`} aria-hidden="true" />
                    <span className="font-semibold">{regions[key].label}</span>
                    <span className="ml-auto text-sm text-ink-muted">{count} sản phẩm</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
