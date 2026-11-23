"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CHART_BLUE } from "@/components/admin/charts/chartTheme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatVND } from "@/lib/format";
import { regions } from "@/lib/regions";
import { daysAgoLabel, type StockReport, type StockRow } from "@/lib/stats";

const COUNT_UP_MS = 600;

// "8.400.000" -> "8,4 triệu₫"; dưới một triệu thì ghi đủ
function bigVND(value: number) {
  if (value < 1_000_000) return formatVND(value);
  return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu₫`;
}

// Khối hiện vào màn hình lần đầu thì true (để chạy hiệu ứng đúng lúc người dùng nhìn thấy nó)
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, seen] as const;
}

// Số chạy từ 0 tới giá trị thật trong ~0,6 giây. Bật "giảm chuyển động" thì hiện luôn giá trị thật.
function useCountUp(target: number, active: boolean, reduced: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || reduced) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_MS);
      setValue(target * (1 - (1 - t) ** 3)); // chậm dần ở cuối
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, reduced]);
  return reduced ? target : value;
}

function SummaryNumber({ label, value, format, unit, active, reduced }: {
  label: string;
  value: number;
  format: (n: number) => string;
  unit?: string;
  active: boolean;
  reduced: boolean;
}) {
  const shown = useCountUp(value, active, reduced);
  return (
    <div className="bg-white px-5 py-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-ink">
        {/* Số đang chạy chỉ để nhìn; người đọc màn hình nghe giá trị thật */}
        <span aria-hidden="true">{format(Math.round(shown))}</span>
        <span className="sr-only">{format(value)}</span>
        {unit && <span className="ml-1.5 text-sm font-normal text-ink-muted">{unit}</span>}
      </dd>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted" aria-label="Chú thích thanh">
      <li className="flex items-center gap-1.5">
        <span className="h-2 w-4 rounded-full" style={{ backgroundColor: CHART_BLUE }} aria-hidden="true" />
        Còn trong kho
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-2 w-4 rounded-full bg-ink-muted/30" aria-hidden="true" />
        Đã bán
      </li>
    </ul>
  );
}

function Row({ row, index, scale, shown, reduced, active, onActive }: {
  row: StockRow;
  index: number;
  scale: number;
  shown: boolean;
  reduced: boolean;
  active: string | null;
  onActive: (id: string | null) => void;
}) {
  const { product } = row;
  const isActive = active === product.id;
  const sharePercent = Math.round(row.soldShare * 100);
  const lastSold = row.lastSoldAt ? daysAgoLabel(row.lastSoldAt) : null;
  const top = index < 3; // hạng 1–3: số hạng đậm màu chủ đạo, không thêm huy chương

  return (
    <li
      onPointerEnter={() => onActive(product.id)}
      onPointerLeave={() => onActive(null)}
      onFocus={() => onActive(product.id)}
      onBlur={() => onActive(null)}
      className="relative grid grid-cols-[1.25rem_2.5rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-1 py-2.5 sm:gap-3 sm:px-2 transition-[background-color,opacity] duration-150 has-[a:focus-visible]:bg-surface hover:bg-surface"
      style={{ opacity: active === null || isActive ? 1 : 0.55 }}
    >
      <span className={`text-center text-sm tabular-nums ${top ? "font-semibold text-primary" : "text-ink-muted"}`}>{index + 1}</span>
      <Image src={product.image} width={40} height={40} alt="" className="h-10 w-10 max-w-none rounded-lg object-cover" />

      <div className="min-w-0">
        <span className="flex min-w-0 items-start gap-2 text-sm">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${regions[product.region].dotClass}`} aria-hidden="true" />
          <Link
            href={`/admin/san-pham/${product.id}/sua`}
            className="min-w-0 break-words font-medium text-ink outline-none hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline"
          >
            {product.name}
          </Link>
          <span className="sr-only">
            {`${regions[product.region].label}. Còn ${product.stock}, đã bán ${row.sold}, giá trị hàng tồn ${formatVND(row.stockValue)}.`}
            {lastSold ? ` Bán lần cuối: ${lastSold}.` : " Chưa bán được."}
          </span>
        </span>

        <span className="mt-1.5 block h-2 overflow-clip rounded-full bg-surface" aria-hidden="true">
          <span
            className="flex h-full origin-left"
            style={{
              transform: shown || reduced ? "scaleX(1)" : "scaleX(0)",
              transition: reduced ? "none" : `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 45}ms`,
            }}
          >
            <span className="block h-full" style={{ width: `${(product.stock / scale) * 100}%`, backgroundColor: CHART_BLUE }} />
            <span className="block h-full bg-ink-muted/30" style={{ width: `${(row.sold / scale) * 100}%` }} />
          </span>
        </span>

        <span className="mt-1 block text-xs text-ink-muted" aria-hidden="true">
          {row.sold === 0 ? (
            <span>Chưa bán</span>
          ) : (
            <span className="tabular-nums">
              Đã bán {row.sold} · lần cuối {lastSold?.toLowerCase()}
            </span>
          )}
        </span>
      </div>

      <div className="text-right" aria-hidden="true">
        <span className="block text-lg font-semibold leading-none tabular-nums text-ink">{product.stock}</span>
        <span className="mt-1 block whitespace-nowrap text-xs tabular-nums text-ink-muted">{formatVND(row.stockValue)}</span>
      </div>

      {isActive && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-full z-10 mt-1 w-max max-w-[min(18rem,calc(100vw-4rem))] rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-card"
        >
          <span className="block font-semibold text-ink">{product.name}</span>
          <span className="block tabular-nums text-ink-muted">Giá bán {formatVND(product.price)}</span>
          <span className="block tabular-nums text-ink-muted">
            Còn {product.stock} · giá trị tồn {formatVND(row.stockValue)}
          </span>
          {row.sold > 0 && (
            <span className="block tabular-nums text-ink-muted">
              Đã bán {row.sold} ({sharePercent}%) trong {row.orderCount} đơn
            </span>
          )}
          <span className="block text-ink-muted">{lastSold ? `Bán lần cuối: ${lastSold}` : "Chưa bán được"}</span>
        </span>
      )}
    </li>
  );
}

