"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import { useStore } from "@/context/StoreContext";
import { occasions } from "@/data/occasions";

// Mỗi dịp một tông màu nhẹ, để 4 thẻ dễ phân biệt
const tones = ["bg-gold-soft", "bg-brown-soft", "bg-che-soft", "bg-primary-soft"];

// "Chọn quà theo dịp" ở trang chủ: mỗi thẻ mở danh sách sản phẩm đã lọc theo dịp đó (/san-pham?dip=...).
export default function OccasionSection() {
  const { isReady, products } = useStore();

  return (
    <section aria-labelledby="occasion-title">
      <SectionHeader
        id="occasion-title"
        title="Chọn quà theo dịp"
        description="Chưa biết tặng gì? Bắt đầu từ dịp bạn cần quà."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {occasions.map((occasion, index) => {
          const count = products.filter((product) => product.occasions?.includes(occasion.id)).length;
          return (
            <li key={occasion.id}>
              <Link
                href={`/san-pham?dip=${occasion.id}`}
                className={`group flex h-full items-center justify-between gap-4 rounded-xl p-6 transition-transform duration-200 hover:-translate-y-0.5 ${tones[index % tones.length]}`}
              >
                <span className="min-w-0">
                  <span className="block font-display text-2xl font-bold leading-tight text-ink">{occasion.label}</span>
                  <span className="mt-1 block text-ink-muted">{occasion.description}</span>
                  <span className="mt-3 block text-sm font-semibold text-ink">{isReady ? `${count} món` : " "}</span>
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon name="arrow" size={20} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
