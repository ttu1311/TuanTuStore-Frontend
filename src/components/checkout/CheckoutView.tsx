"use client";

import Link from "next/link";
import { useState } from "react";
import AddressFields from "@/components/address/AddressFields";
import BankTransferQR from "@/components/payment/BankTransferQR";
import ContentSidebar from "@/components/layout/PageLayout";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import FreeShippingProgress from "@/components/cart/FreeShippingProgress";
import { calculateTotals, getCartLines, selectedLines, type CartLine } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import { emptyAddress, formatAddress, validateAddress } from "@/lib/address";
import {
  MAX_LENGTH,
  checkoutFieldOrder,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFields,
} from "@/lib/orders";
import { isValidPhone } from "@/lib/validation";
import type { Order, PaymentMethod, SavedAddress, User } from "@/types";

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#686D69] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

const recipientOptions: { value: "self" | "other"; label: string; hint: string }[] = [
  { value: "self", label: "Mua cho bản thân", hint: "Giao tới địa chỉ mặc định trong tài khoản" },
  { value: "other", label: "Mua tặng người thân", hint: "Nhập tên, số điện thoại và địa chỉ người nhận" },
];

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng (quét mã QR)" },
];

type Recipient = "self" | "other";

type CheckoutFormProps = {
  lines: CartLine[]; // chỉ các món khách đã tick ở giỏ hàng
  leftInCart: number; // số món chưa tick, vẫn ở lại trong giỏ sau khi đặt hàng
  user: User | null; // null = khách chưa đăng nhập
  onPlaced: (order: Order) => void;
};

// Hồ sơ đã đủ để giao hàng cho chính khách: có số điện thoại và địa chỉ mặc định hợp lệ
function hasDeliveryProfile(user: User | null): user is User & { address: SavedAddress } {
  return Boolean(user && isValidPhone(user.phone) && user.address && Object.keys(validateAddress(user.address)).length === 0);
}

