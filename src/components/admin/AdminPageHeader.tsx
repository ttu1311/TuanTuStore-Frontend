import type { ReactNode } from "react";

// Tiêu đề trang + nút hành động tùy chọn ở bên phải
export default function AdminPageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      {children}
    </div>
  );
}
