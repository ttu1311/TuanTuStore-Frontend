import type { Region } from "@/types";

// Display label and colours for each region.
// Used by RegionBadge, the homepage route, the header menu, the product filters, the product detail page
// and the Admin product form. dotClass fills the region dot, textClass colours the region name.
export const regions: Record<Region, { label: string; dotClass: string; textClass: string }> = {
  bac: { label: "Miền Bắc", dotClass: "bg-che", textClass: "text-che" },
  trung: { label: "Miền Trung", dotClass: "bg-brown", textClass: "text-brown" },
  nam: { label: "Miền Nam", dotClass: "bg-gold", textClass: "text-gold-ink" },
};

export const regionKeys = Object.keys(regions) as Region[];

export function isRegion(value: string): value is Region {
  return value in regions;
}
