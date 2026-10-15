"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";
import { getCartLines } from "@/lib/cart";

const iconButton =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface";

// Account icon + cart icon on the right of the header.
// They need the logged-in user and the cart, which live in the browser, so this is a client component.
export default function HeaderActions() {
  const { isReady, currentUser, cart, products } = useStore();

  // Only products that still exist are counted
  const cartCount = getCartLines(cart, products).reduce((sum, line) => sum + line.quantity, 0);
  // Hidden while empty, and until the saved cart is loaded (avoids a wrong badge on first paint)
  const showBadge = isReady && cartCount > 0;

  return (
    <div className="ml-auto flex items-center gap-2 lg:ml-0">
      {/* Logged in: the account icon opens the account page. Otherwise: the login page. */}
      <Link
        href={currentUser ? "/tai-khoan" : "/dang-nhap"}
        aria-label={currentUser ? "Tài khoản của tôi" : "Đăng nhập"}
        className={iconButton}
      >
        <Icon name="user" size={24} />
      </Link>
      <Link
        href="/gio-hang"
        aria-label={showBadge ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng"}
        className={iconButton}
      >
        <Icon name="bag" size={24} />
        {showBadge && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0.5 h-5 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-semibold leading-5 text-white"
          >
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
