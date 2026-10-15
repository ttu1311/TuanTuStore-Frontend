import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NotFoundMessage from "@/components/ui/NotFoundMessage";

export const metadata: Metadata = { title: "Không tìm thấy trang — TuanTuStore" };

// Shown for every unknown address
export default function NotFound() {
  return (
    <>
      {/* currentPath matches no menu item, so nothing is highlighted */}
      <Header currentPath="/khong-tim-thay" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <NotFoundMessage />
        </div>
      </main>
      <Footer />
    </>
  );
}
