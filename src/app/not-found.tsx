import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageLayout";
import SiteShell from "@/components/layout/SiteShell";
import NotFoundMessage from "@/components/ui/NotFoundMessage";

export const metadata: Metadata = { title: "Không tìm thấy trang — Đặc sản 3 Miền" };

// Hiển thị cho mọi địa chỉ không tồn tại. File này nằm ngoài nhóm (shop), nên tự dùng khung cửa hàng.
export default function NotFound() {
  return (
    <SiteShell>
      <PageContainer>
        <NotFoundMessage />
      </PageContainer>
    </SiteShell>
  );
}
