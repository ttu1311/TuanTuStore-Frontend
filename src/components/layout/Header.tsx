import Form from "next/form";
import HeaderActions from "@/components/layout/HeaderActions";
import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon from "@/components/ui/Icon";
import MainNav from "@/components/layout/MainNav";

// Phần đầu của mọi trang cửa hàng: logo, tìm kiếm, biểu tượng tài khoản + giỏ hàng, và menu chính.
// Mục menu nào sáng lên do MainNav quyết định, dựa vào địa chỉ của trang.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/[0.97]">
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:h-[76px] lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0">
        <SameRouteLink
          href="/"
          aria-label="TuanTuStore — Trang chủ"
          className="whitespace-nowrap font-display text-[32px] font-bold leading-none text-ink"
        >
          TuanTuStore
        </SameRouteLink>

        {/* next/form: nhấn Enter mở /san-pham?q=<từ khóa> mà không tải lại trang.
           Trang danh sách đọc "q" và bắt đầu với từ khóa đó trong ô tìm kiếm của nó. */}
        <Form
          role="search"
          action="/san-pham"
          className="relative order-3 mx-auto w-full basis-full lg:order-none lg:max-w-[560px] lg:flex-1 lg:basis-0"
        >
          <label htmlFor="search-input" className="sr-only">
            Tìm kiếm đặc sản
          </label>
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="search-input"
            name="q"
            type="search"
            maxLength={100}
            placeholder="Tìm đặc sản, ví dụ: chè, ô mai, nước mắm…"
            autoComplete="off"
            className="h-12 w-full rounded-md border border-line bg-white pl-12 pr-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
          />
        </Form>

        <HeaderActions />
      </div>

      <MainNav />
    </header>
  );
}
