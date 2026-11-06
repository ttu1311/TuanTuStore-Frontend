import type { CartItem, Product } from "@/types";

export const MAX_QUANTITY = 99; // tối đa cho mỗi sản phẩm trong giỏ
export const SHIPPING_FEE = 30000; // phí vận chuyển cố định (VND)
export const DISCOUNT = 20000; // giảm giá cố định cho mọi đơn hàng (VND)

// Số lượng luôn là số nguyên từ 1 đến 99
export function cleanQuantity(value: number) {
  return Number.isFinite(value) ? Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value))) : 1;
}

export type CartLine = { product: Product; quantity: number };

// Ghép mỗi mục trong giỏ với sản phẩm của nó. Bỏ qua các mục có sản phẩm không còn tồn tại.
export function getCartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
}

// Tạm tính + Phí vận chuyển − Giảm giá = Tổng cộng
export function calculateTotals(subtotal: number) {
  return { subtotal, shippingFee: SHIPPING_FEE, discount: DISCOUNT, total: subtotal + SHIPPING_FEE - DISCOUNT };
}
