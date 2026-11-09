// Số liệu cho trang Admin (Tổng quan và Thống kê sản phẩm). Mọi con số đếm từ dữ liệu trong localStorage.
import { LOW_STOCK } from "@/lib/cart";
import { adminOrderStatuses } from "@/lib/orders";
import type { Order, OrderStatus, Product } from "@/types";

export type ProductStat = {
  product: Product;
  sold: number; // số lượng đã đặt, không tính đơn đã hủy
  orderCount: number; // số đơn (không hủy) có sản phẩm này
  revenue: number; // tiền hàng của sản phẩm trong các đơn ĐÃ HOÀN THÀNH (giá lúc mua × số lượng)
  views: number; // số lần trang chi tiết được mở (trên trình duyệt này)
};

export function productStats(products: Product[], orders: Order[], views: Record<string, number>): ProductStat[] {
  return products.map((product) => {
    let sold = 0;
    let orderCount = 0;
    let revenue = 0;
    for (const order of orders) {
      if (order.status === "CANCELLED") continue;
      const lines = order.items.filter((item) => item.productId === product.id);
      if (lines.length === 0) continue;
      orderCount += 1;
      for (const line of lines) {
        sold += line.quantity;
        if (order.status === "COMPLETED") revenue += line.price * line.quantity;
      }
    }
    return { product, sold, orderCount, revenue, views: views[product.id] ?? 0 };
  });
}

// Số đơn theo từng trạng thái (cả "Đã hủy"), theo thứ tự của adminOrderStatuses
export function ordersByStatus(orders: Order[]) {
  const counts = Object.fromEntries(adminOrderStatuses.map((status) => [status, 0])) as Record<OrderStatus, number>;
  for (const order of orders) counts[order.status] += 1;
  return counts;
}

// Sản phẩm còn từ LOW_STOCK trở xuống (kể cả đã hết), ít nhất lên đầu
export function lowStockProducts(products: Product[]) {
  return products.filter((product) => product.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, "vi"));
}

// ---------- Theo thời gian (trang Thống kê) ----------

const DAY_MS = 86_400_000;
const vnDateKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // "2026-11-08"

// Ngày (giờ Việt Nam) của một thời điểm ISO, dạng "YYYY-MM-DD"
export function dayKey(iso: string | Date) {
  return vnDateKey.format(typeof iso === "string" ? new Date(iso) : iso);
}

// "2026-11-08" -> số ngày kể từ 1970 (để cộng trừ ngày mà không lệch múi giờ)
function dayNumber(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

function keyFromNumber(n: number) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

// "2026-11-08" -> "08/11"
export function shortDay(key: string) {
  return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
}

export type RangeDays = 7 | 30 | 90 | null; // null = tất cả

// Khoảng ngày [from, to] (tính cả hai đầu) của bộ lọc. "Tất cả": từ đơn đầu tiên tới hôm nay.
export function rangeBounds(orders: Order[], days: RangeDays, now = new Date()) {
  const to = dayNumber(dayKey(now));
  if (days !== null) return { from: to - days + 1, to };
  const first = orders.reduce((min, order) => Math.min(min, dayNumber(dayKey(order.createdAt))), to);
  return { from: first, to };
}

// Đơn đặt trong khoảng [from, to]
export function ordersBetween(orders: Order[], from: number, to: number) {
  return orders.filter((order) => {
    const n = dayNumber(dayKey(order.createdAt));
    return n >= from && n <= to;
  });
}

export type SalesPoint = {
  key: string; // ngày đầu của nhóm, "YYYY-MM-DD"
  label: string; // "08/11", hoặc "02/11–08/11" khi gộp theo tuần
  value: number; // doanh số: tổng tiền các đơn không hủy
  orders: number; // số đơn không hủy
};

// Doanh số theo ngày trong khoảng [from, to]. Khoảng dài hơn 92 ngày thì gộp theo tuần cho dễ đọc.
export function salesSeries(orders: Order[], from: number, to: number): SalesPoint[] {
  const step = to - from + 1 > 92 ? 7 : 1;
  const points: SalesPoint[] = [];
  for (let start = from; start <= to; start += step) {
    const end = Math.min(start + step - 1, to);
    const label = step === 1 ? shortDay(keyFromNumber(start)) : `${shortDay(keyFromNumber(start))}–${shortDay(keyFromNumber(end))}`;
    points.push({ key: keyFromNumber(start), label, value: 0, orders: 0 });
  }
  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    const n = dayNumber(dayKey(order.createdAt));
    if (n < from || n > to) continue;
    const point = points[Math.floor((n - from) / step)];
    point.value += order.total;
    point.orders += 1;
  }
  return points;
}

// Số liệu chính của một nhóm đơn (đơn đã hủy không tính)
export function salesSummary(orders: Order[]) {
  const live = orders.filter((order) => order.status !== "CANCELLED");
  const revenue = live.reduce((sum, order) => sum + order.total, 0);
  const items = live.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
  return { revenue, orders: live.length, items, average: live.length > 0 ? Math.round(revenue / live.length) : 0 };
}
