"use client";

import { useState } from "react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { actionDanger, actionEdit, td } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatVND } from "@/lib/format";
import { orderStatusLabels, orderStatuses, paymentMethodLabels } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";

const selectStyle =
  "h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

// A table row of the orders list. "Xem chi tiết" opens the details right under it,
// with the status control and the delete button.
export default function AdminOrderRow({ order, accountText }: { order: Order; accountText: string }) {
  const { updateOrderStatus, deleteOrder } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<OrderStatus>(order.status);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSaveStatus() {
    const result = updateOrderStatus(order.code, selected);
    setMessage(result.ok ? { ok: true, text: "Đã cập nhật trạng thái." } : { ok: false, text: result.message });
  }

  function handleDelete() {
    if (!window.confirm(`Xóa đơn hàng ${order.code}? Thao tác này không thể hoàn tác.`)) return;
    const result = deleteOrder(order.code);
    if (!result.ok) setMessage({ ok: false, text: result.message });
  }

  const customerRows = [
    ["Họ và tên", order.customerName],
    ["Số điện thoại", order.phone],
    ["Email", order.email],
    ["Địa chỉ giao hàng", [order.address, order.ward, order.district, order.province].join(", ")],
    ["Ghi chú", order.note || "—"],
    ["Thanh toán", paymentMethodLabels[order.paymentMethod]],
    ["Tài khoản", accountText],
  ];

  const totalRows = [
    ["Tạm tính", formatVND(order.subtotal)],
    ["Phí vận chuyển", formatVND(order.shippingFee)],
    ["Giảm giá", `−${formatVND(order.discount)}`],
  ];

  return (
    <>
      <tr className="group">
        <td className={`${td} font-medium`}>{order.code}</td>
        <td className={td}>{order.customerName}</td>
        <td className={td}>{formatDate(order.createdAt)}</td>
        <td className={`${td} whitespace-nowrap`}>{formatVND(order.total)}</td>
        <td className={td}>
          <OrderStatusBadge status={order.status} />
        </td>
        <td className={td}>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Ẩn" : "Xem"} chi tiết đơn ${order.code}`}
            onClick={() => setIsOpen(!isOpen)}
            className={actionEdit}
          >
            {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={6} className="border-b border-line bg-surface p-0">
            {/* Pinned to the left edge and as wide as the visible card (100cqw), so on a phone the details
                are never wider than the screen while the table itself scrolls sideways */}
            <div className="sticky left-0 box-border w-[100cqw] px-4 py-5">
              <div className="grid gap-6 lg:grid-cols-2">
                <dl className="min-w-0 space-y-2 text-sm">
                  {customerRows.map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <dt className="w-32 shrink-0 text-ink-muted">{label}</dt>
                      <dd className="min-w-0 break-words font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="min-w-0 text-sm">
                  <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex justify-between gap-4 px-4 py-2">
                        <span className="min-w-0 text-ink">
                          {item.name}
                          <span className="block text-xs text-ink-muted">
                            {formatVND(item.price)} x {item.quantity}
                          </span>
                        </span>
                        <span className="whitespace-nowrap font-medium text-ink">{formatVND(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-3 space-y-1">
                    {totalRows.map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="text-ink-muted">{label}</dt>
                        <dd className="text-ink">{value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 border-t border-line pt-2">
                      <dt className="font-semibold text-ink">Tổng cộng</dt>
                      <dd className="font-bold text-primary">{formatVND(order.total)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <label htmlFor={`status-${order.code}`} className="text-sm font-medium text-ink">
                  Trạng thái
                </label>
                <select
                  id={`status-${order.code}`}
                  value={selected}
                  onChange={(event) => {
                    setSelected(event.target.value as OrderStatus);
                    setMessage(null);
                  }}
                  className={selectStyle}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={selected === order.status}
                  className={`${actionEdit} disabled:opacity-50`}
                >
                  Cập nhật
                </button>
                <button type="button" onClick={handleDelete} className={`${actionDanger} sm:ml-auto`}>
                  Xóa đơn hàng
                </button>
                {message && (
                  <p
                    role={message.ok ? "status" : "alert"}
                    className={`basis-full text-sm ${message.ok ? "text-primary" : "text-sale"}`}
                  >
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
