"use client";

import { useState } from "react";
import { actionDanger, actionEdit, table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import {
  PASSPORT_COUPON,
  couponKindLabels,
  describeCoupon,
  emptyCouponForm,
  ordersUsingCode,
  validateCouponForm,
  type CouponFormErrors,
  type CouponFormValues,
} from "@/lib/coupons";
import { formatVND } from "@/lib/format";
import type { CouponKind } from "@/types";

const fieldStyle =
  "h-11 w-full rounded-lg border bg-white px-3 text-ink transition-colors duration-200 placeholder:text-[#686D69] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// Trang "Mã giảm giá" của Admin: tạo mã mới, xem số lượt đã dùng, tạm tắt hoặc xóa mã.
// Quy tắc dùng mã (đăng nhập, mỗi khách một lần, không cộng dồn hai mã giảm giá) nằm ở src/lib/coupons.ts.
export default function AdminCoupons() {
  const { coupons, orders, addCoupon, setCouponActive, deleteCoupon } = useStore();
  const [values, setValues] = useState<CouponFormValues>(emptyCouponForm);
  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const sorted = [...coupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function change(field: keyof CouponFormValues, value: string) {
    setValues({ ...values, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
    setMessage(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const checked = validateCouponForm(values, coupons);
    if (!checked.ok) {
      setErrors(checked.errors);
      const first = (Object.keys(checked.errors) as (keyof CouponFormValues)[])[0];
      document.getElementById(`coupon-${first}`)?.focus();
      return;
    }
    const result = addCoupon(checked.coupon);
    if (!result.ok) {
      setMessage({ ok: false, text: result.message });
      return;
    }
    setValues(emptyCouponForm);
    setErrors({});
    setMessage({ ok: true, text: `Đã tạo mã ${checked.coupon.code}.` });
  }

  function remove(code: string, used: number) {
    const note = used > 0 ? ` ${used} đơn đã dùng mã này vẫn giữ nguyên số tiền đã giảm.` : "";
    if (!window.confirm(`Xóa mã ${code}? Khách sẽ không nhập được mã này nữa.${note}`)) return;
    const result = deleteCoupon(code);
    setMessage(result.ok ? null : { ok: false, text: result.message });
  }

  function toggle(code: string, active: boolean) {
    const result = setCouponActive(code, active);
    setMessage(result.ok ? null : { ok: false, text: result.message });
  }

  // Một ô nhập có nhãn, gợi ý và lỗi
  function field(name: keyof CouponFormValues, label: string, hint: string, props: { placeholder?: string; inputMode?: "numeric" } = {}) {
    const error = errors[name];
    return (
      <div>
        <label htmlFor={`coupon-${name}`} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
        <input
          id={`coupon-${name}`}
          type="text"
          autoComplete="off"
          value={values[name]}
          onChange={(event) => change(name, event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`coupon-${name}-note`}
          className={`${fieldStyle} ${name === "code" ? "uppercase placeholder:normal-case" : ""} ${error ? fieldBad : fieldOk}`}
          {...props}
        />
        <p id={`coupon-${name}-note`} className={`mt-1 text-xs ${error ? "text-sale" : "text-ink-muted"}`}>
          {error ?? hint}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form noValidate onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-5 md:p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Tạo mã mới</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Khách phải đăng nhập để dùng mã, và mỗi khách dùng mỗi mã một lần. Mỗi đơn dùng được một mã giảm giá (thay cho khoản giảm
          mặc định) và một mã miễn phí vận chuyển.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {field("code", "Mã", "Chữ cái không dấu và chữ số, 3–20 ký tự. Ví dụ: TET2027", { placeholder: "TET2027" })}

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-ink">Loại ưu đãi</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(couponKindLabels) as CouponKind[]).map((kind) => (
                <label
                  key={kind}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${
                    values.kind === kind ? "border-primary bg-primary-soft font-semibold text-primary" : "border-line text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="coupon-kind"
                    value={kind}
                    checked={values.kind === kind}
                    onChange={() => {
                      setValues({ ...values, kind, value: "", maxDiscount: "" });
                      setErrors({ ...errors, value: undefined, maxDiscount: undefined });
                    }}
                    className="h-4 w-4 accent-primary"
                  />
                  {couponKindLabels[kind]}
                </label>
              ))}
            </div>
          </fieldset>

          {values.kind === "PERCENT" && (
            <>
              {field("value", "Giảm bao nhiêu %", "Từ 1 đến 100", { placeholder: "30", inputMode: "numeric" })}
              {field("maxDiscount", "Giảm tối đa (₫)", "Không bắt buộc. Ví dụ 100.000", { placeholder: "100.000", inputMode: "numeric" })}
            </>
          )}
          {values.kind === "AMOUNT" &&
            field("value", "Số tiền giảm (₫)", "Từ 1.000₫. Không giảm quá tạm tính của đơn", { placeholder: "50.000", inputMode: "numeric" })}

          {field("minSubtotal", "Đơn tối thiểu (₫)", "Không bắt buộc. Tạm tính phải từ mức này", { placeholder: "300.000", inputMode: "numeric" })}
          {field("usageLimit", "Tổng số lượt dùng", "Không bắt buộc. Để trống = không giới hạn", { placeholder: "100", inputMode: "numeric" })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="submit" className={`${btnBase} ${btnPrimary}`}>
            Tạo mã
          </button>
          {message && (
            <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "font-medium text-che" : "text-sale"}`}>
              {message.text}
            </p>
          )}
        </div>
      </form>

      <div className={tableWrap}>
        <table className={`${table} min-w-[760px]`}>
          <thead>
            <tr>
              <th className={th}>Mã</th>
              <th className={th}>Ưu đãi</th>
              <th className={th}>Điều kiện</th>
              <th className={th}>Đã dùng</th>
              <th className={th}>Trạng thái</th>
              <th className={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Mã hộ chiếu: cố định, chỉ để Admin thấy đủ các mã khách có thể nhập */}
            <tr className="group">
              <td className={`${td} font-semibold`}>{PASSPORT_COUPON.code}</td>
              <td className={td}>
                {describeCoupon({ kind: "PERCENT", value: PASSPORT_COUPON.percent, maxDiscount: PASSPORT_COUPON.maxDiscount })}
              </td>
              <td className={td}>Đủ {PASSPORT_COUPON.stampsNeeded} dấu Hộ chiếu đặc sản</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{ordersUsingCode(orders, PASSPORT_COUPON.code).length}</td>
              <td className={td}>
                <span className="text-sm text-ink-muted">Luôn bật</span>
              </td>
              <td className={`${td} text-sm text-ink-muted`}>Mã cố định</td>
            </tr>
            {sorted.map((coupon) => {
              const used = ordersUsingCode(orders, coupon.code).length;
              const soldOut = coupon.usageLimit !== undefined && used >= coupon.usageLimit;
              return (
                <tr key={coupon.code} className="group">
                  <td className={`${td} font-semibold`}>{coupon.code}</td>
                  <td className={td}>{describeCoupon(coupon)}</td>
                  <td className={td}>{coupon.minSubtotal ? `Đơn từ ${formatVND(coupon.minSubtotal)}` : "Mọi đơn"}</td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>
                    {used}
                    {coupon.usageLimit !== undefined && ` / ${coupon.usageLimit}`}
                  </td>
                  <td className={td}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        !coupon.active ? "bg-surface text-ink-muted" : soldOut ? "bg-gold-soft text-gold-ink" : "bg-che-soft text-che"
                      }`}
                    >
                      {!coupon.active ? "Đã tắt" : soldOut ? "Hết lượt" : "Đang bật"}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="flex items-start gap-2">
                      <button type="button" onClick={() => toggle(coupon.code, !coupon.active)} className={actionEdit}>
                        {coupon.active ? "Tắt" : "Bật"}
                      </button>
                      <button type="button" onClick={() => remove(coupon.code, used)} className={actionDanger}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className={`${td} py-8 text-center text-ink-muted`}>
                  Chưa có mã nào do cửa hàng tạo. Tạo mã đầu tiên ở form phía trên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
