"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { formatVND } from "@/lib/format";
import { getBestSellers } from "@/lib/products";
import { regionKeys, regions } from "@/lib/regions";
import { soldCounts } from "@/lib/reviews";
import { addRecentSearch, searchProducts, splitMatch } from "@/lib/search";
import { readJSON, STORAGE_KEYS, writeJSON } from "@/lib/storage";
import type { Product } from "@/types";

const SUGGESTION_LIMIT = 6;
const BEST_SELLER_SHOWN = 3;
const LIST_ID = "header-search-list";
const PRODUCTS_PATH = "/san-pham";
const MAX_LENGTH = 100;

const formClass = "relative order-3 mx-auto w-full basis-full lg:order-none lg:max-w-[560px] lg:flex-1 lg:basis-0";
const inputClass =
  "h-12 w-full rounded-md border border-line bg-white pl-12 text-ink transition-colors duration-200 placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft [&::-webkit-search-cancel-button]:hidden";

// Một dòng trong bảng gợi ý. Mọi dòng đều có địa chỉ (href), nên bấm giữa hoặc Ctrl+bấm vẫn mở tab mới.
type Option =
  | { kind: "product"; id: string; href: string; product: Product }
  | { kind: "recent"; id: string; href: string; term: string }
  | { kind: "region"; id: string; href: string; label: string }
  | { kind: "all"; id: string; href: string; label: string }; // "Xem tất cả n kết quả…" / "Xem tất cả sản phẩm"

function readRecent(): string[] {
  const stored = readJSON<unknown>(STORAGE_KEYS.recentSearches);
  return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
}

// Ô tìm kiếm ở header (dùng ở mọi trang cửa hàng). Cần useSearchParams, nên bọc Suspense; trong lúc chờ (và khi chưa có
// JavaScript) vẫn là một ô nhập bình thường gửi tới /san-pham?q=…
export default function HeaderSearch() {
  return (
    <Suspense fallback={<StaticSearch />}>
      <SearchBox />
    </Suspense>
  );
}

function StaticSearch() {
  return (
    <Form role="search" action={PRODUCTS_PATH} className={formClass}>
      <label htmlFor="search-input" className="sr-only">
        Tìm kiếm đặc sản
      </label>
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        id="search-input"
        name="q"
        type="search"
        maxLength={MAX_LENGTH}
        placeholder="Tìm chè, ô mai, nước mắm…"
        autoComplete="off"
        className={`${inputClass} pr-12`}
      />
    </Form>
  );
}

