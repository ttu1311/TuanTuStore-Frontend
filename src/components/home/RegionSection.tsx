import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { regions } from "@/lib/regions";
import type { Region } from "@/types";

const regionCards: {
  region: Region;
  taste: string;
  description: string;
  image: string;
  width: number;
  height: number;
  alt: string;
}[] = [
  {
    region: "bac",
    taste: "Thanh và tinh tế",
    description: "Chè Thái Nguyên, ô mai Hàng Đường, bánh cốm Hà Nội.",
    image: "/images/region-bac.jpg",
    width: 1280,
    height: 720,
    alt: "Đồi chè xanh mướt ở Thái Nguyên",
  },
  {
    region: "trung",
    taste: "Đậm đà và mộc mạc",
    description: "Bánh khô mè Đà Nẵng, cà phê Buôn Ma Thuột.",
    image: "/images/region-trung.jpg",
    width: 1280,
    height: 720,
    alt: "Thuyền gỗ trên sông Thu Bồn, phố cổ Hội An",
  },
  {
    region: "nam",
    taste: "Ngọt ngào và phóng khoáng",
    description: "Kẹo dừa Bến Tre, bánh pía Sóc Trăng, nước mắm Phú Quốc.",
    image: "/images/region-nam.jpg",
    width: 1280,
    height: 853,
    alt: "Thuyền chở dưa hấu ở chợ nổi Cần Thơ, đồng bằng sông Cửu Long",
  },
];

export default function RegionSection() {
  return (
    <section id="ba-mien" aria-labelledby="regions-title" className="bg-surface py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <SectionHeader
          id="regions-title"
          title="Ba miền, ba khẩu vị"
          description="Mỗi vùng đất một hương vị riêng. Chọn miền bạn muốn mua quà."
        />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {regionCards.map((card) => {
            const region = regions[card.region];
            return (
              <article key={card.region} id={`mien-${card.region}`} className="flex flex-col">
                {/* The same colour as this region's part of the route at the top of the page */}
                <span className={`mb-5 block h-1 w-full rounded-full ${region.dotClass}`} aria-hidden="true" />
                <h3 className="font-display text-4xl font-bold leading-none text-ink">{region.label}</h3>
                <p className={`mt-2 font-semibold ${region.textClass}`}>{card.taste}</p>
                <Image
                  src={card.image}
                  width={card.width}
                  height={card.height}
                  alt={card.alt}
                  sizes="(min-width: 1280px) 395px, (min-width: 768px) 31vw, 100vw"
                  className="mt-5 block aspect-[4/3] h-auto w-full rounded-lg object-cover"
                />
                <p className="mt-4 text-ink-muted">{card.description}</p>
                {/* Opens the product list already filtered by this region */}
                <Link
                  href={`/san-pham?region=${card.region}`}
                  className="mt-3 self-start font-semibold text-primary underline decoration-primary/30 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:decoration-primary"
                >
                  Xem đặc sản {region.label.replace("Miền", "miền")}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
