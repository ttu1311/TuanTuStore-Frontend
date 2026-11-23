// Khung nội dung của trang tài khoản: nền trắng, viền, bo góc. Mỗi khung là một nhóm việc riêng
// (xem AccountPanels.tsx); trang Thông tin cá nhân có hai khung cạnh nhau.
export default function AccountCard({ children }: { children: React.ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-line bg-white p-6 md:p-8">{children}</section>;
}
