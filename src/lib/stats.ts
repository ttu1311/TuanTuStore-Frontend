// Số liệu cho trang Admin (Tổng quan và Thống kê sản phẩm). Mọi con số đếm từ dữ liệu trong localStorage.
import { provinces } from "@/data/provinces";
import { isKnownProvince } from "@/lib/address";
import { INITIAL_STOCK, LOW_STOCK } from "@/lib/cart";
import { adminOrderStatuses } from "@/lib/orders";
import { productProvince } from "@/lib/products";
import type { Order, OrderStatus, Product, Region } from "@/types";

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

// Giá trị hàng đang tồn của một món = số còn trong kho × giá bán hiện tại (vốn bị "đọng" ở món đó, tính theo giá bán)
export function stockValue(product: Product) {
  return product.stock * product.price;
}

// 10 sản phẩm tồn kho nhiều nhất. Bằng nhau thì món có giá trị tồn cao hơn lên trước (đọng nhiều tiền hơn), rồi theo tên.
export function topStock(stats: ProductStat[], count = 10) {
  return [...stats]
    .filter((stat) => stat.product.stock > 0)
    .sort(
      (a, b) =>
        b.product.stock - a.product.stock ||
        stockValue(b.product) - stockValue(a.product) ||
        a.product.name.localeCompare(b.product.name, "vi")
    )
    .slice(0, count);
}

export type StockRow = ProductStat & {
  stockValue: number; // còn trong kho × giá bán
  soldShare: number; // 0–1: đã bán / (đã bán + còn trong kho)
  lastSoldAt: string | null; // ngày của đơn (không hủy) gần nhất có món này; null = chưa bán được
};

export type StockReport = {
  rows: StockRow[]; // topStock, kèm các số liệu thêm
  productCount: number; // số món đang bán (kể cả món hết hàng)
  totalUnits: number; // tổng số sản phẩm còn trong kho
  totalValue: number; // tổng giá trị hàng tồn
  unsoldCount: number; // số món chưa bán được cái nào
  scale: number; // mốc chung cho độ dài mọi thanh: tối đa của (INITIAL_STOCK, tồn + đã bán của món lớn nhất)
  uniform: boolean; // mọi món cùng số tồn và chưa có lượt bán nào (xếp hạng không có gì để so sánh)
};

// Số liệu cho khối "Tồn kho nhiều nhất" ở trang Tổng quan
export function stockReport(stats: ProductStat[], orders: Order[], count = 10): StockReport {
  const lastSold = new Map<string, string>();
  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    for (const item of order.items) {
      const known = lastSold.get(item.productId);
      if (!known || order.createdAt > known) lastSold.set(item.productId, order.createdAt);
    }
  }

  const rows = topStock(stats, count).map((stat) => ({
    ...stat,
    stockValue: stockValue(stat.product),
    soldShare: stat.sold > 0 ? stat.sold / (stat.sold + stat.product.stock) : 0,
    lastSoldAt: lastSold.get(stat.product.id) ?? null,
  }));

  const firstStock = stats[0]?.product.stock ?? 0;
  return {
    rows,
    productCount: stats.length,
    totalUnits: stats.reduce((sum, stat) => sum + Math.max(0, stat.product.stock), 0),
    totalValue: stats.reduce((sum, stat) => sum + Math.max(0, stockValue(stat.product)), 0),
    unsoldCount: stats.filter((stat) => stat.sold === 0).length,
    scale: Math.max(INITIAL_STOCK, ...rows.map((row) => row.product.stock + row.sold)),
    uniform: firstStock > 0 && stats.every((stat) => stat.sold === 0 && stat.product.stock === firstStock),
  };
}

// Sản phẩm còn từ LOW_STOCK trở xuống (kể cả đã hết), ít nhất lên đầu
export function lowStockProducts(products: Product[]) {
  return products.filter((product) => product.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, "vi"));
}

// ---------- Tỉnh bán chạy (trang Thống kê) ----------

// Món đã bị xóa khỏi cửa hàng: đơn chỉ lưu tên và giá, không lưu xuất xứ, nên không biết tỉnh
export const UNKNOWN_PROVINCE = "Không rõ xuất xứ";

export type ProvinceSale = {
  province: string; // tỉnh xuất xứ của sản phẩm (tên sau sáp nhập), hoặc UNKNOWN_PROVINCE
  region: Region | null; // miền của sản phẩm thuộc tỉnh này (null với UNKNOWN_PROVINCE)
  revenue: number; // tiền hàng: giá lúc mua × số lượng (không tính phí vận chuyển, giảm giá của đơn)
  quantity: number; // số lượng đã bán
  orders: number; // số đơn có ít nhất một món của tỉnh này
};

// Bán theo TỈNH XUẤT XỨ của sản phẩm (không phải tỉnh của người mua), chỉ đơn ĐÃ HOÀN THÀNH.
// orders: đã lọc theo khoảng thời gian ở trang. Xếp doanh thu giảm dần, bằng nhau thì số lượng, rồi tên.
export function provinceSales(products: Product[], orders: Order[]): ProvinceSale[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const rows = new Map<string, ProvinceSale & { codes: Set<string> }>();
  for (const order of orders) {
    if (order.status !== "COMPLETED") continue;
    for (const item of order.items) {
      const product = byId.get(item.productId);
      const province = product ? productProvince(product) : UNKNOWN_PROVINCE;
      const row = rows.get(province) ?? { province, region: product?.region ?? null, revenue: 0, quantity: 0, orders: 0, codes: new Set<string>() };
      row.revenue += item.price * item.quantity;
      row.quantity += item.quantity;
      row.codes.add(order.code);
      rows.set(province, row);
    }
  }
  return Array.from(rows.values(), ({ codes, ...row }) => ({ ...row, orders: codes.size })).sort(
    (a, b) => b.revenue - a.revenue || b.quantity - a.quantity || a.province.localeCompare(b.province, "vi")
  );
}

