"use client";

import { useState } from "react";
import { actionDanger, actionEdit, td } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/types";

const roles: Role[] = ["USER", "ADMIN"];

const selectStyle =
  "h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted";

// A table row of the users list: change the role (USER / ADMIN) or delete the account.
// isSelf = the Admin who is logged in: their own row cannot be changed or deleted.
export default function AdminUserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const { changeUserRole, deleteUser } = useStore();
  const [selected, setSelected] = useState<Role>(user.role);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSaveRole() {
    const result = changeUserRole(user.id, selected);
    if (result.ok) {
      setMessage({ ok: true, text: "Đã cập nhật vai trò." });
    } else {
      setMessage({ ok: false, text: result.message });
      setSelected(user.role); // the change was refused: show the real role again
    }
  }

  function handleDelete() {
    if (!window.confirm(`Xóa tài khoản ${user.email}? Đơn hàng của tài khoản này vẫn được giữ lại.`)) return;
    const result = deleteUser(user.id);
    if (!result.ok) setMessage({ ok: false, text: result.message });
  }

  return (
    <tr className="group">
      <td className={`${td} font-medium`}>{user.name}</td>
      <td className={`${td} break-all`}>{user.email}</td>
      <td className={`${td} whitespace-nowrap`}>{user.phone || "—"}</td>
      <td className={td}>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.role === "ADMIN" ? "bg-brown-soft text-brown" : "bg-surface text-ink"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className={`${td} whitespace-nowrap`}>{formatDate(user.createdAt)}</td>
      <td className={td}>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`Vai trò của ${user.name}`}
            value={selected}
            disabled={isSelf}
            onChange={(event) => {
              setSelected(event.target.value as Role);
              setMessage(null);
            }}
            className={selectStyle}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveRole}
            disabled={isSelf || selected === user.role}
            className={`${actionEdit} disabled:opacity-50`}
          >
            Cập nhật
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSelf}
            aria-label={`Xóa tài khoản ${user.email}`}
            className={`${actionDanger} disabled:opacity-50`}
          >
            Xóa
          </button>
        </div>
        {isSelf && <p className="mt-1 text-xs text-ink-muted">Tài khoản đang đăng nhập</p>}
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`mt-1 max-w-[260px] text-xs ${message.ok ? "text-primary" : "text-sale"}`}
          >
            {message.text}
          </p>
        )}
      </td>
    </tr>
  );
}
