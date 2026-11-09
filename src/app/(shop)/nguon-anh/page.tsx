import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Nguồn ảnh — Đặc sản 3 Miền",
  description: "Tác giả và giấy phép của các ảnh sản phẩm trên Đặc sản 3 Miền.",
};

// Ảnh dùng giấy phép CC BY-SA phải ghi tên tác giả, giấy phép và đường dẫn tới ảnh gốc.
// Giữ danh sách này giống mục Credits trong README.md.
const credits = [
  {
    product: "Cua biển Năm Căn",
    title: "Cua Cà Mau bán trên đường NS, ng30th7n2023 (3)",
    author: "Phương Huy",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Cua_C%C3%A0_Mau_b%C3%A1n_tr%C3%AAn_%C4%91%C6%B0%E1%BB%9Dng_NS,_ng30th7n2023_(3).jpg",
  },
  {
    product: "Tôm khô Rạch Gốc",
    title: "Đặc sản Tôm khô Cà Mau",
    author: "Dongson.vmvn",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:%C4%90%E1%BA%B7c_s%E1%BA%A3n_T%C3%B4m_kh%C3%B4_C%C3%A0_Mau.jpg",
  },
  {
    product: "Ba khía muối Rạch Gốc",
    title: "Ba khía muối",
    author: "Baoothersks",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Ba_kh%C3%ADa_mu%E1%BB%91i.jpg",
  },
  {
    product: "Khô cá bổi Cà Mau",
    title: "Khô cá sặc rằn",
    author: "Bùi Thụy Đào Nguyên",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:Kh%C3%B4_c%C3%A1_s%E1%BA%B7c_r%E1%BA%B1n.jpg",
  },
  {
    product: "Mật ong rừng U Minh Hạ (ảnh minh họa)",
    title: "Honey Bottle",
    author: "JJ Harrison",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:Honey_Bottle.jpg",
  },
  {
    product: "Kẹo dừa",
    title: "Ben Tre Cocoa-coconut candy (1)",
    author: "Fumikas Sagisavas",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Ben_Tre_Cocoa-coconut_candy_(1).jpg",
  },
];

export default function PhotoCreditsPage() {
  return (
    <PageContainer>
      <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-title">Nguồn ảnh</h1>
      <p className="mt-3 max-w-[640px] text-ink-muted">
        Ảnh sản phẩm lấy từ Wikimedia Commons. Các ảnh dưới đây đã được cắt và thu nhỏ; bản gốc, tác giả và giấy phép xem ở
        đường dẫn của từng ảnh.
      </p>

      <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
        {credits.map((credit) => (
          <li key={credit.url} className="px-6 py-4">
            <p className="font-semibold text-ink">{credit.product}</p>
            <p className="mt-1 break-words text-sm text-ink-muted">
              “{credit.title}” — {credit.author}, {credit.license} —{" "}
              <a href={credit.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                xem ảnh gốc
              </a>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-[640px] text-sm text-ink-muted">
        Các ảnh sản phẩm khác cũng lấy từ Wikimedia Commons, nhưng tác giả của chúng chưa được ghi lại trong dự án này.
      </p>
    </PageContainer>
  );
}
