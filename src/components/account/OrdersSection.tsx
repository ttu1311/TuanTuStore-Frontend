"use client";

import Link from "next/link";
import { useState } from "react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatVND } from "@/lib/format";

// "Đơn hàng của tôi": only the orders of the logged-in user, newest first
export default function OrdersSection({ userId }: { userId: string }) {
  const { orders } = useStore();
  const myOrders = orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // Code of the order whose details are open
  const [openCode, setOpenCode] = useState<string | null>(null);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Đơn hàng của tôi</h2>

      {myOrders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface px-6 py-12 text-center">
          <p className="text-ink-muted">Bạn chưa có đơn hàng nào.</p>
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-4`}>
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {myOrders.map((order) => {
            const isOpen = openCode === order.code;
            return (
              <li key={order.code} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">Mã đơn hàng: {order.code}</p>
                    <p className="text-sm text-ink-muted">Ngày đặt: {formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-ink-muted">
                    Tổng tiền: <span className="text-lg font-bold text-primary">{formatVND(order.total)}</span>
                  </p>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenCode(isOpen ? null : order.code)}
                    className="min-h-11 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
                  >
                    {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                  </button>
                </div>

                {isOpen && (
                  <ul className="mt-3 divide-y divide-line border-t border-line">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex justify-between gap-4 py-2 text-ink-muted">
                        <span className="min-w-0">
                          {item.name}
                          <span className="block text-xs">
                            {formatVND(item.price)} x {item.quantity}
                          </span>
                        </span>
                        <span className="whitespace-nowrap font-medium text-ink">{formatVND(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