// Khi mọi món cùng số tồn và chưa bán cái nào thì xếp hạng không có gì để so sánh: nói thẳng thay vì vẽ 10 thanh giống nhau
function UniformNotice({ report, images }: { report: StockReport; images: { id: string; image: string }[] }) {
  const stock = report.rows[0]?.product.stock ?? 0;
  return (
    <div className="mt-6 flex flex-col items-start gap-4 rounded-xl bg-surface px-5 py-5 sm:flex-row sm:items-center">
      <div className="flex shrink-0 -space-x-3" aria-hidden="true">
        {images.map((product) => (
          <Image key={product.id} src={product.image} width={44} height={44} alt="" className="h-11 w-11 max-w-none rounded-full border-2 border-surface object-cover" />
        ))}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-ink">
          Cả {report.productCount} món đều còn {stock} sản phẩm và chưa có lượt bán nào.
        </p>
        <p className="mt-1 text-sm text-ink-muted">Khi có đơn hàng, các món tồn nhiều nhất sẽ được xếp hạng ở đây.</p>
      </div>
      <Link href="/admin/san-pham" className="text-sm font-semibold text-primary underline-offset-4 hover:underline sm:ml-auto sm:shrink-0">
        Xem sản phẩm →
      </Link>
    </div>
  );
}

// Khối "Tồn kho nhiều nhất" của trang Tổng quan: tóm tắt kho, rồi 10 món còn nhiều hàng nhất.
// Mọi con số lấy từ stockReport (src/lib/stats.ts); component này chỉ vẽ.
export default function AdminStockPanel({ report, images }: { report: StockReport; images: { id: string; image: string }[] }) {
  const reduced = useReducedMotion();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div ref={ref}>
      <dl className="mt-5 grid gap-px overflow-clip rounded-lg border border-line bg-line sm:grid-cols-3">
        <SummaryNumber label="Tổng hàng trong kho" value={report.totalUnits} format={(n) => n.toLocaleString("vi-VN")} unit="sản phẩm" active={seen} reduced={reduced} />
        <SummaryNumber label="Giá trị hàng tồn" value={report.totalValue} format={bigVND} active={seen} reduced={reduced} />
        <SummaryNumber label="Chưa bán được" value={report.unsoldCount} format={(n) => String(n)} unit={`/ ${report.productCount} món`} active={seen} reduced={reduced} />
      </dl>

      {report.rows.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">Không còn sản phẩm nào trong kho.</p>
      ) : report.uniform ? (
        <UniformNotice report={report} images={images} />
      ) : (
        <>
          <Legend />
          <ol className="mt-2 lg:grid lg:grid-flow-col lg:grid-rows-5 lg:gap-x-8" aria-label="Món còn nhiều hàng nhất">
            {report.rows.map((row, index) => (
              <Row key={row.product.id} row={row} index={index} scale={report.scale} shown={seen} reduced={reduced} active={active} onActive={setActive} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
