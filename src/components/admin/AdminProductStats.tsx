"use client";

import Link from "next/link";
import { useState } from "react";
import RankedBars, { type BarItem } from "@/components/admin/charts/RankedBars";
import SalesLineChart from "@/components/admin/charts/SalesLineChart";
import { table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { regionKeys, regions } from "@/lib/regions";
import {
  ordersBetween,
  productStats,
  rangeBounds,
  salesSeries,
  salesSummary,
  type ProductStat,
  type RangeDays,
} from "@/lib/stats";

const ranges: { days: RangeDays; label: string }[] = [
  { days: 7, label: "7 ngày" },
  { days: 30, label: "30 ngày" },
  { days: 90, label: "90 ngày" },
  { days: null, label: "Tất cả" },
];

const cardStyle = "rounded-xl border border-line bg-white p-5";
const cardTitle = "font-display text-xl font-semibold text-ink";

// "+12% so với 30 ngày trước" (null khi kỳ trước bằng 0: không có gì để so)
function changeText(now: number, before: number) {
  if (before === 0) return null;
  const percent = Math.round(((now - before) / before) * 100);
  return { percent, up: percent >= 0 };
}

type SortKey = "name" | "sold" | "orderCount" | "revenue" | "views" | "stock";

const columns: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Sản phẩm", numeric: false },
  { key: "sold", label: "Đã bán", numeric: true },
  { key: "orderCount", label: "Số đơn", numeric: true },
  { key: "revenue", label: "Doanh thu", numeric: true },
  { key: "views", label: "Lượt xem", numeric: true },
  { key: "stock", label: "Tồn kho", numeric: true },
];

function valueOf(stat: ProductStat, key: SortKey) {
  if (key === "name") return stat.product.name;
  if (key === "stock") return stat.product.stock;
  return stat[key];
}

