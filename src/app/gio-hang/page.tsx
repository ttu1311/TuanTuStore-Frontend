import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Giỏ hàng — TuanTuStore",
  description: "Giỏ hàng của bạn tại TuanTuStore.",
};

export default function CartPage() {
  return (
    <>
      <Header currentPath="/gio-hang" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Giỏ hàng</h1>
          <CartView />
        </div>
      </main>
      <Footer />
    </>
  );
}
