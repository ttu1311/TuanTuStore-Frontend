"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { regions } from "@/lib/regions";
import { buildRoute, type RouteStop } from "@/lib/route";

// Dải chạy ngang dưới hero: các nơi làm ra đặc sản, từ Bắc vào Nam ("Tân Cương · Hàng Đường · … · Năm Căn").
// Bấm vào một nơi để mở sản phẩm của nơi đó. Rê chuột hoặc đưa bàn phím vào thì dải dừng lại.
// Dải gồm 2 bản giống nhau nối tiếp: chạy hết bản đầu thì quay về đầu mà không thấy chỗ nối.
// Người bật "giảm chuyển động": dải đứng yên và cuộn ngang được bằng tay.
export default function PlaceMarquee() {
  const { isReady, products } = useStore();
  const stops = buildRoute(products);

  // Giữ chỗ cùng chiều cao trong lúc đọc localStorage, để trang không bị nhảy
  if (!isReady || stops.length === 0) return <div aria-hidden="true" className="h-[68px] bg-primary" />;

  return (
    <nav
      aria-label="Nơi làm ra các đặc sản"
      className="group overflow-hidden bg-primary py-4 text-white [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto"
    >
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        // Càng nhiều nơi thì chạy càng lâu, để tốc độ luôn vừa phải
        style={{ animationDuration: `${Math.max(stops.length * 4, 24)}s` }}
      >
        <MarqueeItems stops={stops} />
        <MarqueeItems stops={stops} copy />
      </div>
    </nav>
  );
}

// Bản thứ hai (`copy`) chỉ để nối vòng: trình đọc màn hình và phím Tab bỏ qua nó
function MarqueeItems({ stops, copy = false }: { stops: RouteStop[]; copy?: boolean }) {
  return (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-center">
      {stops.map((stop) => (
        <li key={stop.product.id} className="flex items-center">
          <Link
            href={`/san-pham/${stop.product.id}`}
            tabIndex={copy ? -1 : undefined}
            className="group/item flex items-baseline gap-3 whitespace-nowrap rounded px-6 transition-colors duration-200 hover:text-gold-light"
          >
            <span className="font-display text-2xl font-semibold uppercase tracking-wide">{stop.place}</span>
            <span className="text-sm text-footer-muted transition-colors duration-200 group-hover/item:text-white">
              {stop.product.name}
            </span>
          </Link>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/60 ${regions[stop.product.region].dotClass}`}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}
