import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Thanh toán — TuanTuStore",
  description: "Thanh toán đơn hàng tại TuanTuStore.",
};

// Guests can check out too. A logged-in customer's order is linked to their account.
export default function CheckoutPage() {
  return (
    <>
      <Header currentPath="/gio-hang" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Thanh toán</h1>
          <CheckoutView />
        </div>
      </main>
      <Footer />
    </>
  );
}
