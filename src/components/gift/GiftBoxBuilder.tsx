"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FreeShippingProgress from "@/components/cart/FreeShippingProgress";
import ContentSidebar from "@/components/layout/PageLayout";
import Icon from "@/components/ui/Icon";
import LoadingState from "@/components/ui/LoadingState";
import { btnBase, btnPrimary, btnSecondary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { occasions } from "@/data/occasions";
import { formatVND } from "@/lib/format";
import { ANY, activeCriteria, budgets, matchCriteria, suggestBox, type BoxCriteria } from "@/lib/giftBox";
import { regionKeys, regions } from "@/lib/regions";
import { soldCounts } from "@/lib/reviews";
import type { Product, Region } from "@/types";

type Choice = Record<Region, string | null>;
const noChoice: Choice = { bac: null, trung: null, nam: null };

const chipBase = "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200";

// "Hộp quà Ba Miền": khách (có thể) chọn dịp và ngân sách, hệ thống ghép sẵn MỖI MIỀN MỘT MÓN hợp nhất;
// khách đổi từng ô tùy ý rồi thêm cả hộp vào giỏ (và được chuyển sang giỏ hàng).
// Ở bước thanh toán, khách tích "Gói quà và kèm thiệp" để được gói chung một hộp và in lời nhắn (miễn phí).
// initial: dịp và ngân sách chọn sẵn từ trang chủ (?dip=…&ngan-sach=…), hoặc "bất kỳ" khi vào thẳng trang này.
export default function GiftBoxBuilder({ initial }: { initial: BoxCriteria }) {
  const router = useRouter();
  const { isReady, products, orders, productViews, addManyToCart } = useStore();
  const [criteria, setCriteria] = useState<BoxCriteria>(initial);
  const byRegion = Object.fromEntries(
    // Món hết hàng không chọn được cho hộp quà
    regionKeys.map((key) => [key, products.filter((p) => p.region === key && p.stock > 0)])
  ) as Record<Region, Product[]>;
  // null = dùng món hệ thống ghép sẵn; khách bấm chọn thì lưu lựa chọn của khách
  const [chosen, setChosen] = useState<Choice>(noChoice);

  if (!isReady) return <LoadingState text="Đang tải đặc sản…" />;

  // Món ghép sẵn theo dịp + ngân sách; đổi dịp hay ngân sách thì ghép lại từ đầu (bỏ các lựa chọn tay)
  const auto = suggestBox(products, criteria, soldCounts(orders), productViews);
  const activeCount = activeCriteria(criteria);
  const picks = regionKeys.map((key) => {
    const id = chosen[key] ?? auto[key]?.product.id ?? null;
    return { region: key, product: byRegion[key].find((p) => p.id === id) };
  });
  const complete = picks.every((pick) => pick.product);
  const total = picks.reduce((sum, pick) => sum + (pick.product?.price ?? 0), 0);

  function changeCriteria(patch: Partial<BoxCriteria>) {
    setCriteria({ ...criteria, ...patch });
    setChosen(noChoice);
  }

  function choose(region: Region, productId: string) {
    setChosen({ ...chosen, [region]: productId });
  }

  // "Gợi ý ngẫu nhiên": mỗi miền một món bất kỳ
  function surprise() {
    const random = (items: Product[]) => items[Math.floor(Math.random() * items.length)]?.id ?? null;
    setChosen({ bac: random(byRegion.bac), trung: random(byRegion.trung), nam: random(byRegion.nam) });
  }

  // Thêm cả hộp rồi chuyển thẳng sang giỏ hàng (các món được tick sẵn)
  function addBox() {
    const ids = picks.flatMap((pick) => (pick.product ? [pick.product.id] : []));
    if (addManyToCart(ids, "Đã thêm Hộp quà Ba Miền vào giỏ hàng")) router.push("/gio-hang");
  }

  // Lý do ghi dưới tên miền khi ô đang dùng món ghép sẵn (không còn đúng nếu khách đã đổi món)
  function reasonFor(region: Region) {
    const slot = auto[region];
    if (chosen[region] !== null || !slot) return null;
    if (activeCount === 0) return "Món được yêu thích nhất của miền này";
    if (!slot.exact) return "Chưa có món miền này khớp đủ lựa chọn của bạn, đây là món gần nhất";
    return ["Đúng dịp", "Đúng ngân sách"]
      .filter((_, index) => (index === 0 ? criteria.occasion !== ANY : criteria.budget !== ANY))
      .join(" · ");
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
            <Icon name="bag" size={18} />
            Thêm hộp quà và xem giỏ hàng
          </button>
          <p className="mt-4 text-sm text-ink-muted">
            Ở bước thanh toán, tích <span className="font-medium text-ink">“Gói quà và kèm thiệp”</span> để ba món được gói
            chung một hộp kèm lời nhắn của bạn, miễn phí.
          </p>
        </div>
      }
    >
      {/* Hai câu hỏi: đổi bất cứ lúc nào, hộp được ghép lại. Không chọn cũng được. */}
      <section aria-labelledby="box-criteria-title" className="mb-8 rounded-xl bg-surface p-5">
        <h2 id="box-criteria-title" className="font-display text-xl font-semibold text-ink">
          Hộp quà hợp với…
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Chọn dịp và ngân sách, mình ghép sẵn mỗi miền một món hợp nhất. Không chọn cũng được, và bạn đổi món nào cũng được.
        </p>
        <div role="group" aria-label="Dịp tặng" className="mt-4 flex flex-wrap gap-2">
          {[...occasions.map((o) => ({ id: o.id, label: o.label })), { id: ANY, label: "Dịp nào cũng được" }].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={criteria.occasion === item.id}
              onClick={() => changeCriteria({ occasion: item.id })}
              className={`${chipBase} ${criteria.occasion === item.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-white text-ink hover:border-primary"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Ngân sách cho mỗi món" className="mt-2 flex flex-wrap gap-2">
          {budgets.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={criteria.budget === item.id}
              onClick={() => changeCriteria({ budget: item.id })}
              className={`${chipBase} ${criteria.budget === item.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-white text-ink hover:border-primary"}`}
            >
              {item.id === ANY ? "Ngân sách không giới hạn" : item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted">Mỗi miền một món. Món đang chọn có viền đậm.</p>
        <button type="button" onClick={surprise} className={`${btnBase} ${btnSecondary} ${btnSmall}`}>
          Gợi ý ngẫu nhiên
        </button>
      </div>

      <div className="space-y-10">
        {picks.map(({ region, product: picked }) => (
          <fieldset key={region} className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-1 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
              <span className={`h-3 w-3 rounded-full ${regions[region].dotClass}`} aria-hidden="true" />
              {regions[region].label}
            </legend>
            {/* Vì sao món này được ghép sẵn (chỉ khi khách chưa đổi món) */}
            <p className="mb-4 min-h-5 text-sm font-medium text-che">{reasonFor(region)}</p>
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
                      {/* Món hợp với dịp và ngân sách đã chọn */}
                      {activeCount > 0 && matchCriteria(product, criteria).exact && (
                        <span className="absolute left-2 top-2 rounded-full bg-che-soft px-2.5 py-1 text-xs font-semibold text-che">
                          Hợp lựa chọn
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
