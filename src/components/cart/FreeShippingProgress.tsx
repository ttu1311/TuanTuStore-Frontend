import { formatVND } from "@/lib/format";
import { FREE_SHIPPING_MIN } from "@/lib/cart";

// Thanh nhắc trong giỏ hàng và trang thanh toán: còn bao nhiêu nữa thì được miễn phí vận chuyển.
export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_MIN - subtotal, 0);
  const percent = Math.min((subtotal / FREE_SHIPPING_MIN) * 100, 100);

  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="text-sm text-ink">
        {remaining > 0 ? (
          <>
            Mua thêm <span className="font-semibold text-primary">{formatVND(remaining)}</span> để được{" "}
            <span className="font-semibold">miễn phí vận chuyển</span>.
          </>
        ) : (
          <span className="font-semibold text-che">Đơn hàng của bạn được miễn phí vận chuyển.</span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Tiến độ tới mức miễn phí vận chuyển"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_MIN}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_MIN)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-white"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${remaining > 0 ? "bg-primary" : "bg-che"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
