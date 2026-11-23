import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfilePanel } from "@/components/account/AccountPanels";

export const metadata: Metadata = {
  title: "Thông tin cá nhân — Đặc sản 3 Miền",
  description: "Xem và sửa thông tin cá nhân, địa chỉ giao hàng mặc định của bạn tại Đặc sản 3 Miền.",
};

// Địa chỉ cũ của các mục (khi chúng còn là tab): đường dẫn đã lưu, đã chia sẻ hay còn nằm trong ?next= vẫn mở đúng trang mới
const oldTabs: Record<string, string> = {
  orders: "/tai-khoan/lich-su-mua-hang",
  wishlist: "/tai-khoan/yeu-thich",
  passport: "/tai-khoan/ho-chieu",
};

type ProfilePageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { tab } = await searchParams;
  if (tab && Object.hasOwn(oldTabs, tab)) redirect(oldTabs[tab]);

  return <ProfilePanel />;
}
