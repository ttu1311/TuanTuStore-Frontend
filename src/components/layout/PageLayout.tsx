import type { ReactNode } from "react";

// Chiều rộng của mọi trang cửa hàng: cùng mép trái và mép phải với Header và Footer.
export function PageContainer({ children, className = "py-10 lg:py-16" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-container px-4 md:px-6 lg:px-8 ${className}`}>{children}</div>;
}

type ContentSidebarProps = {
  children: ReactNode; // nội dung chính (trái)
  sidebar: ReactNode;
  sidebarLabel?: string; // tên truy cập (accessible name) của <aside>
  // Điện thoại và máy tính bảng hiển thị một cột. Mặc định sidebar nằm DƯỚI nội dung;
  // `sidebarFirst` đưa nó lên TRÊN nội dung (bộ lọc). Khi đó sidebar cũng đứng TRƯỚC nội dung trong HTML, nên thứ tự đọc
  // và thứ tự Tab khớp với thứ tự nhìn thấy; từ 1024px CSS vẫn đặt nó ở cột bên phải.
  sidebarFirst?: boolean;
  // Sidebar luôn nằm trong tầm nhìn khi nội dung cuộn (chỉ trên máy tính). Nếu nó cao hơn màn hình
  // thì nó tự cuộn bên trong, nên không có nội dung nào nằm ngoài tầm với. Chỉ dùng cho sidebar ngắn.
  sticky?: boolean;
};

// Bố cục các trang cửa hàng: Nội dung (khoảng 72%) với Sidebar (khoảng 28%) ở bên PHẢI từ 1024px trở lên.
// Dưới 1024px: một cột.
export default function ContentSidebar({ children, sidebar, sidebarLabel, sidebarFirst, sticky }: ContentSidebarProps) {
  const aside = (
    <aside
      aria-label={sidebarLabel}
      // sidebarFirst: đứng trước trong HTML (đọc và Tab trước); từ lg đưa về cột phải bằng col-start-2 + row-start-1
      className={`min-w-0 ${sidebarFirst ? "lg:col-start-2 lg:row-start-1" : ""} ${
        // top-36: ngay dưới Header dính (thanh menu + thanh tìm kiếm)
        sticky ? "lg:sticky lg:top-36 lg:-mx-1 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:px-1" : ""
      }`}
    >
      {sidebar}
    </aside>
  );

  return (
    // Một cột minmax(0,1fr) trên màn nhỏ: nếu không, cột ngầm định ("auto") phình theo nội dung rộng (bảng, hàng tab cuộn ngang)
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,28%)] lg:gap-10">
      {sidebarFirst && aside}
      <div className={`min-w-0 ${sidebarFirst ? "lg:col-start-1 lg:row-start-1" : ""}`}>{children}</div>
      {!sidebarFirst && aside}
    </div>
  );
}
