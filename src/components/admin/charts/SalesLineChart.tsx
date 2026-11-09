"use client";

import { useState } from "react";
import { BASELINE, CHART_BLUE, GRID, compactVND, niceTicks } from "@/components/admin/charts/chartTheme";
import { useElementWidth } from "@/components/admin/charts/useElementWidth";
import { formatVND } from "@/lib/format";
import type { SalesPoint } from "@/lib/stats";

const HEIGHT = 260;
const PAD = { top: 24, right: 16, bottom: 30, left: 52 };

// "Doanh số theo ngày": một đường (2px) với nền nhạt bên dưới. Rê chuột (hoặc dùng phím ← →) để xem từng ngày:
// đường dóng dọc bám vào ngày gần nhất, chú thích hiện doanh số và số đơn. Ngày cao nhất được ghi số trực tiếp.
export default function SalesLineChart({ points }: { points: SalesPoint[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(0, ...points.map((point) => point.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const line = points.map((point, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ");
  const area = points.length > 0 ? `${line} L${x(points.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z` : "";
  const peak = max > 0 ? points.findIndex((point) => point.value === max) : -1;
  // Khoảng 6 nhãn ngày dưới trục, cách đều
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  function pick(clientX: number, target: Element) {
    const box = target.getBoundingClientRect();
    const ratio = (clientX - box.left - PAD.left) / Math.max(1, plotW);
    setActive(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))));
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
          aria-label={`Doanh số theo ngày, tổng ${formatVND(total)}${peak >= 0 ? `, cao nhất ${formatVND(max)} ngày ${points[peak].label}` : ""}. Dùng phím mũi tên để xem từng ngày.`}
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
          {/* Nhãn ngày dưới trục ngang */}
          {points.map((point, i) =>
            i % labelEvery === 0 || i === points.length - 1 ? (
              <text key={point.key} x={x(i)} y={HEIGHT - 8} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize={11} className="fill-ink-muted">
                {point.label}
              </text>
            ) : null
          )}

          <path d={area} fill={CHART_BLUE} fillOpacity={0.1} />
          <path d={line} fill="none" stroke={CHART_BLUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Ngày cao nhất: chấm + số trực tiếp */}
          {peak >= 0 && (
            <g>
              <circle cx={x(peak)} cy={y(max)} r={4} fill={CHART_BLUE} stroke="#fff" strokeWidth={2} />
              <text
                x={Math.min(Math.max(x(peak), PAD.left + 30), PAD.left + plotW - 30)}
                y={y(max) - 10}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                className="fill-ink"
              >
                {compactVND(max)}
              </text>
            </g>
          )}

          {/* Đường dóng + chấm của ngày đang xem */}
          {shown && active !== null && (
            <g pointerEvents="none">
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke={BASELINE} strokeWidth={1} />
              <circle cx={x(active)} cy={y(shown.value)} r={5} fill={CHART_BLUE} stroke="#fff" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}

      {shown && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-[9rem] rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-card"
          style={{ left: Math.min(Math.max(x(active) - 72, 0), Math.max(0, width - 150)) }}
        >
          <p className="text-base font-bold text-ink">{formatVND(shown.value)}</p>
          <p className="text-ink-muted">
            {shown.label} · {shown.orders} đơn
          </p>
        </div>
      )}
    </div>
  );
}
