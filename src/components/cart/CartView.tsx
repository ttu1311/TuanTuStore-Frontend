"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RegionBadge from "@/components/product/RegionBadge";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { MAX_QUANTITY, calculateTotals, getCartLines } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types";

const stepButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-lg font-semibold text-ink transition-colors duration-200 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40";

function CartRow({ product, quantity }: { product: Product; quantity: number }) {
  const { setCartQuantity, removeFromCart } = useStore();
  // Text while typing, so the field can be empty for a moment. The cart never gets a quantity below 1.
  const [draft, setDraft] = useState(String(quantity));
  // Keep the field in sync when − / + change the quantity (adjusting state during render, as React recommends)
  const [shownQuantity, setShownQuantity] = useState(quantity);
  if (quantity !== shownQuantity) {
    setShownQuantity(quantity);
    setDraft(String(quantity));
  }

  function handleType(value: string) {
    setDraft(value);
    const number = Math.floor(Number(value));
    if (value !== "" && number >= 1) setCartQuantity(product.id, number);
  }

  return (
    <li className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
      <Link
        href={`/san-pham/${product.id}`}
        aria-label={product.name}
        className="shrink-0 self-start overflow-hidden rounded-xl border border-line bg-surface sm:self-center"
      >
        <Image src={product.image} width={960} height={720} alt="" sizes="120px" className="block h-28 w-28 object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <RegionBadge region={product.region} />
        <h2 className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/san-pham/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="text-sm text-ink-muted">
          {product.brand} · {product.pack}
        </p>
        <p className="mt-1 text-ink-muted">{formatVND(product.price)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Giảm số lượng ${product.name}`}
            disabled={quantity <= 1}
            onClick={() => setCartQuantity(product.id, quantity - 1)}
            className={stepButton}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={MAX_QUANTITY}
            aria-label={`Số lượng ${product.name}`}
            value={draft}
            onChange={(event) => handleType(event.target.value)}
            onBlur={() => setDraft(String(quantity))}
            className="h-11 w-16 rounded-lg border border-line bg-white px-2 text-center text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
          />
          <button
            type="button"
            aria-label={`Tăng số lượng ${product.name}`}
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setCartQuantity(product.id, quantity + 1)}
            className={stepButton}
          >
            +
          </button>
        </div>

        <span className="whitespace-nowrap text-xl font-bold text-primary">{formatVND(product.price * quantity)}</span>

        <button
          type="button"
          onClick={() => removeFromCart(product.id)}
          aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
          className="min-h-11 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-sale"
        >
          Xóa
        </button>
      </div>
    </li>
  );
}

// The cart only stores product ids and quantities; names, prices and images come from the product list.
export default function CartView() {
  const { isReady, cart, products } = useStore();

  // Wait for localStorage, otherwise the empty message would flash on every page load
  if (!isReady) return <LoadingState text="Đang tải giỏ hàng…" />;

  const lines = getCartLines(cart, products);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Giỏ hàng của bạn đang trống</p>
        <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-6`}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const { subtotal, shippingFee, discount, total } = calculateTotals(
    lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  );

  const summaryRows = [
    { label: "Tạm tính", value: formatVND(subtotal) },
    { label: "Phí vận chuyển", value: formatVND(shippingFee) },
    { label: "Giảm giá", value: `−${formatVND(discount)}` },
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line rounded-xl border border-line bg-white px-6">
        {lines.map((line) => (
          <CartRow key={line.product.id} product={line.product} quantity={line.quantity} />
        ))}
      </ul>

      <aside aria-label="Tổng đơn hàng" className="rounded-xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Tổng đơn hàng</h2>
        <dl className="mt-4 space-y-3">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="font-medium text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-line pt-4">
            <dt className="text-lg font-semibold text-ink">Tổng cộng</dt>
            <dd className="text-2xl font-bold text-primary">{formatVND(total)}</dd>
          </div>
        </dl>
        <Link href="/thanh-toan" className={`${btnBase} ${btnPrimary} mt-6 w-full`}>
          Tiến hành thanh toán
        </Link>
        <Link
          href="/san-pham"
          className="mt-1 block py-3 text-center text-sm font-medium text-primary underline underline-offset-4"
        >
          Tiếp tục mua sắm
        </Link>
      </aside>
    </div>
  );
}
