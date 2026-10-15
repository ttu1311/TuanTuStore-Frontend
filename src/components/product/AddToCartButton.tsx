"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";

// The "Thêm vào giỏ" button of a product card. Adds 1 unit to the cart in localStorage,
// then says "Đã thêm vào giỏ" for 2 seconds so the customer sees that it worked.
export default function AddToCartButton({
  productId,
  productName,
  className = "mt-auto w-full",
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          addToCart(productId, 1);
          setAdded(true);
        }}
        className={`${btnBase} ${btnPrimary} ${btnSmall} ${className}`}
      >
        <Icon name={added ? "check" : "plus"} size={16} />
        {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        {/* Screen readers hear which product the button belongs to */}
        <span className="sr-only">: {productName}</span>
      </button>
      {/* Outside the button, so it is announced once and does not become part of the button's name */}
      <span className="sr-only" aria-live="polite">
        {added ? `Đã thêm ${productName} vào giỏ hàng` : ""}
      </span>
    </>
  );
}
