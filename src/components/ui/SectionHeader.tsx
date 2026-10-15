import type { ReactNode } from "react";

type SectionHeaderProps = {
  id: string; // id of the <h2>, used by aria-labelledby
  title: string;
  description?: string;
  action?: ReactNode; // e.g. a "Xem tất cả" link
};

export default function SectionHeader({ id, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-6">
      <div>
        <h2 id={id} className="font-display text-4xl font-bold leading-[1.05] text-ink md:text-title">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-[36rem] text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
