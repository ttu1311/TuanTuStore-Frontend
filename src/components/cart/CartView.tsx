"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RegionBadge from "@/components/product/RegionBadge";
import ContentSidebar from "@/components/layout/PageLayout";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import FreeShippingProgress from "@/components/cart/FreeShippingProgress";
import { calculateTotals, getCartLines, maxOrderable, selectedLines } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types";

const stepButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-lg font-semibold text-ink transition-colors duration-200 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40";

function CartRow({ product, quantity, selected }: { product: Product; quantity: number; selected: boolean }) {
  const { setCartQuantity, removeFromCart, setCartSelected } = useStore();
  const limit = maxOrderable(product); // không quá tồn kho
  // Kho đã giảm sau khi khách bỏ vào giỏ (đặt ở tab khác, hoặc Admin sửa kho)
  const problem =
    product.stock <= 0
      ? "Sản phẩm đã hết hàng. Vui lòng xóa khỏi giỏ để đặt hàng."
      : quantity > product.stock
        ? `Chỉ còn ${product.stock} sản phẩm. Vui lòng giảm số lượng.`
        : "";
  // Văn bản khi đang gõ, nên ô có thể trống trong giây lát. Giỏ hàng không bao giờ nhận số lượng dưới 1.
  const [draft, setDraft] = useState(String(quantity));
  // Giữ ô nhập đồng bộ khi nút − / + đổi số lượng (chỉnh state ngay lúc render, như React khuyến nghị)
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
      {/* Ô tick: chỉ món đã tick mới được mua; món chưa tick ở lại trong giỏ */}
      <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
        <label className="flex h-11 w-9 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => setCartSelected(product.id, event.target.checked)}
            aria-label={`Chọn ${product.name} để mua`}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
        </label>
        <Link
          href={`/san-pham/${product.id}`}
          aria-label={product.name}
          className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
        >
          <Image src={product.image} width={960} height={720} alt="" sizes="120px" className="block h-28 w-28 object-cover" />
        </Link>
      </div>

      <div className="min-w-0 flex-1">
        <RegionBadge region={product.region} />
        <h2 className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/san-pham/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="text-sm text-ink-muted">
          {product.brand} · {product.pack}
        </p>
        <p className="mt-1 text-ink-muted">{formatVND(product.price)}</p>
        {problem ? (
          <p role="alert" className="mt-1 text-sm font-medium text-sale">
            {problem}
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">Còn {product.stock} sản phẩm</p>
        )}
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
            max={Math.max(1, limit)}
            aria-label={`Số lượng ${product.name}`}
            value={draft}
            onChange={(event) => handleType(event.target.value)}
            onBlur={() => setDraft(String(quantity))}
            className="h-11 w-16 rounded-lg border border-line bg-white px-2 text-center text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
          />
          <button
            type="button"
            aria-label={`Tăng số lượng ${product.name}`}
            disabled={quantity >= limit}
            onClick={() => setCartQuantity(product.id, quantity + 1)}
            className={stepButton}
          >
            +
          </button>
        </div>

        <span className={`whitespace-nowrap text-xl font-bold ${selected ? "text-primary" : "text-ink-muted"}`}>
          {formatVND(product.price * quantity)}
          {!selected && <span className="sr-only"> (chưa chọn để mua)</span>}
        </span>

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

// Giỏ hàng chỉ lưu id sản phẩm và số lượng; tên, giá và ảnh lấy từ danh sách sản phẩm.
export default function CartView() {
  const { isReady, cart, products, clearCart, setAllCartSelected } = useStore();
  // Bấm "Xóa tất cả" lần đầu chỉ hỏi lại; phải xác nhận mới xóa, tránh bấm nhầm mất cả giỏ
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Chờ localStorage, nếu không thông báo giỏ trống sẽ nháy lên mỗi lần tải trang
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

  // Chỉ các món đã tick được tính tiền và thanh toán
  const chosen = selectedLines(lines);
  const allSelected = chosen.length === lines.length;
  const someSelected = chosen.length > 0 && !allSelected;
  const { subtotal, shippingFee, discount, total } = calculateTotals(
    chosen.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  );
  // Món ĐÃ CHỌN hết hàng hoặc vượt số còn lại: chưa cho thanh toán (món chưa chọn không ảnh hưởng)
  const stockProblem = chosen.some((line) => line.quantity > line.product.stock);

  const summaryRows = [
    { label: "Tạm tính", value: formatVND(subtotal) },
    { label: "Phí vận chuyển", value: shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee) },
    { label: "Giảm giá", value: `−${formatVND(discount)}` },
  ];

  return (
    // Nội dung: các dòng trong giỏ. Sidebar (phải): tóm tắt đơn hàng, luôn nằm trong tầm nhìn khi cuộn.
    <ContentSidebar
      sidebarLabel="Tổng đơn hàng"
      sticky
      sidebar={
        <div className="rounded-xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Tổng đơn hàng</h2>
            {chosen.length === 0 ? (
              // Chưa tick món nào: không có gì để tính tiền
              <>
                <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-ink-muted">
                  Bạn chưa chọn sản phẩm nào. Hãy tick vào ô vuông bên cạnh sản phẩm muốn mua.
                </p>
                <button type="button" disabled className={`${btnBase} ${btnPrimary} mt-6 w-full cursor-not-allowed opacity-50`}>
                  Mua hàng (0)
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-muted">
                  {chosen.length} sản phẩm đã chọn
                  {!allSelected && ` · ${lines.length - chosen.length} sản phẩm ở lại trong giỏ`}
                </p>
                <div className="mt-4">
                  <FreeShippingProgress subtotal={subtotal} />
                </div>
                <dl className="mt-4 space-y-3">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <dt className="text-ink-muted">{row.label}</dt>
                      <dd className="font-medium text-ink">{row.value}</dd>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-4">
                    <dt className="text-lg font-semibold text-ink">Tổng cộng</dt>
                    <dd className="text-2xl font-bold text-primary">{formatVND(total)}</dd>
                  </div>
                </dl>
                {stockProblem ? (
                  <>
                    <button type="button" disabled className={`${btnBase} ${btnPrimary} mt-6 w-full cursor-not-allowed opacity-50`}>
                      Mua hàng ({chosen.length})
                    </button>
                    <p className="mt-2 text-sm text-sale">Một số sản phẩm đã chọn không đủ hàng. Hãy sửa giỏ hàng để tiếp tục.</p>
                  </>
                ) : (
                  <Link href="/thanh-toan" className={`${btnBase} ${btnPrimary} mt-6 w-full`}>
                    Mua hàng ({chosen.length})
                  </Link>
                )}
              </>
            )}
            <Link
              href="/san-pham"
              className="mt-1 block py-3 text-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Tiếp tục mua sắm
            </Link>
        </div>
      }
    >
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-3">
        {/* Chọn tất cả / bỏ chọn tất cả; "indeterminate" (gạch ngang) khi mới chọn một phần */}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-ink">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(element) => {
              if (element) element.indeterminate = someSelected;
            }}
            onChange={(event) => setAllCartSelected(event.target.checked)}
            className="ml-2 h-5 w-5 cursor-pointer accent-primary"
          />
          <span className="font-medium">
            Chọn tất cả ({lines.length})
            <span className="font-normal text-ink-muted"> · đã chọn {chosen.length}</span>
          </span>
        </label>
        {confirmingClear ? (
          <div role="alertdialog" aria-labelledby="clear-cart-question" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span id="clear-cart-question" className="text-sm font-medium text-ink">
              Xóa tất cả {lines.length} sản phẩm khỏi giỏ?
            </span>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setConfirmingClear(false);
              }}
              className="inline-flex min-h-11 items-center rounded-lg bg-sale px-4 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Xóa tất cả
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted underline underline-offset-4 transition-colors duration-200 hover:text-sale"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white px-6">
        {lines.map((line) => (
          <CartRow key={line.product.id} product={line.product} quantity={line.quantity} selected={line.selected} />
        ))}
      </ul>
    </ContentSidebar>
  );
}
