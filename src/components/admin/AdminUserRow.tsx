"use client";

import { useState } from "react";
import { actionDanger, td } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { formatDate } from "@/lib/format";
import type { User } from "@/types";

// Một dòng của bảng tài khoản khách hàng: xem thông tin và xóa tài khoản.
// Không còn đổi vai trò: mọi tài khoản trong localStorage đều là khách hàng; quản trị viên đăng nhập riêng ở /dang-nhap-quan-tri.
export default function AdminUserRow({ user }: { user: User }) {
  const { deleteUser } = useStore();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!window.confirm(`Xóa tài khoản ${user.email}? Đơn hàng của tài khoản này vẫn được giữ lại.`)) return;
    const result = deleteUser(user.id);
    setError(result.ok ? "" : result.message);
  }

  return (
    <tr className="group">
      <td className={`${td} font-medium`}>{user.name}</td>
      <td className={`${td} break-all`}>{user.email}</td>
      <td className={`${td} whitespace-nowrap`}>{user.phone || "—"}</td>
      <td className={`${td} whitespace-nowrap`}>{formatDate(user.createdAt)}</td>
      <td className={td}>
        <button type="button" onClick={handleDelete} aria-label={`Xóa tài khoản ${user.email}`} className={actionDanger}>
          Xóa
        </button>
        {error && (
          <p role="alert" className="mt-1 max-w-[260px] text-xs text-sale">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
