"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "@/components/ui/Icon";

// link: liên kết kèm theo thông báo; mặc định là "Xem giỏ" (giỏ hàng)
export type Toast = { id: number; message: string; link?: { href: string; label: string } };

// Một thông báo nhỏ ở góc dưới bên phải màn hình: "Đã thêm ... vào giỏ hàng" + liên kết tới giỏ hàng.
// `id` đổi mỗi lần thêm, nên thêm lại cùng một sản phẩm sẽ tính lại 3 giây từ đầu.
export default function CartToast({ toast, onClose }: { toast: Toast | null; onClose: () => void }) {
  const id = toast?.id;
  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:bottom-6">
      {toast && (
        <div className="pointer-events-auto ml-auto flex max-w-sm items-center gap-3 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lg">
          <Icon name="check" size={18} />
          <span className="flex-1">{toast.message}</span>
          <Link href={toast.link?.href ?? "/gio-hang"} onClick={onClose} className="font-semibold underline underline-offset-4">
            {toast.link?.label ?? "Xem giỏ"}
          </Link>
        </div>
      )}
    </div>
  );
}
