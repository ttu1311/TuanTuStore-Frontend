"use client";

import { useState } from "react";
import { actionDanger, actionEdit, table, tableWrap, td, th } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";
import { callTimeLabel, topicLabel } from "@/lib/contact";
import { formatDate } from "@/lib/format";

type Filter = "new" | "done" | "all";

// Yêu cầu "gọi lại cho tôi" gửi từ trang /lien-he. Chưa xử lý lên trước, rồi mới nhất lên đầu.
export default function AdminContactTable() {
  const { contactRequests, setContactRequestDone, deleteContactRequest } = useStore();
  const [filter, setFilter] = useState<Filter>("new");
  const [error, setError] = useState("");

  const newCount = contactRequests.filter((request) => !request.done).length;
  const filters: { id: Filter; label: string }[] = [
    { id: "new", label: `Chưa gọi (${newCount})` },
    { id: "done", label: `Đã gọi (${contactRequests.length - newCount})` },
    { id: "all", label: `Tất cả (${contactRequests.length})` },
  ];
  const shown = contactRequests
    .filter((request) => (filter === "all" ? true : filter === "done" ? request.done : !request.done))
    .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt.localeCompare(a.createdAt));

  function toggleDone(id: string, done: boolean) {
    const result = setContactRequestDone(id, done);
    setError(result.ok ? "" : result.message);
  }

  function remove(id: string, name: string) {
    if (!window.confirm(`Xóa yêu cầu của "${name}"? Thao tác này không thể hoàn tác.`)) return;
    const result = deleteContactRequest(id);
    setError(result.ok ? "" : result.message);
  }

  return (
    <div>
      <div role="group" aria-label="Lọc yêu cầu" className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors duration-200 ${
              filter === item.id
                ? "border-primary bg-primary-soft font-semibold text-primary"
                : "border-line text-ink-muted hover:border-primary hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-sale">
          {error}
        </p>
      )}

      <div className={tableWrap}>
        <table className={`${table} min-w-[860px]`}>
          <thead>
            <tr>
              <th className={th}>Ngày gửi</th>
              <th className={th}>Khách hàng</th>
              <th className={th}>Chủ đề</th>
              <th className={th}>Gọi lúc</th>
              <th className={th}>Nội dung</th>
              <th className={th}>Trạng thái</th>
              <th className={th}>
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${td} py-10 text-center text-ink-muted`}>
                  {filter === "new" ? "Không có yêu cầu nào đang chờ gọi lại." : "Chưa có yêu cầu nào."}
                </td>
              </tr>
            ) : (
              shown.map((request) => (
                <tr key={request.id} className="group">
                  <td className={`${td} whitespace-nowrap`}>{formatDate(request.createdAt)}</td>
                  <td className={td}>
                    <p className="font-medium">{request.name}</p>
                    <a href={`tel:${request.phone}`} className="text-primary underline underline-offset-4">
                      {request.phone}
                    </a>
                    {request.email && <p className="break-all text-ink-muted">{request.email}</p>}
                  </td>
                  <td className={td}>{topicLabel(request.topic)}</td>
                  <td className={td}>{callTimeLabel(request.callTime)}</td>
                  <td className={`${td} max-w-[260px] whitespace-pre-line break-words text-ink-muted`}>
                    {request.message || "—"}
                  </td>
                  <td className={td}>
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                        request.done ? "bg-surface text-ink-muted" : "bg-gold-soft text-gold-ink"
                      }`}
                    >
                      {request.done ? "Đã gọi" : "Chưa gọi"}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDone(request.id, !request.done)}
                        className={`${actionEdit} whitespace-nowrap`}
                      >
                        {request.done ? "Đánh dấu chưa gọi" : "Đã gọi xong"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(request.id, request.name)}
                        aria-label={`Xóa yêu cầu của ${request.name}`}
                        className={actionDanger}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
