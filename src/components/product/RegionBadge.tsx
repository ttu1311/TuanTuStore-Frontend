import { regions } from "@/lib/regions";
import type { Region } from "@/types";

// Vùng miền của sản phẩm: một chấm màu vùng, rồi tên vùng
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
