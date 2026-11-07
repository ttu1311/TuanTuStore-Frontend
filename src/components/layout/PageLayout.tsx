import type { ReactNode } from "react";

// Chiều rộng của mọi trang cửa hàng: cùng mép trái và mép phải với Header và Footer.
export function PageContainer({ children, className = "py-10 lg:py-16" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-container px-4 md:px-6 lg:px-8 ${className}`}>{children}</div>;
}

type ContentSidebarProps = {
  children: ReactNode; // nội dung chính (trái)
  sidebar?: ReactNode; // nếu không có nó, nội dung đơn giản là chiếm toàn bộ chiều rộng
  sidebarLabel?: string; // tên truy cập (accessible name) của <aside>
  // Điện thoại và máy tính bảng hiển thị một cột. Mặc định sidebar nằm DƯỚI nội dung;
  // `sidebarFirst` đưa nó lên TRÊN nội dung (bộ lọc, menu tài khoản).
  sidebarFirst?: boolean;
  // Sidebar luôn nằm trong tầm nhìn khi nội dung cuộn (chỉ trên máy tính). Nếu nó cao hơn màn hình
  // thì nó tự cuộn bên trong, nên không có nội dung nào nằm ngoài tầm với. Chỉ dùng cho sidebar ngắn.
  sticky?: boolean;
};

// Bố cục các trang cửa hàng: Nội dung (khoảng 72%) với Sidebar (khoảng 28%) ở bên PHẢI từ 1024px trở lên.
// Dưới 1024px: một cột.
export default function ContentSidebar({ children, sidebar, sidebarLabel, sidebarFirst, sticky }: ContentSidebarProps) {
  if (!sidebar) return <div className="min-w-0">{children}</div>;

  return (
    // Một cột minmax(0,1fr) trên màn nhỏ: nếu không, cột ngầm định ("auto") phình theo nội dung rộng như băng trượt ngang
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,28%)] lg:gap-10">
      <div className="min-w-0">{children}</div>
      <aside
        aria-label={sidebarLabel}
        className={`min-w-0 ${sidebarFirst ? "order-first lg:order-none" : ""} ${
          // top-36: ngay dưới Header dính (thanh menu + thanh tìm kiếm)
          sticky ? "lg:sticky lg:top-36 lg:-mx-1 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:px-1" : ""
        }`}
      >
        {sidebar}
      </aside>
    </div>
  );
}
