"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import FreeShippingProgress from "@/components/cart/FreeShippingProgress";
import ContentSidebar from "@/components/layout/PageLayout";
import Icon from "@/components/ui/Icon";
import LoadingState from "@/components/ui/LoadingState";
import { btnBase, btnPrimary, btnSecondary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { regionKeys, regions } from "@/lib/regions";
import type { Product, Region } from "@/types";

type Choice = Record<Region, string | null>;

// Món chọn sẵn cho mỗi miền: món bán chạy nhất (Top), rồi món nổi bật, rồi món đầu tiên
function defaultPick(items: Product[]) {
  const ranked = items.filter((p) => p.rank !== undefined).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  return (ranked[0] ?? items.find((p) => p.isFeatured) ?? items[0])?.id ?? null;
}

// "Hộp quà Ba Miền": khách chọn MỘT món của mỗi miền, rồi thêm cả hộp vào giỏ.
// Ở bước thanh toán, khách tích "Gói quà và kèm thiệp" để được gói chung một hộp và in lời nhắn (miễn phí).
export default function GiftBoxBuilder() {
  const { isReady, products, addManyToCart } = useStore();
  const byRegion = Object.fromEntries(
    // Món hết hàng không chọn được cho hộp quà
    regionKeys.map((key) => [key, products.filter((p) => p.region === key && p.stock > 0)])
  ) as Record<Region, Product[]>;
  // null = dùng món chọn sẵn; khách bấm chọn thì lưu lựa chọn của khách
  const [chosen, setChosen] = useState<Choice>({ bac: null, trung: null, nam: null });
  const [added, setAdded] = useState(false);

  if (!isReady) return <LoadingState text="Đang tải đặc sản…" />;

  const picks = regionKeys.map((key) => {
    const id = chosen[key] ?? defaultPick(byRegion[key]);
    return { region: key, product: byRegion[key].find((p) => p.id === id) };
  });
  const complete = picks.every((pick) => pick.product);
  const total = picks.reduce((sum, pick) => sum + (pick.product?.price ?? 0), 0);

  function choose(region: Region, productId: string) {
    setChosen({ ...chosen, [region]: productId });
    setAdded(false);
  }

  // "Gợi ý cho tôi": mỗi miền một món ngẫu nhiên
  function surprise() {
    const random = (items: Product[]) => items[Math.floor(Math.random() * items.length)]?.id ?? null;
    setChosen({ bac: random(byRegion.bac), trung: random(byRegion.trung), nam: random(byRegion.nam) });
    setAdded(false);
  }

  function addBox() {
    const ids = picks.flatMap((pick) => (pick.product ? [pick.product.id] : []));
    addManyToCart(ids, "Đã thêm Hộp quà Ba Miền vào giỏ hàng");
    setAdded(true);
  }

  return (
    <ContentSidebar
      sticky
      sidebarLabel="Hộp quà của bạn"
      sidebar={
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold text-ink">Hộp quà của bạn</h2>
          {/* Ba ô của hộp quà, mỗi ô một miền */}
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {picks.map(({ region, product }) => (
              <li key={region} className="min-w-0 text-center">
                <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface">
                  {product ? (
                    <Image
                      src={product.image}
                      alt=""
                      width={160}
                      height={160}
                      className="block aspect-square h-auto w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square" />
                  )}
                  <span className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${regions[region].dotClass}`} />
                </div>
                <p className="mt-1.5 truncate text-xs text-ink-muted">{regions[region].label}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4">
            {picks.map(({ region, product }) => (
              <div key={region} className="flex justify-between gap-3 text-sm">
                <dt className="min-w-0 truncate text-ink">{product?.name ?? `Chưa có món ${regions[region].label}`}</dt>
                <dd className="shrink-0 text-ink-muted">{product ? formatVND(product.price) : "—"}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-line pt-3">
              <dt className="font-semibold text-ink">Giá cả hộp</dt>
              <dd className="text-xl font-bold text-primary">{formatVND(total)}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <FreeShippingProgress subtotal={total} />
          </div>

          <button type="button" onClick={addBox} disabled={!complete} className={`${btnBase} ${btnPrimary} mt-5 w-full disabled:opacity-60`}>
            <Icon name={added ? "check" : "bag"} size={18} />
            {added ? "Đã thêm vào giỏ" : "Thêm hộp quà vào giỏ"}
          </button>
          {added && (
            <Link href="/thanh-toan" className={`${btnBase} ${btnSecondary} mt-2 w-full`}>
              Thanh toán ngay
            </Link>
          )}
          <p className="mt-4 text-sm text-ink-muted">
            Ở bước thanh toán, tích <span className="font-medium text-ink">“Gói quà và kèm thiệp”</span> để ba món được gói
            chung một hộp kèm lời nhắn của bạn, miễn phí.
          </p>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted">Chọn một món của mỗi miền. Món đang chọn có viền đậm.</p>
        <button type="button" onClick={surprise} className={`${btnBase} ${btnSecondary} ${btnSmall}`}>
          Gợi ý ngẫu nhiên
        </button>
      </div>

      <div className="space-y-10">
        {picks.map(({ region, product: picked }) => (
          <fieldset key={region} className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
              <span className={`h-3 w-3 rounded-full ${regions[region].dotClass}`} aria-hidden="true" />
              {regions[region].label}
            </legend>
            {byRegion[region].length === 0 ? (
              <p className="text-ink-muted">Miền này hiện chưa có sản phẩm.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {byRegion[region].map((product) => {
                  const isPicked = product.id === picked?.id;
                  return (
                    // Mỗi lựa chọn là một radio (bàn phím: Tab vào nhóm, phím mũi tên để đổi món)
                    <label
                      key={product.id}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition-colors duration-200 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary-soft ${
                        isPicked ? "border-primary" : "border-line hover:border-ink-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`gift-${region}`}
                        value={product.id}
                        checked={isPicked}
                        onChange={() => choose(region, product.id)}
                        className="sr-only"
                      />
                      <Image
                        src={product.image}
                        alt=""
                        width={320}
                        height={320}
                        sizes="(min-width: 640px) 200px, 45vw"
                        className="block aspect-square h-auto w-full object-cover"
                      />
                      {isPicked && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                          <Icon name="check" size={16} />
                        </span>
                      )}
                      <span className="block p-3">
                        <span className="block font-semibold leading-snug text-ink">{product.name}</span>
                        <span className="mt-0.5 block text-sm text-ink-muted">
                          {formatVND(product.price)} · {product.pack}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        ))}
      </div>
    </ContentSidebar>
  );
}
