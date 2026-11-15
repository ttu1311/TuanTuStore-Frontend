"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";

// Nút "Hủy đơn" cho khách (Lịch sử mua hàng, Tra cứu đơn hàng). Chỉ hiện khi đơn còn "Chờ xác nhận";
// bấm xong phải xác nhận thêm một lần. phone: số điện thoại khách đã nhập ở trang tra cứu (khách không đăng nhập).
export default function CancelOrderButton({ code, phone }: { code: string; phone?: string }) {
  const { cancelOrderByCustomer } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  function cancel() {
    const result = cancelOrderByCustomer(code, phone);
    if (!result.ok) setError(result.message);
    setConfirming(false);
  }

  return (
    <div>
      {confirming ? (
        <div className="rounded-lg border border-sale/30 bg-sale/5 px-4 py-3 text-sm">
          <p className="text-ink">
            Hủy đơn <span className="font-semibold">{code}</span>? Đơn đã hủy không khôi phục được.
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4">
            <button type="button" onClick={cancel} className="min-h-11 font-semibold text-sale">
              Xác nhận hủy
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="min-h-11 font-medium text-ink-muted">
              Không hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError("");
            setConfirming(true);
          }}
          className="min-h-11 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-sale"
        >
          Hủy đơn
        </button>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
