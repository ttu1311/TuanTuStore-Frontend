"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { btnBase, btnSecondary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { loginUrl } from "@/lib/redirect";

// Nút trái tim "Yêu thích". Danh sách được lưu theo TÀI KHOẢN, nên khách chưa đăng nhập
// được đưa tới trang đăng nhập, rồi quay lại đúng trang này.
// variant "icon": nút tròn nhỏ đặt trên ảnh của thẻ sản phẩm. "full": nút có chữ ở trang chi tiết.
export default function WishlistButton({
  productId,
  productName,
  variant = "icon",
}: {
  productId: string;
  productName: string;
  variant?: "icon" | "full";
}) {
  const { isReady, wishlist, toggleWishlist } = useStore();
  const router = useRouter();
  const saved = wishlist.includes(productId);

  function handleClick() {
    const result = toggleWishlist(productId);
    if (!result.ok && result.field === "login") router.push(loginUrl(window.location.pathname + window.location.search));
  }

  const label = saved ? `Bỏ ${productName} khỏi yêu thích` : `Thêm ${productName} vào yêu thích`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!isReady}
        aria-pressed={saved}
        aria-label={label}
        // Đã thích: nền nhạt (không trộn với btnSecondary, vì hai class nền sẽ xung đột)
        className={`${btnBase} ${saved ? "border-primary bg-primary-soft text-primary" : btnSecondary}`}
      >
        <Icon name="heart" size={20} filled={saved} className={saved ? "text-sale" : ""} />
        {saved ? "Đã yêu thích" : "Yêu thích"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Bỏ yêu thích" : "Yêu thích"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors duration-200 hover:bg-white hover:text-sale"
    >
      <Icon name="heart" size={20} filled={saved} className={saved ? "text-sale" : ""} />
    </button>
  );
}
