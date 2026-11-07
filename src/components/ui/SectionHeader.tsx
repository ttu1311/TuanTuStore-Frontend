import type { ReactNode } from "react";

type SectionHeaderProps = {
  id: string; // id của <h2>, dùng cho aria-labelledby
  title: string;
  description?: string;
  action?: ReactNode; // ví dụ liên kết "Xem tất cả"
};

export default function SectionHeader({ id, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-6">
      <div>
        <h2 id={id} className="font-display text-4xl/[1.1] font-bold text-ink md:text-title/[1.1]">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-[36rem] text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
