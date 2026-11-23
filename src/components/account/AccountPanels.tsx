"use client";

import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PassportSection from "@/components/account/PassportSection";
import PasswordSection from "@/components/account/PasswordSection";
import ProfileSection from "@/components/account/ProfileSection";
import WishlistSection from "@/components/account/WishlistSection";
import { useStore } from "@/context/StoreContext";

// Nội dung của từng trang /tai-khoan/...: lấy người đang đăng nhập rồi dựng đúng Section.
// Các trang (page.tsx) là server component nên không tự đọc được người dùng trong localStorage; chúng gọi các panel này.
// Luôn nằm trong <RequireLogin>, nên currentUser chắc chắn có; "if (!currentUser) return null" chỉ để TypeScript yên tâm.

export function ProfilePanel() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return (
    <>
      {/* key: form bắt đầu lại từ các giá trị đã lưu khi người dùng thay đổi */}
      <ProfileSection key={currentUser.id} user={currentUser} />
      <AddressSection key={`address-${currentUser.id}`} user={currentUser} />
    </>
  );
}

export function OrdersPanel() {
  const { currentUser } = useStore();
  return currentUser ? <OrdersSection userId={currentUser.id} /> : null;
}

export function WishlistPanel() {
  return <WishlistSection />;
}

export function PassportPanel() {
  const { currentUser } = useStore();
  return currentUser ? <PassportSection userId={currentUser.id} /> : null;
}

export function PasswordPanel() {
  return <PasswordSection />;
}
