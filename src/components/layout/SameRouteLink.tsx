"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

// Một Link bình thường, cộng thêm: bấm vào khi ĐANG Ở đúng trang đó thì cuộn mượt lên đầu trang.
// Next.js không cuộn khi bấm vào chính trang đang mở (ví dụ "Trang chủ" khi đang ở trang chủ,
// "Sản phẩm" khi đang ở /san-pham), nên nếu không có phần này thì bấm vào không có gì xảy ra.
// Liên kết tới một phần của trang ("/#san-pham") vẫn để Next.js tự cuộn tới phần đó.
export default function SameRouteLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || href.includes("#")) return;
    // Bấm kèm Ctrl/Cmd/Shift hoặc chuột giữa là mở tab mới: để trình duyệt tự xử lý
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    // So với địa chỉ hiện tại (cả phần "?…"): /san-pham?q=cua bấm "Sản phẩm" vẫn chuyển trang để bỏ từ khóa
    if (href !== window.location.pathname + window.location.search) return;

    event.preventDefault();
    // Đang ở "/#san-pham" thì bỏ phần "#..." khỏi địa chỉ. Giữ nguyên history.state vì App Router lưu dữ liệu của nó ở đó.
    if (window.location.hash) window.history.replaceState(window.history.state, "", href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <Link {...props} href={href} onClick={handleClick} />;
}
