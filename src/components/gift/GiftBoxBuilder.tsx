"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

// Lựa chọn của khách cho từng miền: null = chưa đụng tới (theo món tự ghép nếu đang bật), EMPTY = khách đã bỏ món khỏi ô
type Choice = Record<Region, string | null>;
const noChoice: Choice = { bac: null, trung: null, nam: null };
const EMPTY = "";

const chipBase = "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200";

// "Hộp quà Ba Miền": hộp bắt đầu TRỐNG, khách chọn từng món (mỗi miền một món). Hệ thống chỉ ghép sẵn khi khách CHỦ ĐỘNG
// yêu cầu: đến từ trang chủ với dịp / ngân sách, chọn dịp / ngân sách ở đây, hoặc bấm "Gợi ý ngẫu nhiên".
// Khách đổi hay bỏ từng ô tùy ý rồi thêm cả hộp (đủ 3 món) vào giỏ, và được chuyển sang giỏ hàng.
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
  // Có dùng món tự ghép (suggestBox) để điền các ô chưa chọn không. Chỉ khi khách yêu cầu: xem chú thích đầu file.
  const [autoFill, setAutoFill] = useState(activeCriteria(initial) > 0);

  if (!isReady) return <LoadingState text="Đang tải đặc sản…" />;

  // Món ghép sẵn theo dịp + ngân sách; đổi dịp hay ngân sách thì ghép lại từ đầu (bỏ các lựa chọn tay)
  const auto = suggestBox(products, criteria, soldCounts(orders), productViews);
  const activeCount = activeCriteria(criteria);
  const picks = regionKeys.map((key) => {
    const id = chosen[key] === EMPTY ? null : (chosen[key] ?? (autoFill ? (auto[key]?.product.id ?? null) : null));
    return { region: key, product: byRegion[key].find((p) => p.id === id) };
  });
  const count = picks.filter((pick) => pick.product).length;
  const complete = count === picks.length;
  const total = picks.reduce((sum, pick) => sum + (pick.product?.price ?? 0), 0);

  // Chọn một dịp / ngân sách cụ thể thì ghép lại từ đầu (bỏ các lựa chọn tay). Chọn lại "bất kỳ" thì KHÔNG xóa món khách đã
  // tự chọn: còn tiêu chí kia thì chỉ ghép lại các ô chưa có món; cả hai đều "bất kỳ" thì thôi tự ghép, giữ các món tự chọn.
  function changeCriteria(patch: Partial<BoxCriteria>) {
    const next = { ...criteria, ...patch };
    const specific = Object.values(patch).some((value) => value !== ANY);
    setCriteria(next);
    setAutoFill(activeCriteria(next) > 0);
    setChosen(specific ? noChoice : (Object.fromEntries(regionKeys.map((key) => [key, chosen[key] === EMPTY ? null : chosen[key]])) as Choice));
  }

  function choose(region: Region, productId: string) {
    setChosen({ ...chosen, [region]: productId });
  }

  // Bỏ món khỏi ô (kể cả món tự ghép): ô trở về trống
  function removePick(region: Region) {
    setChosen({ ...chosen, [region]: EMPTY });
  }

  // Cuộn mượt tới một phần của trang (scroll-padding của html chừa chỗ cho Header dính; dưới lg Header cao hơn
  // nên các đích cuộn có thêm scroll-mt-14)
  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }

  // "Gợi ý ngẫu nhiên": mỗi miền một món bất kỳ
  function surprise() {
    setAutoFill(true);
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
    if (!autoFill || chosen[region] !== null || !slot) return null;
    if (!slot.exact) return "Chưa có món miền này khớp đủ lựa chọn của bạn, đây là món gần nhất";
    return ["Đúng dịp", "Đúng ngân sách"]
      .filter((_, index) => (index === 0 ? criteria.occasion !== ANY : criteria.budget !== ANY))
      .join(" · ");
  }

  return (
    <>
      <ContentSidebar
        sticky
        sidebarLabel="Hộp quà của bạn"
        sidebar={
          <div id="gift-box-panel" className="scroll-mt-14 rounded-xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Hộp quà của bạn</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Đã chọn {count}/{picks.length} món
            </p>
            {/* Ba ô của hộp quà, mỗi ô một miền: trống cho tới khi khách chọn món */}
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {picks.map(({ region, product }) => (
                <li key={region} className="min-w-0 text-center">
                  {product ? (
                    <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface">
                      {/* key: đổi món thì ảnh hiện lại với hiệu ứng phóng ra */}
                      <Image
                        key={product.id}
                        src={product.image}
                        alt=""
                        width={160}
                        height={160}
                        className="block aspect-square h-auto w-full animate-pop-in object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePick(region)}
                        aria-label={`Bỏ ${product.name} khỏi hộp quà`}
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-white transition-colors duration-200 hover:bg-ink focus-visible:ring-[3px] focus-visible:ring-primary-soft"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToId(`gift-${region}`)}
                      aria-label={`Chọn món ${regions[region].label}`}
                      className="relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line bg-surface text-ink-muted transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:ring-[3px] focus-visible:ring-primary-soft"
                    >
                        <Icon name="plus" size={20} />
                      <span className="text-xs">Chọn món</span>
                    </button>
                  )}
                  <p className="mt-1.5 truncate text-xs text-ink-muted">{regions[region].label}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4">
              {picks.map(({ region, product }) => (
                <div key={region} className="flex justify-between gap-3 text-sm">
                  <dt className={`min-w-0 break-words ${product ? "text-ink" : "text-ink-muted"}`}>{product?.name ?? `Chưa có món ${regions[region].label}`}</dt>
                  <dd className="shrink-0 text-ink-muted">{product ? formatVND(product.price) : "—"}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-line pt-3">
                <dt className="font-semibold text-ink">Giá cả hộp</dt>
                <dd className="text-xl font-bold text-primary">{count === 0 ? "—" : formatVND(total)}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <FreeShippingProgress subtotal={total} />
            </div>

            {/* Riêng nút này cho chữ xuống dòng (btnBase dùng chung có whitespace-nowrap, nên cần !) để không bị cắt trên điện thoại */}
            <button
              type="button"
              onClick={addBox}
              disabled={!complete}
              className={`${btnBase} ${btnPrimary} mt-5 w-full !whitespace-normal py-3 text-center !leading-snug disabled:opacity-60`}
            >
              <Icon name="bag" size={18} className="shrink-0" />
              {complete ? "Thêm hộp quà vào giỏ" : `Chọn thêm ${picks.length - count} món`}
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
            <fieldset key={region} id={`gift-${region}`} className="m-0 min-w-0 scroll-mt-14 border-0 p-0 lg:scroll-mt-0">
              <legend className="mb-1 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
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
                          <span className="block text-balance font-semibold leading-snug text-ink">{product.name}</span>
                          <span className="mt-0.5 block text-balance text-sm text-ink-muted">
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
      <GiftBottomBar count={count} size={picks.length} total={total} onOpen={() => scrollToId("gift-box-panel")} />
    </>
  );
}

// Thanh tóm tắt dính ở đáy màn hình điện thoại / máy tính bảng: khung "Hộp quà của bạn" nằm SAU danh sách món nên khách
// không thấy ô được điền. Thanh có z-30, thấp hơn nút nhạc, nút "Lên đầu trang" (z-40) và thông báo giỏ (z-50);
// các nút đó được nâng lên trên thanh nhờ biến --bottom-bar (globals.css), bật bằng class has-gift-bar ở <html>.
function GiftBottomBar({ count, size, total, onOpen }: { count: number; size: number; total: number; onOpen: () => void }) {
  useEffect(() => {
    document.documentElement.classList.add("has-gift-bar");
    return () => document.documentElement.classList.remove("has-gift-bar");
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-sm lg:hidden">
      <button type="button" onClick={onOpen} className="flex h-14 w-full items-center justify-between gap-3 px-4 text-sm">
        <span className="text-ink">
          Hộp quà <span className="font-semibold">{count}/{size}</span>
          <span className="text-ink-muted"> · {count === 0 ? "—" : formatVND(total)}</span>
        </span>
        <span className="font-semibold text-primary">Xem hộp ↓</span>
      </button>
    </div>
  );
}
