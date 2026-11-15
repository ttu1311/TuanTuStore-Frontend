"use client";

import { useState } from "react";
import RevenueBarChart from "@/components/admin/charts/RevenueBarChart";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { revenueSeries, revenueWindow, type RevenueUnit } from "@/lib/stats";

const units: { unit: RevenueUnit; label: string; range: string }[] = [
  { unit: "day", label: "Ngày", range: `${revenueWindow.day} ngày gần nhất` },
  { unit: "week", label: "Tuần", range: `${revenueWindow.week} tuần gần nhất` },
  { unit: "quarter", label: "Quý", range: `${revenueWindow.quarter} quý gần nhất` },
  { unit: "year", label: "Năm", range: "các năm có bán hàng" },
];

// "Doanh thu" ở trang Tổng quan: biểu đồ cột theo ngày / tuần / quý / năm.
// Doanh thu = tổng tiền khách trả của các đơn ĐÃ HOÀN THÀNH, xếp vào kỳ theo ngày đặt hàng (giống ô "Doanh thu" phía trên).
export default function AdminRevenue() {
  const { orders } = useStore();
  const [unit, setUnit] = useState<RevenueUnit>("day");
  const current = units.find((item) => item.unit === unit) ?? units[0];
  const points = revenueSeries(orders, unit);
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const orderCount = points.reduce((sum, point) => sum + point.orders, 0);

  return (
    <section aria-labelledby="revenue-title" className="mt-6 rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="revenue-title" className="font-display text-xl font-semibold text-ink">
            Doanh thu
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Đơn đã hoàn thành, theo ngày đặt hàng · rê chuột để xem từng kỳ</p>
        </div>
        <div role="group" aria-label="Xem doanh thu theo" className="flex gap-1 rounded-full bg-surface p-1">
          {units.map((item) => (
            <button
              key={item.unit}
              type="button"
              aria-pressed={unit === item.unit}
              onClick={() => setUnit(item.unit)}
              className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm transition-colors duration-200 ${
                unit === item.unit ? "bg-white font-semibold text-primary shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-ink">
        <span className="text-2xl font-bold text-primary">{formatVND(total)}</span>{" "}
        <span className="block text-sm text-ink-muted sm:inline">
          trong {current.range} · {orderCount} đơn
        </span>
      </p>

      <div className="mt-3">
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">Chưa có đơn hoàn thành nào trong {current.range}.</p>
        ) : (
          <RevenueBarChart points={points} label={`theo ${current.label.toLowerCase()}, ${current.range}`} />
        )}
      </div>

      {/* Cùng số liệu ở dạng bảng (cho người không xem được biểu đồ) */}
      {total > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-primary">Xem dạng bảng</summary>
          <table className="mt-2 w-full max-w-md text-left">
            <thead>
              <tr className="text-ink-muted">
                <th className="py-1 font-medium">{current.label}</th>
                <th className="py-1 text-right font-medium">Số đơn</th>
                <th className="py-1 text-right font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {points
                .filter((point) => point.orders > 0)
                .map((point) => (
                  <tr key={point.key} className="border-t border-line">
                    <td className="py-1">{point.longLabel}</td>
                    <td className="py-1 text-right tabular-nums">{point.orders}</td>
                    <td className="py-1 text-right tabular-nums">{formatVND(point.value)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}
