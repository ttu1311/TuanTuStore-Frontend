// Data types of TuanTuStore.
// Every list below is saved in the browser's localStorage (see src/lib/storage.ts).

export type Region = "bac" | "trung" | "nam";

export interface Product {
  id: string; // e.g. "tra-thai-nguyen", used in the URL /san-pham/tra-thai-nguyen. Never changes.
  name: string;
  shortDescription: string; // shown next to the price on the detail page
  description: string; // paragraphs separated by a blank line
  price: number; // in VND (whole number)
  oldPrice?: number; // optional: shows a strike-through price and a discount
  image: string; // path inside /public, e.g. "/images/p-o-mai.jpg"
  region: Region;
  brand: string;
  origin: string; // where it is made
  pack: string; // e.g. "Gói 200g"
  isFeatured: boolean; // shown in "Sản phẩm nổi bật" on the homepage
  rank?: number; // best-seller position: 1 = "Top 1". Empty for other products.
  createdAt: string; // ISO date, used by the "Mới nhất" sort
}

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string; // always stored in lower case, unique
  phone: string; // "" when unknown
  // PLAIN TEXT, on purpose: this is a front-end demo with no server, so a password cannot be protected anyway.
  // See src/lib/password.ts and "Demo accounts" in README.md. Never use a real password here.
  password: string;
  role: Role;
  createdAt: string; // ISO date
}

// The cart only stores which product and how many. Name, price and image come from the product list.
export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED";

export type PaymentMethod = "COD" | "BANK_TRANSFER";

// A copy of the product at the moment of purchase,
// so later changes to the product (name, price) never change an old order.
export interface OrderItem {
  productId: string;
  name: string;
  price: number; // unit price at purchase time
  quantity: number;
}

export interface Order {
  code: string; // "TT-000001": unique, shown to customers
  userId: string | null; // null = guest checkout
  customerName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string; // "" when the customer wrote nothing
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string; // ISO date
}
