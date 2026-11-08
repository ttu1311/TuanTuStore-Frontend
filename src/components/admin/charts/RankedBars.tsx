"use client";

import { useState } from "react";
import { CHART_BLUE } from "@/components/admin/charts/chartTheme";

export type BarItem = {
  id: string;
  label: string;
  value: number;
  valueText: string; // số ghi ở đầu thanh, ví dụ "6"
  tooltipValue: string; // dòng đậm đầu tiên của chú thích, ví dụ "6 đã bán"
  details: string[]; // các dòng thêm trong chú thích khi rê chuột, ví dụ "Doanh thu 1.050.000₫"
  dotClass?: string; // chấm màu cạnh tên (ví dụ màu miền); tên vẫn ghi đủ, màu không mang nghĩa một mình
};

// Thanh ngang xếp từ lớn đến nhỏ, một màu, cùng một đường gốc bên trái.
// Mỗi thanh mảnh (14px), đầu thanh bo 4px, số ghi ở đầu thanh. Rê chuột hoặc Tab tới một dòng để xem chi tiết.
export default function RankedBars({ items, label, empty }: { items: BarItem[]; label: string; empty: string }) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) return <p className="py-6 text-sm text-ink-muted">{empty}</p>;

  return (
    <ul aria-label={label} className="space-y-1">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <li
            key={item.id}
            tabIndex={0}
            onPointerEnter={() => setActive(item.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(item.id)}
            onBlur={() => setActive(null)}
            aria-label={`${item.label}: ${item.tooltipValue}. ${item.details.join(". ")}`}
            className="relative grid grid-cols-[minmax(0,40%)_minmax(0,1fr)] items-center gap-3 rounded-md px-1 py-1.5 outline-none transition-colors duration-150 hover:bg-surface focus-visible:bg-surface focus-visible:ring-[3px] focus-visible:ring-primary-soft"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
              {item.dotClass && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClass}`} aria-hidden="true" />}
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2" aria-hidden="true">
              <span
                className="block h-3.5 rounded-r transition-opacity duration-150"
                style={{
                  width: item.value > 0 ? `max(4px, calc((100% - 3.5rem) * ${item.value / max}))` : 0,
                  backgroundColor: CHART_BLUE,
                  opacity: active === null || isActive ? 1 : 0.45,
                }}
              />
              <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{item.valueText}</span>
            </span>

            {isActive && item.details.length > 0 && (
              <span
                role="status"
                className="pointer-events-none absolute right-1 top-full z-10 mt-1 rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-card"
              >
                <span className="block font-bold text-ink">{item.tooltipValue}</span>
                {item.details.map((line) => (
                  <span key={line} className="block whitespace-nowrap text-ink-muted">
                    {line}
                  </span>
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
