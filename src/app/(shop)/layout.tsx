import SiteShell from "@/components/layout/SiteShell";

// Header + Footer cho mọi trang của cửa hàng. "(shop)" chỉ là thư mục để sắp xếp code: nó không nằm trong URL nào.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
