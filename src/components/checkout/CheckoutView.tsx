"use client";

import Link from "next/link";
import { useState } from "react";
import ContentSidebar from "@/components/layout/PageLayout";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { calculateTotals, getCartLines, type CartLine } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import {
  MAX_LENGTH,
  requiredMessages,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFields,
} from "@/lib/orders";
import type { Order, PaymentMethod } from "@/types";

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
];

type CheckoutFormProps = {
  lines: CartLine[];
  initialValues: CheckoutFields;
  onPlaced: (order: Order) => void;
};

// Form giao hàng + tóm tắt đơn hàng. Chỉ hiển thị khi giỏ hàng có sản phẩm.
function CheckoutForm({ lines, initialValues, onPlaced }: CheckoutFormProps) {
  const { placeOrder } = useStore();
  const [values, setValues] = useState<CheckoutFields>(initialValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [saveError, setSaveError] = useState(""); // lỗi không thuộc về một ô nào

  // Giá lấy từ danh sách sản phẩm hiện tại trong localStorage
  const { subtotal, shippingFee, discount, total } = calculateTotals(
    lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  );

  function handleChange(field: keyof CheckoutFields, value: string) {
    setValues({ ...values, [field]: value });
    setSaveError("");
    // Xóa lỗi của ô này ngay khi người dùng sửa nó
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError("");

    const newErrors = validateCheckout(values);
    setErrors(newErrors);
    const firstInvalid = requiredMessages.find(([field]) => newErrors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid[0])?.focus();
      return;
    }
    if (Object.keys(newErrors).length > 0) return; // lỗi "quá dài" ở ô ghi chú

    // Lưu đơn hàng vào localStorage. Giỏ hàng chỉ được làm trống nếu đơn đã lưu thành công.
    const result = placeOrder(values, payment);
    if (result.ok) onPlaced(result.order);
    else setSaveError(result.message);
  }

  // Một ô nhập chữ có nhãn kèm thông báo lỗi
  function renderField(field: keyof CheckoutFields, label: string, options: { type?: string; autoComplete?: string } = {}) {
    const error = errors[field];
    return (
      <div>
        <label htmlFor={field} className="mb-2 block font-medium text-ink">
          {label}
        </label>
        <input
          id={field}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          value={values[field]}
          maxLength={MAX_LENGTH[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${field}-error` : undefined}
          className={`${fieldStyle} ${error ? fieldBad : fieldOk}`}
        />
        {error && (
          <p id={`${field}-error`} className="mt-1.5 text-sm text-sale">
            {error}
          </p>
        )}
      </div>
    );
  }

  const summaryRows = [
    { label: "Tạm tính", value: formatVND(subtotal) },
    { label: "Phí vận chuyển", value: formatVND(shippingFee) },
    { label: "Giảm giá", value: `−${formatVND(discount)}` },
  ];

  return (
    // Cả trang là một <form>: Nội dung (trái) = các ô giao hàng và phương thức thanh toán,
    // Sidebar (phải) = tóm tắt đơn hàng cùng nút "Đặt hàng", luôn nằm trong tầm nhìn khi cuộn.
    <form noValidate onSubmit={handleSubmit}>
      <ContentSidebar
        sidebarLabel="Đơn hàng của bạn"
        sticky
        sidebar={
          <div className="rounded-xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Đơn hàng của bạn</h2>

            <ul className="mt-4 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.product.id} className="flex justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{line.product.name}</p>
                    <p className="text-sm text-ink-muted">Số lượng: {line.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap font-medium text-ink">{formatVND(line.product.price * line.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-3 border-t border-line pt-4">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="font-medium text-ink">{row.value}</dd>
                </div>
              ))}
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-4">
                <dt className="text-lg font-semibold text-ink">Tổng cộng</dt>
                <dd className="text-2xl font-bold text-primary">{formatVND(total)}</dd>
              </div>
            </dl>

            <button type="submit" className={`${btnBase} ${btnPrimary} mt-6 w-full`}>
              Đặt hàng
            </button>

            {Object.values(errors).some(Boolean) && (
              <p role="alert" className="mt-4 text-sm text-sale">
                Vui lòng kiểm tra lại các thông tin được đánh dấu.
              </p>
            )}
            {saveError && (
              <p role="alert" className="mt-4 text-sm text-sale">
                {saveError}
              </p>
            )}
            <Link
              href="/gio-hang"
              className="mt-1 block py-3 text-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        }
      >
        <div className="space-y-8">
          <section aria-labelledby="shipping-title" className="rounded-xl border border-line bg-white p-6">
            <h2 id="shipping-title" className="font-display text-2xl font-semibold text-ink">
              Thông tin giao hàng
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {renderField("fullName", "Họ và tên", { autoComplete: "name" })}
              {renderField("phone", "Số điện thoại", { type: "tel", autoComplete: "tel" })}
              <div className="sm:col-span-2">{renderField("email", "Email", { type: "email", autoComplete: "email" })}</div>
              {renderField("province", "Tỉnh / Thành phố")}
              {renderField("district", "Quận / Huyện")}
              {renderField("ward", "Phường / Xã")}
              {renderField("address", "Địa chỉ cụ thể", { autoComplete: "street-address" })}
              <div className="sm:col-span-2">
                <label htmlFor="note" className="mb-2 block font-medium text-ink">
                  Ghi chú đơn hàng <span className="font-normal text-ink-muted">(không bắt buộc)</span>
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={values.note}
                  maxLength={MAX_LENGTH.note}
                  onChange={(event) => handleChange("note", event.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
                />
              </div>
            </div>
          </section>

          <fieldset className="m-0 rounded-xl border border-line bg-white p-6">
            <legend className="float-left mb-4 w-full p-0 font-display text-2xl font-semibold text-ink">
              Phương thức thanh toán
            </legend>
            <div className="clear-both space-y-1">
              {paymentOptions.map((option) => (
                <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-ink">
                  <input
                    type="radio"
                    name="payment"
                    value={option.value}
                    checked={payment === option.value}
                    onChange={() => setPayment(option.value)}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </ContentSidebar>
    </form>
  );
}

export default function CheckoutView() {
  const { isReady, cart, products, currentUser } = useStore();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Chờ localStorage, nếu không thông báo giỏ trống sẽ nháy lên mỗi lần tải trang
  if (!isReady) return <LoadingState text="Đang tải giỏ hàng…" />;

  // Đơn đã lưu và giỏ đã trống: hiện mã đơn hàng thay vì "Giỏ hàng của bạn đang trống"
  if (placedOrder) {
    return (
      <div role="status" className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Đặt hàng thành công!</p>
        <p className="mt-3 text-ink-muted">Cảm ơn bạn đã mua sắm tại TuanTuStore.</p>
        <p className="mt-5 text-ink-muted">
          Mã đơn hàng: <span className="font-semibold text-ink">{placedOrder.code}</span>
        </p>
        <p className="mt-1 text-ink-muted">
          Tổng cộng: <span className="text-lg font-bold text-primary">{formatVND(placedOrder.total)}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary}`}>
            Tiếp tục mua sắm
          </Link>
          {placedOrder.userId && (
            <Link href="/tai-khoan?tab=orders" className={`${btnBase} ${btnSecondary}`}>
              Xem đơn hàng của tôi
            </Link>
          )}
        </div>
      </div>
    );
  }

  const lines = getCartLines(cart, products);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Giỏ hàng của bạn đang trống</p>
        <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-6`}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Khách đã đăng nhập không cần gõ lại họ tên, số điện thoại và email
  const initialValues: CheckoutFields = {
    fullName: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
  };

  // Thông báo thành công thay thế form (dài): cuộn lên để nhìn thấy nó, cả trên điện thoại
  function handlePlaced(order: Order) {
    setPlacedOrder(order);
    window.scrollTo({ top: 0 });
  }

  return <CheckoutForm lines={lines} initialValues={initialValues} onPlaced={handlePlaced} />;
}
