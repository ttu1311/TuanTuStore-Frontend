"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import WishlistButton from "@/components/product/WishlistButton";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { cleanQuantity, maxOrderable } from "@/lib/cart";

// Ô số lượng + các nút của trang chi tiết sản phẩm.
export default function ProductPurchase({ productId }: { productId: string }) {
  const { addToCart, products, cart } = useStore();
  const product = products.find((item) => item.id === productId);
  const limit = product ? maxOrderable(product) : 0; // không quá tồn kho
  const inCart = cart.find((item) => item.productId === productId)?.quantity ?? 0;
  const soldOut = limit === 0;
  const router = useRouter();
  // Giữ dạng chữ để người dùng có thể xóa trống ô khi đang gõ
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");

  // Số sản phẩm trong ô: từ 1 đến số còn trong kho (tối đa 99)
  function currentAmount() {
    return Math.min(cleanQuantity(Number(quantity)), Math.max(1, limit));
  }

  function handleAdd() {
    const amount = currentAmount();
    addToCart(productId, amount);
    setQuantity(String(amount));
    const added = Math.min(amount, Math.max(0, limit - inCart));
    setMessage(
      added === 0
        ? `Giỏ hàng đã có đủ ${limit} sản phẩm còn lại.`
        : added < amount
          ? `Chỉ còn ${limit} sản phẩm: đã thêm ${added} vào giỏ hàng.`
          : `Đã thêm ${amount} sản phẩm vào giỏ hàng.`
    );
  }

  // "Mua ngay": thêm số lượng đã chọn vào giỏ, rồi chuyển thẳng tới trang thanh toán
  function handleBuyNow() {
    addToCart(productId, currentAmount());
    router.push("/thanh-toan");
  }

  return (
    <>
      {/* Tồn kho: còn bao nhiêu, hoặc hết hàng */}
      <p className={`mt-6 text-sm font-medium ${soldOut ? "text-sale" : "text-ink-muted"}`}>
        {soldOut ? "Hết hàng" : `Còn ${product?.stock} sản phẩm trong kho`}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="quantity" className="font-medium text-ink">
          Số lượng
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(1, limit)}
          disabled={soldOut}
          value={quantity}
          onChange={(event) => {
            setQuantity(event.target.value);
            setMessage("");
          }}
          onBlur={() => setQuantity(String(currentAmount()))}
          className="h-12 w-24 rounded-lg border border-line bg-white px-4 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className={`${btnBase} ${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Icon name="bag" size={20} /> {soldOut ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut}
          className={`${btnBase} ${btnSecondary} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Mua ngay
        </button>
        {product && <WishlistButton productId={product.id} productName={product.name} variant="full" />}
      </div>

      <p role="status" className="mt-3 min-h-6 text-sm font-medium text-primary">
        {message}
      </p>
    </>
  );
}
