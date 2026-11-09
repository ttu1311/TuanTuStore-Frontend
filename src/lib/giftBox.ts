// "Hộp quà Ba Miền": hỏi dịp và ngân sách, rồi ghép sẵn MỖI MIỀN MỘT MÓN hợp nhất.
// Hàm thuần (không React, không localStorage) để dễ kiểm tra. Dữ liệu lấy từ sản phẩm thật:
// dịp tặng (Product.occasions), giá (Product.price), miền (Product.region), còn hàng (Product.stock).
import { occasions } from "@/data/occasions";
import { regionKeys } from "@/lib/regions";
import type { Product, Region } from "@/types";

export const ANY = "bat-ky"; // "chưa nghĩ ra / không giới hạn" ở cả 2 câu hỏi

export type BudgetId = "duoi-100" | "100-200" | "tren-200" | typeof ANY;

// Ngân sách tính cho MỖI món (giá một sản phẩm), đơn vị VND
export const budgets: { id: BudgetId; label: string; hint: string }[] = [
  { id: "duoi-100", label: "Dưới 100.000₫", hint: "Quà nhỏ, ăn vặt" },
  { id: "100-200", label: "100.000 – 200.000₫", hint: "Vừa túi tiền, hợp biếu" },
  { id: "tren-200", label: "Trên 200.000₫", hint: "Quà trang trọng" },
  { id: ANY, label: "Không giới hạn", hint: "Chọn món hợp nhất" },
];

export type BoxCriteria = {
  occasion: string; // id trong src/data/occasions.ts, hoặc ANY
  budget: BudgetId;
};

export function inBudget(price: number, budget: BudgetId) {
  if (budget === "duoi-100") return price < 100_000;
  if (budget === "100-200") return price >= 100_000 && price <= 200_000;
  if (budget === "tren-200") return price > 200_000;
  return true;
}

// Đọc ?dip= và ?ngan-sach= từ đường dẫn; giá trị lạ thì coi là "bất kỳ"
export function parseCriteria(dip: string | undefined, budget: string | undefined): BoxCriteria {
  const occasion = occasions.some((item) => item.id === dip) ? (dip as string) : ANY;
  const validBudget = budgets.some((item) => item.id === budget) ? (budget as BudgetId) : ANY;
  return { occasion, budget: validBudget };
}

// Số tiêu chí khách chọn cụ thể (0–2)
export function activeCriteria(criteria: BoxCriteria) {
  return Number(criteria.occasion !== ANY) + Number(criteria.budget !== ANY);
}

// Một món khớp tiêu chí nào. `exact` = khớp ĐỦ mọi tiêu chí khách đã chọn (không chọn gì thì luôn là true).
export function matchCriteria(product: Product, criteria: BoxCriteria) {
  const occasionActive = criteria.occasion !== ANY;
  const budgetActive = criteria.budget !== ANY;
  const occasion = occasionActive && (product.occasions ?? []).includes(criteria.occasion);
  const budget = budgetActive && inBudget(product.price, criteria.budget);
  return {
    occasion,
    budget,
    count: Number(occasion) + Number(budget),
    exact: (!occasionActive || occasion) && (!budgetActive || budget),
  };
}

export type SlotPick = { product: Product; occasion: boolean; budget: boolean; exact: boolean };

// Mỗi miền một món hợp nhất, trong số món CÒN HÀNG của miền đó. Xếp hạng: khớp nhiều tiêu chí trước;
// bằng nhau thì món bán chạy (mua × 5 + lượt xem), rồi theo tên.
// Không món nào khớp thì vẫn chọn món tốt nhất của miền (ô không bao giờ để trống khi miền còn hàng),
// và `exact: false` để giao diện nói rõ đó là món gần nhất.
export function suggestBox(
  products: Product[],
  criteria: BoxCriteria,
  sold: Map<string, number>,
  views: Record<string, number>
): Record<Region, SlotPick | null> {
  const slots = {} as Record<Region, SlotPick | null>;
  for (const region of regionKeys) {
    const ranked = products
      .filter((product) => product.region === region && product.stock > 0)
      .map((product) => ({
        product,
        match: matchCriteria(product, criteria),
        score: (sold.get(product.id) ?? 0) * 5 + (views[product.id] ?? 0),
      }))
      .sort(
        (a, b) =>
          b.match.count - a.match.count ||
          b.score - a.score ||
          a.product.name.localeCompare(b.product.name, "vi")
      );
    const best = ranked[0];
    slots[region] = best
      ? { product: best.product, occasion: best.match.occasion, budget: best.match.budget, exact: best.match.exact }
      : null;
  }
  return slots;
}
