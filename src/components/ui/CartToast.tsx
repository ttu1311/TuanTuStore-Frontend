"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "@/components/ui/Icon";

// A small notice at the bottom-right of the screen: "Đã thêm ... vào giỏ hàng" + a link to the cart.
// `id` changes on every add, so adding the same product again restarts the 3 seconds.
export default function CartToast({
  toast,
  onClose,
}: {
  toast: { id: number; message: string } | null;
  onClose: () => void;
}) {
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
          <Link href="/gio-hang" onClick={onClose} className="font-semibold underline underline-offset-4">
            Xem giỏ
          </Link>
        </div>
      )}
    </div>
  );
}
