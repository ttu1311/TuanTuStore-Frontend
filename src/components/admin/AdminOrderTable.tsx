"use client";

import AdminOrderRow from "@/components/admin/AdminOrderRow";
import { table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";

// All orders created by the checkout, newest first
export default function AdminOrderTable() {
  const { orders, users } = useStore();
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // The account email of an order, or "Khách vãng lai" for a guest order
  function accountText(userId: string | null) {
    const user = users.find((u) => u.id === userId);
    return user ? user.email : "Khách vãng lai";
  }

  return (
    // [container-type:inline-size]: lets the order details use 100cqw = the visible width of this card
    <div className={`${tableWrap} [container-type:inline-size]`}>
      <table className={`${table} min-w-[760px]`}>
        <thead>
          <tr>
            <th className={th}>Mã đơn</th>
            <th className={th}>Khách hàng</th>
            <th className={th}>Ngày đặt</th>
            <th className={th}>Tổng tiền</th>
            <th className={th}>Trạng thái</th>
            <th className={th}>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className={`${td} py-10 text-center text-ink-muted`}>
                Chưa có đơn hàng nào.
              </td>
            </tr>
          ) : (
            sorted.map((order) => (
              <AdminOrderRow key={order.code} order={order} accountText={accountText(order.userId)} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