// "X/34 tỉnh đã có món bán ra": chỉ đếm các tỉnh trong danh sách 34 tỉnh (không tính "Không rõ xuất xứ")
export function provinceCoverage(sales: ProvinceSale[]) {
  return { sold: sales.filter((row) => row.quantity > 0 && isKnownProvince(row.province)).length, total: provinces.length };
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

// "Hôm nay", "Hôm qua", "12 ngày trước" (đếm theo ngày giờ Việt Nam)
export function daysAgoLabel(iso: string, now = new Date()) {
  const days = Math.max(0, dayNumber(dayKey(now)) - dayNumber(dayKey(iso)));
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
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

// Số liệu chính của một nhóm đơn (đơn đã hủy không tính)
export function salesSummary(orders: Order[]) {
  const live = orders.filter((order) => order.status !== "CANCELLED");
  const revenue = live.reduce((sum, order) => sum + order.total, 0);
  const items = live.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
  return { revenue, orders: live.length, items, average: live.length > 0 ? Math.round(revenue / live.length) : 0 };
}

// ---------- Doanh thu theo ngày / tuần / quý / năm (trang Tổng quan) ----------

export type RevenueUnit = "day" | "week" | "quarter" | "year";

export type RevenuePoint = {
  key: string; // ngày "2026-11-08", thứ Hai đầu tuần "2026-11-02", quý "2026-Q4", năm "2026"
  label: string; // nhãn ngắn dưới trục: "08/11", "02/11", "Q4/26", "2026"
  longLabel: string; // trong chú thích và bảng: "08/11/2026", "02/11–08/11/2026", "Quý 4/2026", "Năm 2026"
  value: number; // doanh thu: tổng tiền (khách trả) của các đơn ĐÃ HOÀN THÀNH đặt trong kỳ này
  orders: number; // số đơn hoàn thành
};

// Số kỳ hiển thị của mỗi đơn vị (năm: từ năm có đơn đầu tiên tới nay)
export const revenueWindow: Record<Exclude<RevenueUnit, "year">, number> = { day: 30, week: 12, quarter: 8 };

// Thứ Hai của tuần chứa ngày n (ngày 0 = 01/01/1970 là thứ Năm)
function mondayOf(n: number) {
  return n - ((((n + 3) % 7) + 7) % 7);
}

function yearOf(key: string) {
  return Number(key.slice(0, 4));
}

function quarterOf(key: string) {
  return Math.floor((Number(key.slice(5, 7)) - 1) / 3) + 1;
}

// Kỳ (của đơn vị unit) chứa ngày "YYYY-MM-DD"
function bucketKey(unit: RevenueUnit, key: string) {
  if (unit === "day") return key;
  if (unit === "week") return keyFromNumber(mondayOf(dayNumber(key)));
  if (unit === "quarter") return `${yearOf(key)}-Q${quarterOf(key)}`;
  return String(yearOf(key));
}

// Doanh thu theo kỳ, kỳ cũ nhất bên trái, kỳ hiện tại bên phải (kỳ không có đơn = 0)
export function revenueSeries(orders: Order[], unit: RevenueUnit, now = new Date()): RevenuePoint[] {
  const todayKey = dayKey(now);
  const today = dayNumber(todayKey);
  const points: RevenuePoint[] = [];

  if (unit === "day") {
    for (let n = today - revenueWindow.day + 1; n <= today; n++) {
      const key = keyFromNumber(n);
      points.push({ key, label: shortDay(key), longLabel: `${shortDay(key)}/${key.slice(0, 4)}`, value: 0, orders: 0 });
    }
  } else if (unit === "week") {
    const thisMonday = mondayOf(today);
    for (let i = revenueWindow.week - 1; i >= 0; i--) {
      const start = keyFromNumber(thisMonday - i * 7);
      const end = keyFromNumber(thisMonday - i * 7 + 6);
      points.push({ key: start, label: shortDay(start), longLabel: `Tuần ${shortDay(start)}–${shortDay(end)}/${end.slice(0, 4)}`, value: 0, orders: 0 });
    }
  } else if (unit === "quarter") {
    let year = yearOf(todayKey);
    let quarter = quarterOf(todayKey);
    for (let i = 0; i < revenueWindow.quarter; i++) {
      points.unshift({ key: `${year}-Q${quarter}`, label: `Q${quarter}/${String(year).slice(2)}`, longLabel: `Quý ${quarter}/${year}`, value: 0, orders: 0 });
      quarter -= 1;
      if (quarter === 0) {
        quarter = 4;
        year -= 1;
      }
    }
  } else {
    const thisYear = yearOf(todayKey);
    const firstYear = orders.reduce((min, order) => Math.min(min, yearOf(dayKey(order.createdAt))), thisYear);
    for (let year = firstYear; year <= thisYear; year++) {
      points.push({ key: String(year), label: String(year), longLabel: `Năm ${year}`, value: 0, orders: 0 });
    }
  }

  const byKey = new Map(points.map((point) => [point.key, point]));
  for (const order of orders) {
    if (order.status !== "COMPLETED") continue;
    const point = byKey.get(bucketKey(unit, dayKey(order.createdAt)));
    if (!point) continue; // ngoài khoảng đang xem
    point.value += order.total;
    point.orders += 1;
  }
  return points;
}
