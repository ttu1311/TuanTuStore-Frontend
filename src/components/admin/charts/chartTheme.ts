// Màu và định dạng dùng chung cho các biểu đồ ở trang Admin.
// Màu dữ liệu là xanh #2a78d6 (đã kiểm tra: đủ sáng, đủ đậm màu, tương phản ≥ 3:1 trên nền trắng).
// Màu dữ liệu tách riêng khỏi màu đỏ gạch của thương hiệu, để biểu đồ không lẫn với nút bấm và nhãn giảm giá.
export const CHART_BLUE = "#2a78d6";
export const GRID = "#E3E1DB"; // đường lưới: mảnh, nhạt
export const BASELINE = "#c3c2b7"; // trục gốc

// Số trên trục: 0, 500k, 1tr, 1,5tr
export function compactVND(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

// Mức chia trục "đẹp" (1, 2, 5 × 10ⁿ), khoảng 4 vạch
export function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let t = 0; t <= max + step * 0.001; t += step) ticks.push(t);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
