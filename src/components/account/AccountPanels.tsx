"use client";

import AccountCard from "@/components/account/AccountCard";
import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PassportSection from "@/components/account/PassportSection";
import PasswordSection from "@/components/account/PasswordSection";
import ProfileSection from "@/components/account/ProfileSection";
import WishlistSection from "@/components/account/WishlistSection";
import { useStore } from "@/context/StoreContext";

// Nội dung của từng trang /tai-khoan/...: lấy người đang đăng nhập rồi dựng đúng Section trong khung (AccountCard).
// Các trang (page.tsx) là server component nên không tự đọc được người dùng trong localStorage; chúng gọi các panel này.
// Luôn nằm trong <RequireLogin>, nên currentUser chắc chắn có; "if (!currentUser) return null" chỉ để TypeScript yên tâm.
// Bề rộng: lịch sử mua hàng, yêu thích, hộ chiếu dùng hết chiều rộng trang; thông tin cá nhân chia hai khung bằng nhau từ lg;
// đổi mật khẩu là một khung hẹp (AccountShell căn nó giữa trang).

export function ProfilePanel() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return (
    // Từ lg: hai khung bằng nhau, cao tự nhiên, căn đỉnh (items-start). Dưới lg: một cột, khung địa chỉ nằm dưới.
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <AccountCard>
        {/* key: form bắt đầu lại từ các giá trị đã lưu khi người dùng thay đổi */}
        <ProfileSection key={currentUser.id} user={currentUser} />
      </AccountCard>
      <AccountCard>
        <AddressSection key={`address-${currentUser.id}`} user={currentUser} />
      </AccountCard>
    </div>
  );
}

export function OrdersPanel() {
  const { currentUser } = useStore();
  return currentUser ? (
    <AccountCard>
      <OrdersSection userId={currentUser.id} />
    </AccountCard>
  ) : null;
}

export function WishlistPanel() {
  return (
    <AccountCard>
      <WishlistSection />
    </AccountCard>
  );
}

export function PassportPanel() {
  const { currentUser } = useStore();
  return currentUser ? (
    <AccountCard>
      <PassportSection userId={currentUser.id} />
    </AccountCard>
  ) : null;
}

export function PasswordPanel() {
  return (
    <AccountCard>
      <PasswordSection />
    </AccountCard>
  );
}
