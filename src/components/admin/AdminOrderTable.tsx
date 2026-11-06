"use client";

import AdminOrderRow from "@/components/admin/AdminOrderRow";
import { table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";

// Tất cả đơn hàng tạo từ trang thanh toán, mới nhất lên đầu
export default function AdminOrderTable() {
  const { orders, users } = useStore();
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Email tài khoản của đơn hàng, hoặc "Khách vãng lai" với đơn của khách chưa đăng nhập
  function accountText(userId: string | null) {
    const user = users.find((u) => u.id === userId);
    return user ? user.email : "Khách vãng lai";
  }

  return (
    // [container-type:inline-size]: cho phần chi tiết đơn dùng 100cqw = chiều rộng đang nhìn thấy của thẻ này
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
