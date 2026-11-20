"use client";

import AdminUserRow from "@/components/admin/AdminUserRow";
import { table, tableWrap, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";

// Tất cả tài khoản khách hàng (tạo từ trang đăng ký), cũ nhất lên đầu. Quản trị viên không nằm trong danh sách này.
export default function AdminUserTable() {
  const { users } = useStore();
  const sorted = [...users].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className={tableWrap}>
      <table className={`${table} min-w-[720px]`}>
        <thead>
          <tr>
            <th className={th}>Họ tên</th>
            <th className={th}>Email</th>
            <th className={th}>Số điện thoại</th>
            <th className={th}>Ngày tạo</th>
            <th className={th}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((user) => (
            <AdminUserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