// Form giao hàng + tóm tắt đơn hàng. Chỉ hiển thị khi giỏ hàng có sản phẩm.
// Khách đã đăng nhập chọn "Mua cho bản thân" (dùng địa chỉ mặc định trong tài khoản, không nhập lại)
// hoặc "Mua tặng người thân" (nhập người nhận). Khách chưa đăng nhập luôn điền form.
function CheckoutForm({ lines, leftInCart, user, onPlaced }: CheckoutFormProps) {
  const { placeOrder, updateProfile } = useStore();
  const [recipient, setRecipient] = useState<Recipient>("self");
  // Mỗi lựa chọn giữ form riêng, nên chuyển qua lại không làm mất chữ đã gõ
  const [forms, setForms] = useState<Record<Recipient, CheckoutFields>>({
    self: {
      fullName: user?.name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      address: user?.address ?? emptyAddress,
      note: "",
    },
    other: { fullName: "", phone: "", email: user?.email ?? "", address: emptyAddress, note: "" },
  });
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  // Gói quà: miễn phí, kèm lời nhắn in trên thiệp (không bắt buộc)
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  // Lần đầu "Mua cho bản thân" khi hồ sơ chưa có địa chỉ: lưu luôn làm địa chỉ mặc định
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [saveError, setSaveError] = useState(""); // lỗi không thuộc về một ô nào

  // Mua cho bản thân với hồ sơ đầy đủ: không có ô nào để nhập, chỉ hiện địa chỉ đã lưu
  const useSavedAddress = recipient === "self" && hasDeliveryProfile(user);
  const isAdminUser = user?.role === "ADMIN";
  const values = forms[recipient];

  // Giá lấy từ danh sách sản phẩm hiện tại trong localStorage
  const { subtotal, shippingFee, discount, total } = calculateTotals(
    lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  );

  function clearError(field: keyof CheckoutErrors) {
    setSaveError("");
    // Xóa lỗi của ô này ngay khi người dùng sửa nó
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleChange(field: "fullName" | "phone" | "email", value: string) {
    setForms({ ...forms, [recipient]: { ...values, [field]: value } });
    clearError(field);
  }

  function handleAddressChange(field: keyof SavedAddress, value: string) {
    setForms((current) => ({
      ...current,
      [recipient]: { ...current[recipient], address: { ...current[recipient].address, [field]: value } },
    }));
    clearError(field);
  }

  function chooseRecipient(next: Recipient) {
    setRecipient(next);
    setErrors({});
    setSaveError("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError("");

    // Khách đã đăng nhập: email luôn là email tài khoản (không có ô email)
    const customer: CheckoutFields =
      useSavedAddress && user?.address
        ? { fullName: user.name, phone: user.phone, email: user.email, address: user.address, note }
        : { ...values, email: user ? user.email : values.email, note };

    const newErrors = validateCheckout(customer);
    setErrors(newErrors);
    const firstInvalid = checkoutFieldOrder.find((field) => newErrors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    // Lưu đơn hàng vào localStorage. Giỏ hàng chỉ được làm trống nếu đơn đã lưu thành công.
    const result = placeOrder(customer, payment, {
      gift: giftWrap ? { message: giftMessage } : undefined,
      forOther: Boolean(user) && recipient === "other",
    });
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    // Lần đầu mua cho bản thân: lưu họ tên, số điện thoại và địa chỉ vào hồ sơ cho những lần sau
    if (user && !isAdminUser && recipient === "self" && !useSavedAddress && saveAsDefault) {
      updateProfile(customer.fullName, customer.phone, customer.address);
    }
    onPlaced(result.order);
  }

  // Một ô nhập chữ có nhãn kèm thông báo lỗi
  function renderField(
    field: "fullName" | "phone" | "email",
    label: string,
    options: { type?: string; autoComplete?: string } = {}
  ) {
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
    { label: "Phí vận chuyển", value: shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee) },
    { label: "Giảm giá", value: `−${formatVND(discount)}` },
    ...(giftWrap ? [{ label: "Gói quà & thiệp", value: "Miễn phí" }] : []),
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

            {leftInCart > 0 && (
              <p className="rounded-lg bg-surface px-3 py-2 text-sm text-ink-muted">
                {leftInCart} sản phẩm chưa chọn vẫn ở lại trong giỏ hàng.
              </p>
            )}

            <div className="mt-2 border-t border-line pt-4">
              <FreeShippingProgress subtotal={subtotal} />
            </div>

            <dl className="mt-4 space-y-3 border-t border-line pt-4">
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

            {user && (
              <fieldset className="mt-5">
                <legend className="sr-only">Bạn mua cho ai?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recipientOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer gap-3 rounded-lg border border-line p-4 transition-colors duration-200 hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary-soft"
                    >
                      <input
                        type="radio"
                        name="recipient"
                        value={option.value}
                        checked={recipient === option.value}
                        onChange={() => chooseRecipient(option.value)}
                        className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                      />
                      <span>
                        <span className="block font-semibold text-ink">{option.label}</span>
                        <span className="block text-sm text-ink-muted">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {useSavedAddress && user?.address ? (
              // Mua cho bản thân: dùng địa chỉ mặc định trong tài khoản, không bắt nhập lại
              <div className="mt-5 rounded-lg bg-surface p-4">
                <p className="text-sm font-medium text-ink-muted">Giao tới địa chỉ mặc định</p>
                <p className="mt-1 font-semibold text-ink">
                  {user.name} · {user.phone}
                </p>
                <p className="mt-1 text-ink">{formatAddress(user.address)}</p>
                <Link href="/tai-khoan" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4">
                  Đổi địa chỉ mặc định
                </Link>
              </div>
            ) : (
              <>
                {/* Tài khoản ADMIN không có địa chỉ mặc định, nên không nhắc lưu */}
                {user && !isAdminUser && recipient === "self" && (
                  <p className="mt-5 rounded-lg bg-gold-soft px-4 py-3 text-sm text-gold-ink">
                    Tài khoản của bạn chưa có địa chỉ giao hàng mặc định. Nhập một lần, lần sau không phải nhập lại.
                  </p>
                )}
                {user && recipient === "other" && (
                  <p className="mt-5 text-sm text-ink-muted">
                    Nhập thông tin của người nhận. Thông báo đơn hàng vẫn gửi tới email của bạn ({user.email}).
                  </p>
                )}
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {renderField("fullName", recipient === "other" ? "Họ và tên người nhận" : "Họ và tên", { autoComplete: recipient === "other" ? "off" : "name" })}
                  {renderField("phone", recipient === "other" ? "Số điện thoại người nhận" : "Số điện thoại", { type: "tel", autoComplete: recipient === "other" ? "off" : "tel" })}
                  {!user && <div className="sm:col-span-2">{renderField("email", "Email", { type: "email", autoComplete: "email" })}</div>}
                  <AddressFields idPrefix="" value={values.address} errors={errors} onChange={handleAddressChange} />
                </div>
                {user && !isAdminUser && recipient === "self" && (
                  <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-ink">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(event) => setSaveAsDefault(event.target.checked)}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
                    />
                    Lưu làm địa chỉ mặc định của tài khoản
                  </label>
                )}
              </>
            )}

            <div className="mt-5">
              <label htmlFor="note" className="mb-2 block font-medium text-ink">
                Ghi chú đơn hàng <span className="font-normal text-ink-muted">(không bắt buộc)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                maxLength={MAX_LENGTH.note}
                onChange={(event) => {
                  setNote(event.target.value);
                  clearError("note");
                }}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
              />
              {errors.note && <p className="mt-1.5 text-sm text-sale">{errors.note}</p>}
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
              {payment === "BANK_TRANSFER" && (
                <p className="pl-8 text-sm text-ink-muted">
                  Đặt hàng xong, bạn sẽ thấy mã QR có sẵn số tiền và nội dung chuyển khoản (mã đơn).
                </p>
              )}
            </div>
          </fieldset>

          <section aria-labelledby="gift-title" className="rounded-xl border border-line bg-white p-6">
            <h2 id="gift-title" className="font-display text-2xl font-semibold text-ink">
              Gói quà tặng
            </h2>
            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-ink">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(event) => setGiftWrap(event.target.checked)}
                className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
              />
              <span>
                Gói quà và kèm thiệp <span className="font-semibold text-che">(miễn phí)</span>
              </span>
            </label>
            {giftWrap && (
              <div className="mt-3">
                <label htmlFor="giftMessage" className="mb-2 block font-medium text-ink">
                  Lời nhắn trên thiệp <span className="font-normal text-ink-muted">(không bắt buộc)</span>
                </label>
                <textarea
                  id="giftMessage"
                  rows={3}
                  value={giftMessage}
                  maxLength={200}
                  onChange={(event) => setGiftMessage(event.target.value)}
                  placeholder="Ví dụ: Chúc mẹ năm mới mạnh khỏe!"
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-ink transition-colors duration-200 placeholder:text-[#686D69] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
                />
                <p className="mt-1 text-right text-sm text-ink-muted">{giftMessage.length}/200</p>
              </div>
            )}
          </section>
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
        <p className="mt-3 text-ink-muted">Cảm ơn bạn đã mua sắm tại Đặc sản 3 Miền.</p>
        <p className="mt-5 text-ink-muted">
          Mã đơn hàng: <span className="font-semibold text-ink">{placedOrder.code}</span>
        </p>
        <p className="mt-1 text-ink-muted">
          Tổng cộng: <span className="text-lg font-bold text-primary">{formatVND(placedOrder.total)}</span>
        </p>
        {placedOrder.paymentMethod === "BANK_TRANSFER" && (
          <div className="mx-auto mt-6 max-w-[40rem]">
            <BankTransferQR orderCode={placedOrder.code} amount={placedOrder.total} />
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary}`}>
            Tiếp tục mua sắm
          </Link>
          {placedOrder.userId ? (
            <Link href="/tai-khoan?tab=orders" className={`${btnBase} ${btnSecondary}`}>
              Xem đơn hàng của tôi
            </Link>
          ) : (
            // Khách chưa đăng nhập: theo dõi đơn bằng mã đơn + số điện thoại
            <Link href={`/tra-cuu-don-hang?ma=${placedOrder.code}`} className={`${btnBase} ${btnSecondary}`}>
              Tra cứu đơn hàng
            </Link>
          )}
        </div>
      </div>
    );
  }

  const allLines = getCartLines(cart, products);
  const lines = selectedLines(allLines); // chỉ các món đã tick ở giỏ hàng

  if (allLines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Giỏ hàng của bạn đang trống</p>
        <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-6`}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Có hàng trong giỏ nhưng chưa tick món nào: quay lại giỏ để chọn
  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Bạn chưa chọn sản phẩm nào để mua</p>
        <p className="mt-2 text-ink-muted">Hãy tick chọn các sản phẩm muốn thanh toán ở trang giỏ hàng.</p>
        <Link href="/gio-hang" className={`${btnBase} ${btnPrimary} mt-6`}>
          Về giỏ hàng để chọn
        </Link>
      </div>
    );
  }

  // Thông báo thành công thay thế form (dài): cuộn lên để nhìn thấy nó, cả trên điện thoại
  function handlePlaced(order: Order) {
    setPlacedOrder(order);
    window.scrollTo({ top: 0 });
  }

  return <CheckoutForm lines={lines} leftInCart={allLines.length - lines.length} user={currentUser} onPlaced={handlePlaced} />;
}
