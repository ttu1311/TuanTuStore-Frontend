"use client";

import Link from "next/link";
import { useState } from "react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatVND } from "@/lib/format";
import { formatOrderCode, orderNumberFromCode, orderStatuses, orderStatusLabels, paymentMethodLabels } from "@/lib/orders";
import { isValidPhone, normalizePhone } from "@/lib/validation";
import type { Order } from "@/types";

// "+84901234567" và "090 123 4567" -> "0901234567", để so sánh số điện thoại dù khách gõ kiểu nào
function comparablePhone(phone: string) {
  return normalizePhone(phone).replace(/^\+84/, "0");
}

// "tt-000001", "TT-1", "1" -> "TT-000001". Trả về "" nếu không có số nào.
function cleanCode(code: string) {
  const number = orderNumberFromCode(code);
  return number > 0 ? formatOrderCode(number) : "";
}

const inputClass =
  "h-12 w-full rounded-md border bg-white px-4 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

// Tra cứu đơn hàng không cần đăng nhập: mã đơn + số điện thoại đã dùng khi đặt.
// Cần CẢ HAI khớp, để không ai xem được đơn của người khác chỉ bằng cách đoán mã đơn.
export default function OrderLookup({ initialCode = "" }: { initialCode?: string }) {
  const { isReady, orders } = useStore();
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ code?: string; phone?: string }>({});
  // Mã của đơn tìm thấy (null = chưa tìm, "" = không thấy). Đơn được đọc lại từ danh sách, nên luôn là trạng thái mới nhất.
  const [foundCode, setFoundCode] = useState<string | null>(null);
  const order = foundCode ? orders.find((item) => item.code === foundCode) : undefined;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const newErrors: typeof errors = {};
    const wantedCode = cleanCode(code);
    if (!code.trim()) newErrors.code = "Vui lòng nhập mã đơn hàng";
    else if (!wantedCode) newErrors.code = "Mã đơn hàng có dạng TT-000001";
    if (!phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(phone)) newErrors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
    setErrors(newErrors);
    if (newErrors.code || newErrors.phone) {
      document.getElementById(newErrors.code ? "lookup-code" : "lookup-phone")?.focus();
      return;
    }

    const match = orders.find(
      (item) => item.code === wantedCode && comparablePhone(item.phone) === comparablePhone(phone)
    );
    setFoundCode(match ? match.code : "");
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10">
      <form noValidate onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-6">
        <div>
          <label htmlFor="lookup-code" className="mb-1.5 block font-medium text-ink">
            Mã đơn hàng
          </label>
          <input
            id="lookup-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="TT-000001"
            autoComplete="off"
            maxLength={20}
            aria-invalid={Boolean(errors.code)}
            aria-describedby={errors.code ? "lookup-code-error" : undefined}
            className={`${inputClass} ${errors.code ? "border-sale" : "border-line"}`}
          />
          {errors.code && (
            <p id="lookup-code-error" className="mt-1.5 text-sm text-sale">
              {errors.code}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="lookup-phone" className="mb-1.5 block font-medium text-ink">
            Số điện thoại đặt hàng
          </label>
          <input
            id="lookup-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0901234567"
            autoComplete="tel"
            maxLength={20}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "lookup-phone-error" : undefined}
            className={`${inputClass} ${errors.phone ? "border-sale" : "border-line"}`}
          />
          {errors.phone && (
            <p id="lookup-phone-error" className="mt-1.5 text-sm text-sale">
              {errors.phone}
            </p>
          )}
        </div>
        <button type="submit" disabled={!isReady} className={`${btnBase} ${btnPrimary} mt-6 w-full disabled:opacity-60`}>
          Tra cứu
        </button>
        <p className="mt-4 text-sm text-ink-muted">
          Mã đơn hàng hiện trên màn hình sau khi đặt hàng thành công. Đã đăng nhập thì xem mọi đơn ở{" "}
          <Link href="/tai-khoan?tab=orders" className="font-medium text-primary underline underline-offset-4">
            Tài khoản
          </Link>
          .
        </p>
      </form>

      <div aria-live="polite">
        {foundCode === "" && (
          <div className="rounded-xl border border-line bg-surface px-6 py-10 text-center">
            <p className="font-semibold text-ink">Không tìm thấy đơn hàng</p>
            <p className="mx-auto mt-2 max-w-[32rem] text-ink-muted">
              Hãy kiểm tra lại mã đơn và số điện thoại. Lưu ý: bản demo không có máy chủ, nên chỉ tra cứu được đơn đã đặt trên
              chính trình duyệt này.
            </p>
          </div>
        )}
        {order && <OrderDetails order={order} />}
      </div>
    </div>
  );
}

// Kết quả: trạng thái theo từng bước, các sản phẩm, tiền và địa chỉ giao hàng
function OrderDetails({ order }: { order: Order }) {
  const currentStep = orderStatuses.indexOf(order.status);
  const money: [string, string][] = [
    ["Tạm tính", formatVND(order.subtotal)],
    ["Phí vận chuyển", order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)],
    ["Giảm giá", `−${formatVND(order.discount)}`],
  ];

  return (
    <section aria-labelledby="order-result-title" className="rounded-xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="order-result-title" className="font-display text-2xl font-semibold text-ink">
            Đơn hàng {order.code}
          </h2>
          <p className="text-sm text-ink-muted">Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Các bước của đơn: bước đã qua và bước hiện tại được tô màu */}
      <ol aria-label="Tiến trình đơn hàng" className="mt-6 grid grid-cols-4 gap-2">
        {orderStatuses.map((status, index) => {
          const done = index <= currentStep;
          return (
            <li key={status} aria-current={index === currentStep ? "step" : undefined} className="text-center">
              <span className={`block h-1.5 rounded-full ${done ? "bg-primary" : "bg-line"}`} />
              <span className={`mt-2 block text-xs sm:text-sm ${done ? "font-semibold text-ink" : "text-ink-muted"}`}>
                {orderStatusLabels[status]}
              </span>
            </li>
          );
        })}
      </ol>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 py-3">
            <span className="min-w-0 text-ink">
              {item.name} <span className="text-ink-muted">× {item.quantity}</span>
            </span>
            <span className="whitespace-nowrap font-medium text-ink">{formatVND(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2">
        {money.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <dt className="font-semibold text-ink">Tổng cộng</dt>
          <dd className="text-xl font-bold text-primary">{formatVND(order.total)}</dd>
        </div>
      </dl>

      <dl className="mt-6 grid gap-4 rounded-lg bg-surface p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted">Người nhận</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {order.customerName} · {order.phone}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Thanh toán</dt>
          <dd className="mt-0.5 font-medium text-ink">{paymentMethodLabels[order.paymentMethod]}</dd>
        </div>
        {order.gift && (
          <div className="sm:col-span-2">
            <dt className="text-ink-muted">Gói quà & thiệp</dt>
            <dd className="mt-0.5 font-medium text-ink">{order.gift.message ? `“${order.gift.message}”` : "Có gói quà (thiệp trống)"}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Địa chỉ giao hàng</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {[order.address, order.ward, order.district, order.province].filter(Boolean).join(", ")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
