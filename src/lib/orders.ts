// Nhãn, màu sắc, mã đơn hàng và quy tắc thanh toán. Dùng chung cho trang thanh toán, trang tài khoản và các trang Admin.
import type { Order, OrderStatus, PaymentMethod, PaymentStatus, SavedAddress } from "@/types";
import { validateAddress } from "@/lib/address";
import { isValidEmail, isValidPhone } from "@/lib/validation";

// 4 trạng thái, theo thứ tự một đơn hàng đi qua (đơn "Đã hủy" thì dừng lại, không đi tiếp)
export const orderStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"];

// Các trạng thái Admin chọn được: 4 bước + "Đã hủy"
export const adminOrderStatuses: OrderStatus[] = [...orderStatuses, "CANCELLED"];

// Đơn chưa giao (hàng còn ở cửa hàng): hủy hoặc xóa đơn thì trả hàng lại kho
export function isNotShipped(status: OrderStatus) {
  return status === "PENDING" || status === "CONFIRMED";
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// Màu của huy hiệu
export const orderStatusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-gold-soft text-gold-ink",
  CONFIRMED: "bg-surface text-ink",
  SHIPPING: "bg-brown-soft text-brown",
  COMPLETED: "bg-che-soft text-che", // xanh lá: xong, tốt
  CANCELLED: "bg-sale/10 text-sale",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Chờ thanh toán",
  PAID: "Đã thanh toán",
};

export const paymentStatusStyles: Record<PaymentStatus, string> = {
  UNPAID: "bg-sale/10 text-sale",
  PAID: "bg-che-soft text-che",
};

// Trạng thái thanh toán của một đơn: null với đơn COD (trả khi nhận hàng).
// Đơn chuyển khoản tạo trước khi có trường này được coi là chưa thanh toán.
export function paymentStatusOf(order: Order): PaymentStatus | null {
  if (order.paymentMethod !== "BANK_TRANSFER") return null;
  return order.paymentStatus ?? "UNPAID";
}

// 1 -> "TT-000001"
export function formatOrderCode(orderNumber: number) {
  return `TT-${String(orderNumber).padStart(6, "0")}`;
}

// "TT-000001" -> 1
export function orderNumberFromCode(code: string) {
  return Number(code.replace(/\D/g, "")) || 0;
}

// ---------- Form thanh toán ----------

// Người nhận hàng. Địa chỉ 2 cấp (Tỉnh → Xã/Phường/Đặc khu), xem src/lib/address.ts.
export type CheckoutFields = {
  fullName: string;
  phone: string;
  email: string;
  address: SavedAddress;
  note: string;
};

type ContactField = "fullName" | "phone" | "email" | "note";
export type CheckoutErrors = Partial<Record<ContactField | keyof SavedAddress, string>>;

// Thứ tự các ô trên trang: lỗi đầu tiên theo thứ tự này là ô được đưa con trỏ tới
export const checkoutFieldOrder: (ContactField | keyof SavedAddress)[] = [
  "fullName",
  "phone",
  "email",
  "province",
  "ward",
  "street",
  "note",
];

// Độ dài tối đa cho phép của các ô liên hệ
export const MAX_LENGTH: Record<ContactField, number> = {
  fullName: 100,
  phone: 20,
  email: 254,
  note: 500,
};

export function validateCheckout(values: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (values.fullName.trim() === "") errors.fullName = "Vui lòng nhập họ và tên";
  if (values.phone.trim() === "") errors.phone = "Vui lòng nhập số điện thoại";
  else if (!isValidPhone(values.phone)) errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  if (values.email.trim() === "") errors.email = "Vui lòng nhập email";
  else if (!isValidEmail(values.email)) errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";

  for (const field of Object.keys(MAX_LENGTH) as ContactField[]) {
    if (!errors[field] && values[field].trim().length > MAX_LENGTH[field]) {
      errors[field] = `Tối đa ${MAX_LENGTH[field]} ký tự`;
    }
  }

  return { ...errors, ...validateAddress(values.address) };
}
