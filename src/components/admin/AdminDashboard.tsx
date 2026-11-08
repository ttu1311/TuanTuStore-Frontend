"use client";

import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { LOW_STOCK } from "@/lib/cart";
import { formatDate, formatVND } from "@/lib/format";
import { adminOrderStatuses, orderStatusLabels, paymentStatusOf } from "@/lib/orders";
import { lowStockProducts, ordersByStatus, productStats } from "@/lib/stats";
import type { OrderStatus } from "@/types";

// Màu thanh của từng trạng thái (cùng tông với huy hiệu trạng thái)
const barClass: Record<OrderStatus, string> = {
  PENDING: "bg-gold",
  CONFIRMED: "bg-ink-muted/50",
  SHIPPING: "bg-brown",
  COMPLETED: "bg-che",
  CANCELLED: "bg-sale",
};

const cardTitle = "font-display text-xl font-semibold text-ink";
const linkStyle = "text-sm font-semibold text-primary underline-offset-4 hover:underline";

// "Tổng quan": mọi con số đều được đếm từ dữ liệu trong localStorage
export default function AdminDashboard() {
  const { products, orders, users, contactRequests, productViews } = useStore();

  const completed = orders.filter((order) => order.status === "COMPLETED");
  // Doanh thu = tổng của các đơn đã HOÀN THÀNH (COMPLETED)
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
  const cancelled = orders.filter((order) => order.status === "CANCELLED").length;
  // Đơn chuyển khoản chưa nhận tiền (đơn đã hủy thì thôi)
  const unpaid = orders.filter((order) => order.status !== "CANCELLED" && paymentStatusOf(order) === "UNPAID");
  const waitingCalls = contactRequests.filter((request) => !request.done).length;
  const soldOut = products.filter((product) => product.stock <= 0).length;

  const byStatus = ordersByStatus(orders);
  const maxStatus = Math.max(1, ...Object.values(byStatus));
  const lowStock = lowStockProducts(products);
  const topSellers = productStats(products, orders, productViews)
    .filter((stat) => stat.sold > 0)
    .sort((a, b) => b.sold - a.sold || b.revenue - a.revenue)
    .slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const stats: { label: string; value: string; note?: string; href?: string; alert?: boolean }[] = [
    { label: "Tổng đơn hàng", value: String(orders.length), note: cancelled > 0 ? `${cancelled} đơn đã hủy` : undefined, href: "/admin/don-hang" },
    { label: "Doanh thu (đơn hoàn thành)", value: formatVND(revenue), note: `${completed.length} đơn hoàn thành` },
    { label: "Giá trị trung bình mỗi đơn", value: formatVND(averageOrder), note: "Tính trên đơn hoàn thành" },
    {
      label: "Chờ thanh toán (chuyển khoản)",
      value: String(unpaid.length),
      note: unpaid.length > 0 ? formatVND(unpaid.reduce((sum, order) => sum + order.total, 0)) : undefined,
      href: "/admin/don-hang",
      alert: unpaid.length > 0,
    },
    { label: "Tổng sản phẩm", value: String(products.length), note: soldOut > 0 ? `${soldOut} sản phẩm hết hàng` : undefined, href: "/admin/san-pham" },
    { label: "Sắp hết hàng", value: String(lowStock.length), note: `Còn từ ${LOW_STOCK} trở xuống`, alert: lowStock.length > 0 },
    { label: "Tổng người dùng", value: String(users.length), href: "/admin/nguoi-dung" },
    { label: "Yêu cầu liên hệ chờ gọi", value: String(waitingCalls), href: "/admin/lien-he", alert: waitingCalls > 0 },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const body = (
            <>
              <p className="text-sm text-ink-muted">{stat.label}</p>
              <p className={`mt-2 text-2xl font-bold ${stat.alert ? "text-sale" : "text-primary"}`}>{stat.value}</p>
              {stat.note && <p className="mt-1 text-xs text-ink-muted">{stat.note}</p>}
            </>
          );
          const box = "block h-full rounded-xl border border-line bg-white p-5";
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={`${box} transition-colors duration-200 hover:border-primary`}>
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={box}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Đơn theo trạng thái: thanh ngang, dài theo số đơn */}
        <section aria-labelledby="by-status-title" className="rounded-xl border border-line bg-white p-5">
          <h2 id="by-status-title" className={cardTitle}>
            Đơn theo trạng thái
          </h2>
          <ul className="mt-4 space-y-3">
            {adminOrderStatuses.map((status) => (
              <li key={status} className="grid grid-cols-[8rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
                <span className="text-ink">{orderStatusLabels[status]}</span>
                <span className="h-3 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                  <span className={`block h-full rounded-full ${barClass[status]}`} style={{ width: `${(byStatus[status] / maxStatus) * 100}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums text-ink">{byStatus[status]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sản phẩm sắp hết hàng: cần nhập thêm */}
        <section aria-labelledby="low-stock-title" className="rounded-xl border border-line bg-white p-5">
          <h2 id="low-stock-title" className={cardTitle}>
            Sản phẩm sắp hết hàng
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Mọi sản phẩm còn hơn {LOW_STOCK} trong kho.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/san-pham/${product.id}/sua`} className="min-w-0 text-ink hover:text-primary hover:underline">
                    {product.name}
                  </Link>
                  <span className={`whitespace-nowrap font-semibold ${product.stock <= 0 ? "text-sale" : "text-gold-ink"}`}>
                    {product.stock <= 0 ? "Hết hàng" : `Còn ${product.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Bán chạy nhất: 5 món đặt nhiều nhất; bảng đầy đủ (sắp xếp được) ở trang Thống kê */}
      <section aria-labelledby="top-title" className="mt-6 rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="top-title" className={cardTitle}>
            Bán chạy nhất
          </h2>
          <Link href="/admin/thong-ke" className={linkStyle}>
            Xem thống kê theo sản phẩm →
          </Link>
        </div>
        {topSellers.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Chưa có lượt mua nào.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {topSellers.map((stat, index) => (
              <li key={stat.product.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <span className="font-semibold text-ink-muted">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{stat.product.name}</span>
                  <span className="mt-1 block h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(stat.sold / topSellers[0].sold) * 100}%` }} />
                  </span>
                </span>
                <span className="whitespace-nowrap font-semibold tabular-nums text-ink">{stat.sold} đã bán</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <h2 className="mb-4 mt-10 font-display text-xl font-semibold text-ink">Đơn hàng gần đây</h2>
      <div className={tableWrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Mã đơn</th>
              <th className={th}>Khách hàng</th>
              <th className={th}>Ngày đặt</th>
              <th className={th}>Tổng tiền</th>
              <th className={th}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${td} py-10 text-center text-ink-muted`}>
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.code} className="group">
                  <td className={`${td} font-medium`}>{order.code}</td>
                  <td className={td}>{order.customerName}</td>
                  <td className={td}>{formatDate(order.createdAt)}</td>
                  <td className={`${td} whitespace-nowrap`}>{formatVND(order.total)}</td>
                  <td className={td}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
