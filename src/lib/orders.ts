// Labels, colors, order codes and checkout rules. Shared by checkout, the account page and the Admin pages.
import type { OrderStatus, PaymentMethod } from "@/types";
import { isValidEmail, isValidPhone } from "@/lib/validation";

// The 4 statuses, in the order an order moves through them
export const orderStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"];

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
};

// Badge colors
export const orderStatusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-gold-soft text-gold-ink",
  CONFIRMED: "bg-surface text-ink",
  SHIPPING: "bg-brown-soft text-brown",
  COMPLETED: "bg-primary-soft text-primary",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

// 1 -> "TT-000001"
export function formatOrderCode(orderNumber: number) {
  return `TT-${String(orderNumber).padStart(6, "0")}`;
}

// "TT-000001" -> 1
export function orderNumberFromCode(code: string) {
  return Number(code.replace(/\D/g, "")) || 0;
}

// ---------- Checkout form ----------

export type CheckoutFields = {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

// Checked in this order, so the first error is also the first field on the page
export const requiredMessages: [keyof CheckoutFields, string][] = [
  ["fullName", "Vui lòng nhập họ và tên"],
  ["phone", "Vui lòng nhập số điện thoại"],
  ["email", "Vui lòng nhập email"],
  ["province", "Vui lòng nhập tỉnh / thành phố"],
  ["district", "Vui lòng nhập quận / huyện"],
  ["ward", "Vui lòng nhập phường / xã"],
  ["address", "Vui lòng nhập địa chỉ cụ thể"],
];

// Longest text allowed in each field
export const MAX_LENGTH: Record<keyof CheckoutFields, number> = {
  fullName: 100,
  phone: 20,
  email: 254,
  province: 100,
  district: 100,
  ward: 100,
  address: 200,
  note: 500,
};

export function validateCheckout(values: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};

  for (const [field, message] of requiredMessages) {
    if (values[field].trim() === "") errors[field] = message;
  }

  if (!errors.phone && !isValidPhone(values.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  }

  if (!errors.email && !isValidEmail(values.email)) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  for (const field of Object.keys(MAX_LENGTH) as (keyof CheckoutFields)[]) {
    if (!errors[field] && values[field].trim().length > MAX_LENGTH[field]) {
      errors[field] = `Tối đa ${MAX_LENGTH[field]} ký tự`;
    }
  }

  return errors;
}