// Trang Thống kê: bộ lọc thời gian ở trên cùng, mọi thứ bên dưới (số liệu, biểu đồ, bảng) đều theo khoảng đã chọn.
// Bảng: lượt mua theo từng sản phẩm; bấm tiêu đề cột để sắp xếp, bấm lại để đảo chiều.
export default function AdminProductStats() {
  const { products, orders, productViews } = useStore();
  const [sortKey, setSortKey] = useState<SortKey>("sold");
  const [descending, setDescending] = useState(true);
  const [rangeDays, setRangeDays] = useState<RangeDays>(30);

  // Đơn trong khoảng đã chọn, và đơn của kỳ liền trước cùng độ dài (để so sánh tăng/giảm)
  const { from, to } = rangeBounds(orders, rangeDays);
  const inRange = ordersBetween(orders, from, to);
  const summary = salesSummary(inRange);
  const previous = rangeDays === null ? null : salesSummary(ordersBetween(orders, from - rangeDays, from - 1));
  const series = salesSeries(orders, from, to);
  const rangeLabel = ranges.find((range) => range.days === rangeDays)?.label.toLowerCase() ?? "";

  const stats = productStats(products, inRange, productViews);
  const maxSold = Math.max(1, ...stats.map((stat) => stat.sold));
  const sorted = [...stats].sort((a, b) => {
    const x = valueOf(a, sortKey);
    const y = valueOf(b, sortKey);
    const order = typeof x === "string" ? x.localeCompare(String(y), "vi") : x - (y as number);
    // Bằng nhau thì xếp theo tên, để thứ tự luôn ổn định
    return (descending ? -order : order) || a.product.name.localeCompare(b.product.name, "vi");
  });

  function sortBy(key: SortKey) {
    if (key === sortKey) setDescending(!descending);
    else {
      setSortKey(key);
      setDescending(key !== "name"); // cột số: lớn trước; tên: A → Z
    }
  }

  const totals = stats.reduce(
    (sum, stat) => ({ sold: sum.sold + stat.sold, revenue: sum.revenue + stat.revenue, views: sum.views + stat.views }),
    { sold: 0, revenue: 0, views: 0 }
  );

  // Top 8 sản phẩm bán chạy trong khoảng này (món chưa bán không vẽ)
  const topBars: BarItem[] = [...stats]
    .filter((stat) => stat.sold > 0)
    .sort((a, b) => b.sold - a.sold || b.revenue - a.revenue)
    .slice(0, 8)
    .map((stat) => ({
      id: stat.product.id,
      label: stat.product.name,
      value: stat.sold,
      valueText: String(stat.sold),
      tooltipValue: `${stat.sold} đã bán`,
      details: [`${stat.orderCount} đơn`, `Doanh thu ${formatVND(stat.revenue)}`, `Còn ${stat.product.stock} trong kho`],
    }));

  // Đã bán theo miền, lớn trước
  const regionBars: BarItem[] = regionKeys
    .map((key) => {
      const own = stats.filter((stat) => stat.product.region === key);
      const sold = own.reduce((sum, stat) => sum + stat.sold, 0);
      const revenue = own.reduce((sum, stat) => sum + stat.revenue, 0);
      return {
        id: key,
        label: regions[key].label,
        value: sold,
        valueText: String(sold),
        tooltipValue: `${sold} đã bán`,
        details: [`${own.length} sản phẩm`, `Doanh thu ${formatVND(revenue)}`],
        dotClass: regions[key].dotClass,
      };
    })
    .sort((a, b) => b.value - a.value);

  const kpis = [
    { label: "Doanh số", value: formatVND(summary.revenue), change: previous && changeText(summary.revenue, previous.revenue) },
    { label: "Số đơn", value: String(summary.orders), change: previous && changeText(summary.orders, previous.orders) },
    { label: "Sản phẩm đã bán", value: String(summary.items), change: previous && changeText(summary.items, previous.items) },
    { label: "Giá trị trung bình mỗi đơn", value: formatVND(summary.average), change: null },
  ];

  return (
    <div>
      {/* Bộ lọc thời gian: một hàng, trên mọi biểu đồ */}
      <div role="group" aria-label="Khoảng thời gian" className="mb-6 flex flex-wrap gap-2">
        {ranges.map((range) => (
          <button
            key={range.label}
            type="button"
            aria-pressed={rangeDays === range.days}
            onClick={() => setRangeDays(range.days)}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors duration-200 ${
              rangeDays === range.days
                ? "border-primary bg-primary-soft font-semibold text-primary"
                : "border-line bg-white text-ink-muted hover:border-primary hover:text-ink"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Số liệu chính, kèm tăng/giảm so với kỳ trước cùng độ dài */}
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cardStyle}>
            <p className="text-sm text-ink-muted">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{kpi.value}</p>
            {kpi.change ? (
              <p className={`mt-1 text-xs font-semibold ${kpi.change.up ? "text-che" : "text-sale"}`}>
                <span aria-hidden="true">{kpi.change.up ? "▲" : "▼"} </span>
                {kpi.change.up ? "Tăng" : "Giảm"} {Math.abs(kpi.change.percent)}%{" "}
                <span className="font-normal text-ink-muted">so với {rangeLabel} trước</span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-ink-muted">{rangeDays === null ? "Toàn bộ thời gian" : `Trong ${rangeLabel} qua`}</p>
            )}
          </div>
        ))}
      </div>

      <section aria-labelledby="sales-chart-title" className={`${cardStyle} mt-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="sales-chart-title" className={cardTitle}>
            Doanh số theo {series.length > 0 && series[0].label.includes("–") ? "tuần" : "ngày"}
          </h2>
          <p className="text-sm text-ink-muted">Tổng tiền các đơn không hủy · rê chuột để xem từng ngày</p>
        </div>
        <div className="mt-4">
          {summary.orders === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">Chưa có đơn hàng nào trong khoảng này.</p>
          ) : (
            <SalesLineChart points={series} />
          )}
        </div>
        {/* Cùng số liệu ở dạng bảng (cho người không xem được biểu đồ) */}
        {summary.orders > 0 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-primary">Xem dạng bảng</summary>
            <table className="mt-2 w-full max-w-md text-left">
              <thead>
                <tr className="text-ink-muted">
                  <th className="py-1 font-medium">Ngày</th>
                  <th className="py-1 text-right font-medium">Số đơn</th>
                  <th className="py-1 text-right font-medium">Doanh số</th>
                </tr>
              </thead>
              <tbody>
                {series
                  .filter((point) => point.orders > 0)
                  .map((point) => (
                    <tr key={point.key} className="border-t border-line">
                      <td className="py-1">{point.label}</td>
                      <td className="py-1 text-right tabular-nums">{point.orders}</td>
                      <td className="py-1 text-right tabular-nums">{formatVND(point.value)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </details>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="top-products-title" className={cardStyle}>
          <h2 id="top-products-title" className={cardTitle}>
            Sản phẩm bán chạy
          </h2>
          <p className="mb-3 mt-1 text-sm text-ink-muted">Số lượng đã bán, không tính đơn hủy</p>
          <RankedBars items={topBars} label="Sản phẩm bán chạy" empty="Chưa có lượt mua nào trong khoảng này." />
        </section>
        <section aria-labelledby="regions-chart-title" className={cardStyle}>
          <h2 id="regions-chart-title" className={cardTitle}>
            Đã bán theo miền
          </h2>
          <p className="mb-3 mt-1 text-sm text-ink-muted">Tổng số lượng đã bán của mỗi miền</p>
          <RankedBars items={regionBars} label="Đã bán theo miền" empty="Chưa có lượt mua nào trong khoảng này." />
        </section>
      </div>

      <h2 className="mb-2 mt-10 font-display text-xl font-semibold text-ink">Chi tiết theo sản phẩm</h2>
      <p className="mb-4 max-w-[52rem] text-sm text-ink-muted">
        <strong className="font-semibold text-ink">Đã bán</strong> và <strong className="font-semibold text-ink">Số đơn</strong> tính
        mọi đơn trừ đơn đã hủy. <strong className="font-semibold text-ink">Doanh thu</strong> là tiền hàng (giá lúc mua × số lượng)
        trong các đơn đã hoàn thành, chưa trừ giảm giá và chưa cộng phí vận chuyển, nên có thể khác ô doanh thu ở trang Tổng quan.{" "}
        <strong className="font-semibold text-ink">Lượt xem</strong> đếm trên trình duyệt này, cho toàn bộ thời gian (lượt xem chưa lưu
        ngày, nên không theo bộ lọc; cần backend để đếm chung mọi khách).
      </p>

      <div className={tableWrap}>
        <table className={`${table} min-w-[760px]`}>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = column.key === sortKey;
                return (
                  <th
                    key={column.key}
                    aria-sort={active ? (descending ? "descending" : "ascending") : "none"}
                    className={`${th} ${column.numeric ? "text-right" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => sortBy(column.key)}
                      className={`inline-flex items-center gap-1 font-semibold hover:text-primary ${column.numeric ? "flex-row-reverse" : ""}`}
                    >
                      {column.label}
                      <span aria-hidden="true" className={active ? "text-primary" : "text-line"}>
                        {active && !descending ? "▲" : "▼"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`${td} py-10 text-center text-ink-muted`}>
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              sorted.map((stat) => (
                <tr key={stat.product.id} className="group">
                  <td className={td}>
                    <Link href={`/admin/san-pham/${stat.product.id}/sua`} className="font-medium hover:text-primary hover:underline">
                      {stat.product.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right`}>
                    {/* Thanh nhỏ: so sánh lượt mua giữa các sản phẩm */}
                    <span className="flex items-center justify-end gap-2">
                      <span className="hidden h-2 w-24 overflow-hidden rounded-full bg-surface sm:block" aria-hidden="true">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${(stat.sold / maxSold) * 100}%` }} />
                      </span>
                      <span className="w-10 font-semibold tabular-nums">{stat.sold}</span>
                    </span>
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{stat.orderCount}</td>
                  <td className={`${td} whitespace-nowrap text-right tabular-nums`}>{formatVND(stat.revenue)}</td>
                  <td className={`${td} text-right tabular-nums`}>{stat.views}</td>
                  <td className={`${td} text-right tabular-nums ${stat.product.stock <= 0 ? "font-semibold text-sale" : ""}`}>
                    {stat.product.stock <= 0 ? "Hết" : stat.product.stock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr>
                <td className={`${td} border-t border-line font-semibold`}>Tổng cộng</td>
                <td className={`${td} border-t border-line text-right font-semibold tabular-nums`}>{totals.sold}</td>
                <td className={`${td} border-t border-line`} />
                <td className={`${td} whitespace-nowrap border-t border-line text-right font-semibold tabular-nums`}>
                  {formatVND(totals.revenue)}
                </td>
                <td className={`${td} border-t border-line text-right font-semibold tabular-nums`}>{totals.views}</td>
                <td className={`${td} border-t border-line`} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
