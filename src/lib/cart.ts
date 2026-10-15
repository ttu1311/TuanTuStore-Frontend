import type { CartItem, Product } from "@/types";

export const MAX_QUANTITY = 99; // per product in the cart
export const SHIPPING_FEE = 30000; // fixed shipping fee (VND)
export const DISCOUNT = 20000; // fixed discount on every order (VND)

// A quantity is always a whole number from 1 to 99
export function cleanQuantity(value: number) {
  return Number.isFinite(value) ? Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value))) : 1;
}

export type CartLine = { product: Product; quantity: number };

// Joins each cart item with its product. Items whose product no longer exists are skipped.
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
