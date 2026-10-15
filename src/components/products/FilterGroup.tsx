import type { ReactNode } from "react";

// A titled group of filter options inside the sidebar
export default function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 border-b border-line p-0 pb-6 pt-6 first:pt-0 last:border-b-0 last:pb-0">
      <legend className="mb-3 p-0 text-base font-semibold text-ink">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}
