"use client";

import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatVND } from "@/lib/format";

// "Tổng quan": every number is counted from the data in localStorage
export default function AdminDashboard() {
  const { products, orders, users } = useStore();

  // Revenue = the total of the orders that are COMPLETED
  const revenue = orders
    .filter((order) => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const stats = [
    { label: "Tổng sản phẩm", value: String(products.length) },
    { label: "Tổng đơn hàng", value: String(orders.length) },
    { label: "Tổng người dùng", value: String(users.length) },
    { label: "Doanh thu (đơn hoàn thành)", value: formatVND(revenue) },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-white p-5">
            <p className="text-sm text-ink-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

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
