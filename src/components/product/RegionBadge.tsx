import { regions } from "@/lib/regions";
import type { Region } from "@/types";

// Vùng miền của sản phẩm: tên vùng, tô màu vùng
export default function RegionBadge({ region, className = "" }: { region: Region; className?: string }) {
  const { label, textClass } = regions[region];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold leading-snug ${textClass} ${className}`}
    >
      {label}
    </span>
  );
}
