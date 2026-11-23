"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { accountLinks } from "@/components/account/accountLinks";
import { useSignOutToHome } from "@/components/auth/RequireLogin";
import Icon from "@/components/ui/Icon";

// Mỗi dòng cao tối thiểu 44px. Dòng của trang đang mở nổi lên giống mục đang chọn ở menu bên phải trang tài khoản.
const itemBase = "flex min-h-11 w-full items-center rounded-lg px-3 text-left transition-colors duration-200";
const itemIdle = "font-medium text-ink hover:bg-surface";
const itemActive = "bg-primary-soft font-semibold text-primary";

// Menu tài khoản ở header (chỉ khi ĐÃ đăng nhập): biểu tượng người + tên; BẤM mới xổ xuống 5 trang tài khoản và "Đăng xuất".
// Mẫu "disclosure": nút có aria-expanded và aria-controls, danh sách là các liên kết bình thường (không role="menu", không aria-haspopup).
// Đóng khi bấm lại nút, bấm ra ngoài, nhấn Esc (focus về nút), chọn một dòng, hoặc chuyển trang.
export default function AccountMenu({ name }: { name: string }) {
  const pathname = usePathname();
  const signOutToHome = useSignOutToHome();
  const [open, setOpen] = useState(false);
  const [shownPath, setShownPath] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Chuyển sang trang khác thì đóng menu (chỉnh state ngay lúc render, như React khuyến nghị)
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={`Tài khoản của tôi, đang đăng nhập: ${name}`}
        title={name}
        onClick={() => setOpen(!open)}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-ink transition-colors duration-200 hover:bg-surface sm:gap-2 sm:px-3"
      >
        <Icon name="user" size={24} />
        {/* Tên dài thì cắt bớt bằng "…" (tên đầy đủ hiện khi rê chuột) */}
        <span aria-hidden="true" className="max-w-[6rem] truncate text-sm font-semibold sm:max-w-[9rem] lg:max-w-[11rem]">
          {name}
        </span>
        <Icon name="chevron-down" size={16} className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        // Canh mép phải theo nút; rộng 16rem nhưng không bao giờ vượt chiều rộng màn hình (điện thoại 360px)
        <div
          id="account-menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] animate-dropdown-in rounded-xl border border-line bg-white p-2 shadow-card"
        >
          <p title={name} className="truncate border-b border-line px-3 pb-2.5 pt-1.5 font-semibold text-ink">
            {name}
          </p>
          <ul className="mt-2">
            {accountLinks.map((link) => {
              const isActive = link.href === pathname;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`${itemBase} ${isActive ? itemActive : itemIdle}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {/* Đăng xuất ngay, không hỏi lại, rồi về trang chủ */}
            <li className="mt-2 border-t border-line pt-2">
              <button type="button" onClick={signOutToHome} className={`${itemBase} ${itemIdle}`}>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
