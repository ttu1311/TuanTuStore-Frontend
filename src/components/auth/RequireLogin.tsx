"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { loginUrl } from "@/lib/redirect";
import { beginSignOut, isSigningOut } from "@/lib/signOut";

// Đăng xuất NGAY, không hỏi lại, rồi về trang chủ (router.replace: nút Back không quay lại trang cần đăng nhập).
// Đứng ở trang cần đăng nhập thì bật cờ "đang đăng xuất" trước (xem src/lib/signOut.ts) để RequireLogin không chuyển sang
// /dang-nhap. Đã ở trang chủ thì không có gì để chuyển đi và không có RequireLogin nào đang mở, nên không bật cờ
// (cờ chỉ được tắt khi đường dẫn đổi thành "/", mà ở trang chủ đường dẫn sẽ không đổi nữa).
export function useSignOutToHome() {
  const { logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  return function signOutToHome() {
    if (pathname === "/") return logout();
    beginSignOut();
    router.replace("/");
    logout();
  };
}

// Chỉ hiển thị nội dung cho người đã đăng nhập. Khách chưa đăng nhập bị chuyển tới /dang-nhap.
// Trong lúc localStorage đang được đọc, chỉ hiện thông báo đang tải, nên nội dung được bảo vệ không bị nháy lên.
// LƯU Ý: đây là bản demo front-end. Nó cải thiện trải nghiệm người dùng nhưng KHÔNG phải bảo mật thật.
export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { isReady, currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Đang đăng xuất chủ động: trang chủ đang được mở, đừng chuyển sang /dang-nhap
    if (!isReady || currentUser || isSigningOut()) return;
    // Đăng nhập xong thì quay lại đúng trang này (ví dụ /tai-khoan/yeu-thich)
    router.replace(loginUrl(window.location.pathname + window.location.search));
  }, [isReady, currentUser, router]);

  if (!isReady || !currentUser) return <LoadingState />;
  return <>{children}</>;
}