function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isReady, products, orders, productViews } = useStore();

  const onProductsPage = pathname === PRODUCTS_PATH;
  // Đang ở /san-pham?q=… thì ô hiện sẵn từ khóa đó, và đổi theo địa chỉ (bỏ chip từ khóa, bấm Back…)
  const urlTerm = onProductsPage ? (searchParams.get("q") ?? "") : "";
  const [syncedTerm, setSyncedTerm] = useState(urlTerm);
  const [value, setValue] = useState(urlTerm);
  if (syncedTerm !== urlTerm) {
    setSyncedTerm(urlTerm);
    setValue(urlTerm);
  }

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLFormElement>(null);

  // Tìm bằng giọng nói: chữ nghe được hiện dần vào ô; nói xong thì mở bảng gợi ý như khi gõ (KHÔNG tự chuyển trang)
  const voice = useVoiceSearch({
    onInterim: (text) => {
      setValue(text.slice(0, MAX_LENGTH));
      setActive(-1);
    },
    onFinal: (text) => {
      setValue(text.slice(0, MAX_LENGTH));
      setActive(-1);
      setOpen(true);
      inputRef.current?.focus();
    },
  });
  const { cancel: cancelVoice } = voice;

  // Chuyển trang thì thôi nghe
  useEffect(() => cancelVoice(), [pathname, cancelVoice]);

  function toggleVoice() {
    if (voice.listening) {
      voice.stop();
      return;
    }
    setOpen(false);
    setActive(-1);
    voice.start();
  }

  const term = value.trim();
  const sold = useMemo(() => soldCounts(orders), [orders]);
  // Chưa isReady thì không có sản phẩm: chỉ hiện ô nhập, không bảng gợi ý
  const showPanel = open && isReady;

  // Các món khớp (tất cả, để biết "Xem tất cả n kết quả"), và 6 món đầu để gợi ý
  const hits = useMemo(() => (isReady && term ? searchProducts(products, term, undefined, sold) : []), [isReady, products, term, sold]);

  // Tìm trong /san-pham thì giữ nguyên các bộ lọc đang chọn (miền, tỉnh, giá, sắp xếp), chỉ đổi từ khóa
  function searchHref(search: string) {
    const params = new URLSearchParams();
    if (onProductsPage) searchParams.forEach((val, key) => key !== "q" && params.append(key, val));
    params.set("q", search);
    return `${PRODUCTS_PATH}?${params.toString()}`;
  }

  function buildOptions(): Option[] {
    if (!isReady) return [];
    if (term) {
      const list: Option[] = hits.slice(0, SUGGESTION_LIMIT).map((product) => ({
        kind: "product",
        id: `product-${product.id}`,
        href: `${PRODUCTS_PATH}/${product.id}`,
        product,
      }));
      list.push(
        hits.length > 0
          ? { kind: "all", id: "all", href: searchHref(term), label: `Xem tất cả ${hits.length} kết quả cho «${term}»` }
          : { kind: "all", id: "all", href: PRODUCTS_PATH, label: "Xem tất cả sản phẩm" }
      );
      return list;
    }
    return [
      ...recent.map((item): Option => ({ kind: "recent", id: `recent-${item}`, href: searchHref(item), term: item })),
      ...regionKeys.map((key): Option => ({
        kind: "region",
        id: `region-${key}`,
        href: `${PRODUCTS_PATH}?region=${key}`,
        label: regions[key].label,
      })),
      ...getBestSellers(products, sold, productViews)
        .slice(0, BEST_SELLER_SHOWN)
        .map((product): Option => ({ kind: "product", id: `best-${product.id}`, href: `${PRODUCTS_PATH}/${product.id}`, product })),
    ];
  }
  const options = buildOptions();

  // "/" ở bất cứ đâu (trừ khi đang gõ vào ô nhập khác) đưa con trỏ vào ô tìm kiếm
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Bấm ra ngoài thì đóng bảng
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Dòng đang chọn bằng phím mũi tên luôn nằm trong tầm nhìn của bảng
  useEffect(() => {
    if (active >= 0) document.getElementById(`${LIST_ID}-${active}`)?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [active]);

  function saveRecent(search: string) {
    const next = addRecentSearch(readRecent(), search);
    writeJSON(STORAGE_KEYS.recentSearches, next);
    setRecent(next);
  }

  function removeRecent(item: string) {
    const next = readRecent().filter((entry) => entry !== item);
    writeJSON(STORAGE_KEYS.recentSearches, next);
    setRecent(next);
    setActive(-1);
  }

  function clearRecent() {
    writeJSON(STORAGE_KEYS.recentSearches, []);
    setRecent([]);
    setActive(-1);
    inputRef.current?.focus();
  }

  // Mở một dòng: ghi nhớ từ khóa (nếu là tìm kiếm), đóng bảng rồi chuyển trang
  function go(option: Option) {
    if (option.kind === "recent") {
      setValue(option.term);
      saveRecent(option.term);
    } else if (option.kind === "all" && term && hits.length > 0) {
      saveRecent(term);
    } else if (option.kind === "product" && term) {
      saveRecent(term);
      setValue("");
    }
    setOpen(false);
    setActive(-1);
    router.push(option.href);
  }

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, option: Option) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(option);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = options.length;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!showPanel) return setOpen(true);
        if (count === 0) return;
        setActive(event.key === "ArrowDown" ? (active + 1) % count : active <= 0 ? count - 1 : active - 1);
        break;
      case "Enter":
        // Có dòng đang chọn thì mở dòng đó; không thì để form gửi đi (trang kết quả)
        if (showPanel && active >= 0 && options[active]) {
          event.preventDefault();
          go(options[active]);
        }
        break;
      case "Escape":
        // Lần đầu đóng bảng, lần sau xóa chữ
        event.preventDefault();
        if (showPanel) setOpen(false);
        else setValue("");
        setActive(-1);
        break;
      case "Delete": {
        const option = options[active];
        if (showPanel && option?.kind === "recent") {
          event.preventDefault();
          removeRecent(option.term);
        }
        break;
      }
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const liveMessage = !showPanel || !term ? "" : hits.length > 0 ? `${Math.min(hits.length, SUGGESTION_LIMIT)} gợi ý` : `Không tìm thấy kết quả cho ${term}`;
  const heading = "px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted";

  // Vẽ một dòng. Chỉ số trong `options` để mũi tên và aria-activedescendant biết dòng nào đang chọn.
  function renderOption(option: Option) {
    const index = options.indexOf(option);
    const isActive = active === index;
    const rowClass = `flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-100 ${isActive ? "bg-surface" : ""}`;
    const common = {
      id: `${LIST_ID}-${index}`,
      role: "option" as const,
      "aria-selected": isActive,
      tabIndex: -1,
      href: option.href,
      onMouseDown: (event: MouseEvent) => event.preventDefault(), // giữ con trỏ trong ô nhập
      onPointerMove: () => active !== index && setActive(index),
      onClick: (event: MouseEvent<HTMLAnchorElement>) => onLinkClick(event, option),
    };

    if (option.kind === "product") {
      const { product } = option;
      return (
        <Link key={option.id} {...common} className={rowClass}>
          <Image src={product.image} alt="" width={40} height={40} className="h-10 w-10 max-w-none shrink-0 rounded-md object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink">
              {splitMatch(product.name, term).map((part, i) =>
                part.match ? (
                  <strong key={i} className="font-bold">
                    {part.text}
                  </strong>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="truncate">{product.origin}</span>
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-semibold text-ink">{formatVND(product.price)}</span>
            {product.oldPrice && (
              <span className="block text-xs text-ink-muted line-through">
                <span className="sr-only">Giá cũ </span>
                {formatVND(product.oldPrice)}
              </span>
            )}
          </span>
        </Link>
      );
    }

    if (option.kind === "recent") {
      return (
        <div key={option.id} role="presentation" className="relative">
          <Link {...common} className={`${rowClass} pr-12`}>
            <Icon name="search" size={16} className="shrink-0 text-ink-muted" />
            <span className="min-w-0 truncate text-sm text-ink">{option.term}</span>
          </Link>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Xóa «${option.term}» khỏi tìm gần đây`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => removeRecent(option.term)}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors duration-100 hover:bg-white hover:text-ink"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      );
    }

    if (option.kind === "region") {
      return (
        <Link key={option.id} {...common} className={rowClass}>
          <span className="text-sm text-ink">{option.label}</span>
        </Link>
      );
    }

    return (
      <Link key={option.id} {...common} className={`${rowClass} mt-1 border-t border-line text-sm font-semibold text-primary`}>
        <span className="min-w-0 break-words">{option.label}</span>
        <Icon name="arrow" size={16} className="ml-auto shrink-0" />
      </Link>
    );
  }

  // Các dòng gom theo nhóm (thứ tự giống buildOptions, nên chỉ số trong `options` khớp với thứ tự hiển thị)
  const recentOptions = options.filter((o) => o.kind === "recent");
  const regionOptions = options.filter((o) => o.kind === "region");
  const bestOptions = options.filter((o) => o.kind === "product" && !term);

  return (
    <Form
      ref={boxRef}
      role="search"
      action={PRODUCTS_PATH}
      onSubmit={() => {
        if (term) saveRecent(term);
        setOpen(false);
        setActive(-1);
      }}
      className={formClass}
    >
      {/* Đang ở /san-pham: giữ các bộ lọc khi tìm từ khóa mới */}
      {onProductsPage &&
        [...searchParams.entries()]
          .filter(([key]) => key !== "q")
          .map(([key, val], i) => <input key={`${key}-${i}`} type="hidden" name={key} value={val} />)}

      <label htmlFor="search-input" className="sr-only">
        Tìm kiếm đặc sản
      </label>
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        ref={inputRef}
        id="search-input"
        name="q"
        type="search"
        maxLength={MAX_LENGTH}
        enterKeyHint="search"
        placeholder={voice.listening ? "Đang nghe…" : "Tìm chè, ô mai, nước mắm…"}
        autoComplete="off"
        value={value}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={LIST_ID}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && active >= 0 ? `${LIST_ID}-${active}` : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => {
          setRecent(readRecent());
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`${inputClass} ${voice.supported ? "pr-[5.5rem]" : "pr-12"}`}
      />
      {value ? (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => {
            setValue("");
            setActive(-1);
            setOpen(true);
            inputRef.current?.focus();
          }}
          className={`absolute ${voice.supported ? "right-11" : "right-1.5"} top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-surface hover:text-ink`}
        >
          <Icon name="x" size={18} />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className={`pointer-events-none absolute ${voice.supported ? "right-12" : "right-3"} top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded border border-line bg-surface font-sans text-xs text-ink-muted lg:flex`}
        >
          /
        </kbd>
      )}
      {/* Nút micro: chỉ hiện khi trình duyệt có nhận dạng giọng nói (Firefox chưa có) */}
      {voice.supported && (
        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={voice.listening}
          aria-label={voice.listening ? "Dừng nghe" : "Tìm bằng giọng nói"}
          className={`absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200 ${
            voice.listening ? "bg-primary text-white" : "text-ink-muted hover:bg-surface hover:text-ink"
          }`}
        >
          {/* Vòng nhịp đập nhẹ khi đang nghe (tắt khi bật "giảm chuyển động") */}
          {voice.listening && (
            <span aria-hidden="true" className="pointer-events-none absolute -inset-1 rounded-full border-2 border-primary motion-safe:animate-pulse" />
          )}
          <Icon name="mic" size={18} />
        </button>
      )}

      <p aria-live="polite" className="sr-only">
        {liveMessage}
      </p>
      <p role="status" className="sr-only">
        {voice.listening ? "Đang nghe…" : ""}
      </p>
      {/* Lỗi nhận giọng nói: dòng nhỏ dưới ô, tự ẩn sau vài giây */}
      {voice.error && !showPanel && (
        <p role="alert" className="absolute left-0 top-full z-50 mt-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-sale shadow-card">
          {voice.error}
        </p>
      )}

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] animate-dropdown-in overflow-y-auto overscroll-contain rounded-xl border border-line bg-white p-2 shadow-card">
          {term && hits.length === 0 && (
            <div className="px-3 py-4 text-sm">
              <p className="font-semibold text-ink">Không tìm thấy «{term}»</p>
              <p className="mt-1 text-ink-muted">Thử một từ khác, hoặc gõ không dấu (ví dụ “nuoc mam”).</p>
            </div>
          )}

          {!term && recentOptions.length > 0 && (
            <div className="flex items-center justify-between">
              <p className={heading}>Tìm gần đây</p>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearRecent}
                className="mr-1 rounded px-2 py-1 text-xs font-semibold text-primary hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          <div id={LIST_ID} role="listbox" aria-label="Gợi ý tìm kiếm">
            {term ? (
              options.map((option) => renderOption(option))
            ) : (
              <>
                {recentOptions.map((option) => renderOption(option))}
                {regionOptions.length > 0 && (
                  <>
                    <p className={heading} aria-hidden="true">
                      Khám phá theo miền
                    </p>
                    {regionOptions.map((option) => renderOption(option))}
                  </>
                )}
                {bestOptions.length > 0 && (
                  <>
                    <p className={heading} aria-hidden="true">
                      Bán chạy
                    </p>
                    {bestOptions.map((option) => renderOption(option))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Form>
  );
}
