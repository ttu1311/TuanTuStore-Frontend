import AccountShell from "@/components/account/AccountShell";
import { PageContainer } from "@/components/layout/PageLayout";

// Khung chung của mọi trang /tai-khoan/...: mỗi mục là một trang riêng (địa chỉ riêng, <title> riêng).
// Tiêu đề, việc chỉ cho người đã đăng nhập và độ rộng nội dung do AccountShell lo.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <AccountShell>{children}</AccountShell>
    </PageContainer>
  );
}
