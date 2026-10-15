"use client";

import AdminUserRow from "@/components/admin/AdminUserRow";
import { table, tableWrap, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";

// All accounts created by the registration page (plus the demo Admin), oldest first
export default function AdminUserTable() {
  const { users, currentUser } = useStore();
  const sorted = [...users].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className={tableWrap}>
      <table className={`${table} min-w-[880px]`}>
        <thead>
          <tr>
            <th className={th}>Họ tên</th>
            <th className={th}>Email</th>
            <th className={th}>Số điện thoại</th>
            <th className={th}>Vai trò</th>
            <th className={th}>Ngày tạo</th>
            <th className={th}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((user) => (
            <AdminUserRow key={user.id} user={user} isSelf={user.id === currentUser?.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
