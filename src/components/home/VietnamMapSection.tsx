"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { productProvince } from "@/lib/products";
import { regionKeys, regions } from "@/lib/regions";
import { buildRoute, formatLatitude } from "@/lib/route";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  islandGroups,
  outlinePath,
  provinceDot,
  regionBands,
  regionBoundaries,
  toMapX,
  toMapY,
} from "@/lib/vietnamMap";
import type { Region } from "@/types";

// Màu tô từng miền trên bản đồ (class viết đủ để Tailwind nhận ra): xanh lá, nâu đất, vàng — nhạt hơn màu chữ
// để bản đồ nhẹ mắt, nhưng vẫn khác hẳn nhau
const fillClass: Record<Region, string> = { bac: "fill-che", trung: "fill-brown", nam: "fill-gold" };
const fillOpacity: Record<Region, number> = { bac: 0.75, trung: 0.72, nam: 0.85 };
const strokeClass: Record<Region, string> = { bac: "stroke-che", trung: "stroke-brown", nam: "stroke-gold-ink" };

// Bản đồ ba miền của trang /ban-do. Bấm một miền: mở danh sách miền đó; bấm một chấm: mở danh sách tỉnh đó.
// Bên cạnh là danh sách các tỉnh xếp từ Bắc vào Nam theo vĩ độ (xem src/lib/route.ts).
// Số sản phẩm đếm từ dữ liệu trong localStorage, nên Admin thêm sản phẩm là bản đồ tự cập nhật.
export default function VietnamMapSection() {
  const { isReady, products } = useStore();
  const [hovered, setHovered] = useState<Region | null>(null);

  const regionCounts: Record<Region, number> = { bac: 0, trung: 0, nam: 0 };
  const provinceCounts = new Map<string, number>();
  for (const product of products) {
    regionCounts[product.region] += 1;
    const province = productProvince(product);
    provinceCounts.set(province, (provinceCounts.get(province) ?? 0) + 1);
  }
  // Tỉnh chưa biết vị trí thì không có chấm
  const dots = Array.from(provinceCounts, ([name, count]) => ({ name, count, position: provinceDot(name) })).filter(
    (province): province is { name: string; count: number; position: { x: number; y: number } } => province.position !== null
  );

  const stops = buildRoute(products);

  return (
    <section aria-label="Bản đồ đặc sản ba miền" className="rounded-lg bg-surface p-5 md:p-8">
      {!isReady ? (
        <div aria-hidden="true" className="h-[560px] animate-pulse rounded-md bg-white" />
      ) : (
        <div className="grid items-start gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="group"
            aria-label="Bản đồ Việt Nam chia thành ba miền"
            // Bản đồ cao để dễ chạm vào từng chấm tỉnh
            className="mx-auto h-[440px] w-auto max-w-full shrink-0 md:h-[560px]"
          >
            <defs>
              <clipPath id="vn-map-clip">
                <path d={outlinePath} />
              </clipPath>
            </defs>

            <g clipPath="url(#vn-map-clip)">
              {regionKeys.map((key) => (
                <Link
                  key={key}
                  href={`/san-pham?region=${key}`}
                  aria-label={`${regions[key].label}, ${regionCounts[key]} sản phẩm`}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(key)}
                  onBlur={() => setHovered(null)}
                >
                  <rect
                    x={0}
                    y={regionBands[key].top}
                    width={MAP_WIDTH}
                    height={regionBands[key].height}
                    className={`${fillClass[key]} transition-opacity duration-200`}
                    fillOpacity={hovered === null || hovered === key ? fillOpacity[key] : 0.2}
                  />
                </Link>
              ))}
              {/* Đường ngăn giữa các miền */}
              {regionBoundaries.map((y) => (
                <line key={y} x1={0} x2={MAP_WIDTH} y1={y} y2={y} stroke="white" strokeWidth={1.5} strokeDasharray="4 3" pointerEvents="none" />
              ))}
            </g>
            <path d={outlinePath} fill="none" className="stroke-ink/50" strokeWidth={1} strokeLinejoin="round" pointerEvents="none" />

            {/* Hoàng Sa và Trường Sa: Miền Trung, nên cùng màu với Miền Trung và cũng mở danh sách Miền Trung */}
            {islandGroups.map((group) => (
              <Link
                key={group.name}
                href={`/san-pham?region=${group.region}`}
                aria-label={`${group.name}, ${regions[group.region].label}`}
                onMouseEnter={() => setHovered(group.region)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(group.region)}
                onBlur={() => setHovered(null)}
              >
                <title>{group.name} (Việt Nam)</title>
                {/* vòng trong suốt để dễ bấm trúng cả cụm đảo nhỏ */}
                <circle
                  cx={toMapX(group.islands.reduce((sum, [lon]) => sum + lon, 0) / group.islands.length)}
                  cy={toMapY(group.islands.reduce((sum, [, lat]) => sum + lat, 0) / group.islands.length)}
                  r={group.name.includes("Trường") ? 30 : 20}
                  fill="transparent"
                />
                {group.islands.map(([lon, lat]) => (
                  <circle
                    key={`${lon}-${lat}`}
                    cx={toMapX(lon)}
                    cy={toMapY(lat)}
                    r={2.2}
                    className={`${fillClass[group.region]} ${strokeClass[group.region]} transition-opacity duration-200`}
                    fillOpacity={hovered === null || hovered === group.region ? 0.9 : 0.3}
                    strokeWidth={0.8}
                  />
                ))}
                <text
                  x={toMapX(group.labelAt[0])}
                  y={toMapY(group.labelAt[1])}
                  fontSize={13}
                  fontWeight={600}
                  className="fill-ink"
                >
                  {group.label}
                </text>
              </Link>
            ))}

            {dots.map((dot, index) => (
              <Link
                key={dot.name}
                href={`/san-pham?province=${encodeURIComponent(dot.name)}`}
                // <title> bên dưới chỉ là chú thích khi rê chuột; tên của liên kết cho trình đọc màn hình đặt ở đây
                aria-label={`${dot.name}, ${dot.count} sản phẩm`}
              >
                {/* Vòng sóng loang ra từ chấm tỉnh, như tín hiệu; mỗi chấm lệch nhịp một chút để không nháy cùng lúc */}
                <circle
                  aria-hidden="true"
                  cx={dot.position.x}
                  cy={dot.position.y}
                  r={3}
                  // Viền đậm + lõi trắng mờ: thấy rõ trên cả ba màu miền lẫn nền sáng ngoài bản đồ
                  className="pointer-events-none animate-map-ping fill-white/40 stroke-ink [transform-box:fill-box] [transform-origin:center]"
                  strokeWidth={1.2}
                  style={{ animationDelay: `${(index * 0.37) % 2.4}s` }}
                />
                {/* Vùng chạm vô hình quanh chấm, để bấm bằng ngón tay dễ hơn (chấm thật chỉ vài px) */}
                <circle aria-hidden="true" cx={dot.position.x} cy={dot.position.y} r={7} className="fill-transparent" />
                <circle cx={dot.position.x} cy={dot.position.y} r={3 + Math.min(dot.count, 5) * 0.5} className="fill-white stroke-ink" strokeWidth={1}>
                  <title>{`${dot.name} (${dot.count} sản phẩm)`}</title>
                </circle>
              </Link>
            ))}
          </svg>

          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-ink">Ba miền</h2>
            <ul className="mt-2 w-full divide-y divide-line">
              {regionKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={`/san-pham?region=${key}`}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(key)}
                    onBlur={() => setHovered(null)}
                    className="flex min-h-11 items-center gap-3 px-1 transition-colors duration-200 hover:text-primary"
                  >
                    <span className={`h-3 w-3 shrink-0 rounded-full ${regions[key].dotClass}`} aria-hidden="true" />
                    <span className="font-semibold text-ink">{regions[key].label}</span>
                    <span className="ml-auto whitespace-nowrap text-sm text-ink-muted">{regionCounts[key]} sản phẩm</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Các tỉnh từ Bắc vào Nam, mỗi tỉnh một dòng: tên, các món, vĩ độ */}
            <h2 className="mt-8 font-display text-2xl font-bold text-ink">Các tỉnh, từ Bắc vào Nam</h2>
            <ul className="mt-2 w-full divide-y divide-line">
              {stops.map((stop) => (
                <li key={stop.province}>
                  <Link
                    href={`/san-pham?province=${encodeURIComponent(stop.province)}`}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3 transition-colors duration-200 hover:text-primary"
                  >
                    <span className={`h-2.5 w-2.5 self-center rounded-full ${regions[stop.region].dotClass}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="font-semibold text-ink">{stop.province}</span>
                      <span className="block text-sm text-ink-muted">{stop.products.map((product) => product.name).join(" · ")}</span>
                    </span>
                    {stop.latitude !== undefined && (
                      <span className="whitespace-nowrap text-sm tabular-nums text-ink-muted">
                        <span className="sr-only">Vĩ độ </span>
                        {formatLatitude(stop.latitude)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
