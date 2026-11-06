"use client";

import { useEffect, useState } from "react";
import ProductMiniCard from "@/components/product/ProductMiniCard";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import type { Product } from "@/types";

const MAX_SAVED = 8; // số sản phẩm được nhớ
const MAX_SHOWN = 4; // số sản phẩm hiển thị

// Id các sản phẩm đã xem trước đó, không tính sản phẩm đang mở (nếu có)
function readPreviousIds(currentId?: string) {
  const saved = readJSON<unknown>(STORAGE_KEYS.recentlyViewed);
  return Array.isArray(saved)
    ? saved.filter((item): item is string => typeof item === "string" && item !== currentId)
    : [];
}

// Sidebar trang chi tiết: các sản phẩm vừa xem trước đó (không tính sản phẩm đang mở).
// Danh sách id nằm trong localStorage của trình duyệt này, mới nhất đứng đầu.
// Chỉ được dùng sau khi dữ liệu đã sẵn sàng (chỉ chạy ở trình duyệt), và cần `key` là id sản phẩm
// để mỗi sản phẩm mở ra đọc lại danh sách. Không có `currentId` (trang chủ) thì chỉ hiển thị, không ghi.
export default function RecentlyViewed({ currentId, products }: { currentId?: string; products: Product[] }) {
  const [ids] = useState(() => readPreviousIds(currentId));

  // Ghi nhớ sản phẩm đang xem cho lần sau
  useEffect(() => {
    if (!currentId) return; // trang chủ: chỉ hiển thị
    writeJSON(STORAGE_KEYS.recentlyViewed, [currentId, ...readPreviousIds(currentId)].slice(0, MAX_SAVED));
  }, [currentId]);

  // Sản phẩm Admin đã xóa thì bỏ qua
  const viewed = ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined)
    .slice(0, MAX_SHOWN);

  if (viewed.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="rounded-lg border border-line bg-white p-5">
      <h2 id="recent-title" className="font-display text-2xl font-bold leading-none text-ink">
        Đã xem gần đây
      </h2>
      <ul className="mt-3 divide-y divide-line">
        {viewed.map((item) => (
          <li key={item.id}>
            <ProductMiniCard product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
