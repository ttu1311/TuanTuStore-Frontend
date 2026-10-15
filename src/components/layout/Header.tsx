import Form from "next/form";
import Link from "next/link";
import HeaderActions from "@/components/layout/HeaderActions";
import Icon from "@/components/ui/Icon";
import { regions } from "@/lib/regions";
import type { Region } from "@/types";

// Every link starts with "/" so it works from any page.
// "/#id" means: go to the homepage, then scroll to the section with that id.
// The region items carry the dot colour of their region, as on the homepage route.
const navItems: { label: string; href: string; region?: Region }[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Miền Bắc", href: "/#mien-bac", region: "bac" },
  { label: "Miền Trung", href: "/#mien-trung", region: "trung" },
  { label: "Miền Nam", href: "/#mien-nam", region: "nam" },
  { label: "Giới thiệu", href: "/#gioi-thieu" },
  { label: "Liên hệ", href: "/#lien-he" },
];

// currentPath: the route of the page that shows this header, used to highlight its menu item.
// Each page passes its own path, e.g. <Header currentPath="/san-pham" />.
export default function Header({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/[0.97]">
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:h-[76px] lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0">
        <Link
          href="/"
          aria-label="TuanTuStore — Trang chủ"
          className="whitespace-nowrap font-display text-[32px] font-bold leading-none text-ink"
        >
          TuanTuStore
        </Link>

        {/* next/form: pressing Enter opens /san-pham?q=<search term> without reloading the page.
            The listing page reads "q" and starts with that term in its search field. */}
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

      <nav aria-label="Điều hướng chính" className="border-t border-line">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <ul className="flex h-[52px] items-stretch gap-6 overflow-x-auto lg:gap-8 lg:overflow-visible">
            {navItems.map((item) => {
              const isActive = item.href === currentPath;

              return (
                <li key={item.label} className="flex">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-full items-center gap-2 whitespace-nowrap border-b-2 text-base transition-colors duration-200 ${
                      isActive
                        ? "border-primary font-semibold text-primary"
                        : "border-transparent font-medium text-ink-muted hover:text-ink"
                    }`}
                  >
                    {item.region && (
                      <span className={`h-2 w-2 rounded-full ${regions[item.region].dotClass}`} aria-hidden="true" />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
