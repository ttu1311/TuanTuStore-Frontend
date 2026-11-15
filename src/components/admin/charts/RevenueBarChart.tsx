"use client";

import { useState } from "react";
import { BASELINE, CHART_BLUE, GRID, compactVND, niceTicks } from "@/components/admin/charts/chartTheme";
import { useElementWidth } from "@/components/admin/charts/useElementWidth";
import { formatVND } from "@/lib/format";
import type { RevenuePoint } from "@/lib/stats";

const HEIGHT = 260;
const PAD = { top: 24, right: 8, bottom: 30, left: 52 };

// "Doanh thu": mỗi kỳ (ngày / tuần / quý / năm) một cột. Rê chuột hoặc dùng phím ← → để xem từng kỳ:
// cột đang xem đậm lên, chú thích hiện doanh thu và số đơn. Kỳ cao nhất được ghi số ngay trên cột.
export default function RevenueBarChart({ points, label }: { points: RevenuePoint[]; label: string }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(0, ...points.map((point) => point.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = points.length > 0 ? plotW / points.length : 0;
  const barW = Math.max(2, Math.min(48, slot * 0.7));
  const cx = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const peak = max > 0 ? points.findIndex((point) => point.value === max) : -1;
  // Nhãn dưới trục: đủ chỗ thì ghi hết, không thì cách đều, đếm lùi từ kỳ mới nhất (kỳ mới nhất luôn có nhãn, không đè nhau)
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(plotW / 44))));

  function pick(clientX: number, target: Element) {
    const box = target.getBoundingClientRect();
    const i = Math.floor((clientX - box.left - PAD.left) / Math.max(1, slot));
    setActive(i >= 0 && i < points.length ? i : null);
  }

  function handleKey(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) => Math.min(points.length - 1, Math.max(0, (current ?? (step > 0 ? -1 : points.length)) + step)));
  }

  const shown = active === null ? null : points[active];
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Doanh thu ${label}, tổng ${formatVND(total)}${peak >= 0 ? `, cao nhất ${formatVND(max)} (${points[peak].longLabel})` : ""}. Dùng phím mũi tên để xem từng kỳ.`}
          tabIndex={0}
          onPointerMove={(event) => pick(event.clientX, event.currentTarget)}
          onPointerLeave={() => setActive(null)}
          onKeyDown={handleKey}
          onBlur={() => setActive(null)}
          className="block touch-none rounded-md focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-soft"
        >
          {/* Lưới ngang và số trên trục dọc */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? BASELINE : GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} className="fill-ink-muted tabular-nums">
                {compactVND(tick)}
              </text>
            </g>
          ))}

          {/* Cột: cột đang xem đậm, các cột khác nhạt đi một chút */}
          {points.map((point, i) =>
            point.value > 0 ? (
              <rect
                key={point.key}
                x={cx(i) - barW / 2}
                y={y(point.value)}
                width={barW}
                height={Math.max(1, y(0) - y(point.value))}
                rx={Math.min(4, barW / 4)}
                fill={CHART_BLUE}
                fillOpacity={active === null || active === i ? 1 : 0.45}
              />
            ) : null
          )}

          {/* Nhãn kỳ dưới trục ngang */}
          {points.map((point, i) =>
            (points.length - 1 - i) % labelEvery === 0 ? (
              <text key={point.key} x={cx(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} className="fill-ink-muted">
                {point.label}
              </text>
            ) : null
          )}

          {/* Kỳ cao nhất: số ngay trên cột */}
          {peak >= 0 && (
            <text
              x={Math.min(Math.max(cx(peak), PAD.left + 24), PAD.left + plotW - 24)}
              y={y(max) - 8}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              className="fill-ink"
            >
              {compactVND(max)}
            </text>
          )}
        </svg>
      )}

      {shown && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-[9rem] rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-card"
          style={{ left: Math.min(Math.max(cx(active) - 72, 0), Math.max(0, width - 170)) }}
        >
          <p className="text-base font-bold text-ink">{formatVND(shown.value)}</p>
          <p className="whitespace-nowrap text-ink-muted">
            {shown.longLabel} · {shown.orders} đơn
          </p>
        </div>
      )}
    </div>
  );
}
