"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { MAX_QUANTITY, cleanQuantity } from "@/lib/cart";

// Quantity field + buttons of the product detail page.
export default function ProductPurchase({ productId }: { productId: string }) {
  const { addToCart } = useStore();
  const router = useRouter();
  // Kept as text so the user can clear the field while typing
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");

  // The number of units in the field, from 1 to 99
  function currentAmount() {
    return cleanQuantity(Number(quantity));
  }

  function handleAdd() {
    const amount = currentAmount();
    addToCart(productId, amount);
    setQuantity(String(amount));
    setMessage(`Đã thêm ${amount} sản phẩm vào giỏ hàng.`);
  }

  // "Mua ngay": add the selected quantity to the cart, then go straight to the checkout
  function handleBuyNow() {
    addToCart(productId, currentAmount());
    router.push("/thanh-toan");
  }

  return (
    <>
      <div className="mt-8 flex items-center gap-4">
        <label htmlFor="quantity" className="font-medium text-ink">
          Số lượng
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={MAX_QUANTITY}
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
        <button type="button" onClick={handleAdd} className={`${btnBase} ${btnPrimary}`}>
          <Icon name="bag" size={20} /> Thêm vào giỏ hàng
        </button>
        <button type="button" onClick={handleBuyNow} className={`${btnBase} ${btnSecondary}`}>
          Mua ngay
        </button>
      </div>

      <p role="status" className="mt-3 min-h-6 text-sm font-medium text-primary">
        {message}
      </p>
    </>
  );
}
