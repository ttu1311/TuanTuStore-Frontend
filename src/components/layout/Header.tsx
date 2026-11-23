import HeaderActions from "@/components/layout/HeaderActions";
import HeaderSearch from "@/components/layout/HeaderSearch";
import SameRouteLink from "@/components/layout/SameRouteLink";
import MainNav from "@/components/layout/MainNav";
import Logo from "@/components/brand/Logo";

// Phần đầu của mọi trang cửa hàng: logo, tìm kiếm, biểu tượng tài khoản + giỏ hàng, và menu chính.
// Mục menu nào sáng lên do MainNav quyết định, dựa vào địa chỉ của trang.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:h-[76px] lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0">
        <SameRouteLink
          href="/"
          aria-label="Đặc sản 3 Miền — Trang chủ"
          className="inline-flex shrink-0 rounded-md"
        >
          <Logo />
        </SameRouteLink>

        {/* Ô tìm kiếm có gợi ý tức thì; Enter hoặc "Xem tất cả" mở /san-pham?q=<từ khóa> */}
        <HeaderSearch />

        <HeaderActions />
      </div>

      <MainNav />
    </header>
  );
}
