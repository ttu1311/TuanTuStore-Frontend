"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { loginUrl } from "@/lib/redirect";

// Chỉ hiển thị nội dung cho người đã đăng nhập. Khách chưa đăng nhập bị chuyển tới /dang-nhap.
// Trong lúc localStorage đang được đọc, chỉ hiện thông báo đang tải, nên nội dung được bảo vệ không bị nháy lên.
// LƯU Ý: đây là bản demo front-end. Nó cải thiện trải nghiệm người dùng nhưng KHÔNG phải bảo mật thật.
export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { isReady, currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Đăng nhập xong thì quay lại đúng trang này (ví dụ /tai-khoan?tab=wishlist)
    if (isReady && !currentUser) router.replace(loginUrl(window.location.pathname + window.location.search));
  }, [isReady, currentUser, router]);

  if (!isReady || !currentUser) return <LoadingState />;
  return <>{children}</>;
}
