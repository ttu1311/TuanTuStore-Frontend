import { regions } from "@/lib/regions";
import type { Region } from "@/types";

// The region of a product: a dot in the region colour, then its name
export default function RegionBadge({ region, className = "" }: { region: Region; className?: string }) {
  const { label, dotClass, textClass } = regions[region];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold leading-snug ${textClass} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}
