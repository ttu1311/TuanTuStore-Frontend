import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon, { type IconName } from "@/components/ui/Icon";

// Các liên kết nhanh bắt đầu bằng "/" nên dùng được từ mọi trang.
// "/#id" nghĩa là: về trang chủ, rồi cuộn tới phần có id đó.
// Mục KHÔNG có `href` thì chưa có trang phía sau: nó hiển thị như chữ thường, không bao giờ giả làm liên kết.
type FooterItem = { label: string; href?: string };

const linkColumns: { title: string; links: FooterItem[] }[] = [
  {
    title: "Liên kết nhanh",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Đặc sản 3 miền", href: "/#ba-mien" },
      { label: "Hộp quà Ba Miền", href: "/hop-qua" },
      { label: "Bán chạy", href: "/#ban-chay" },
      { label: "Giới thiệu", href: "/#gioi-thieu" },
    ],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Hướng dẫn mua hàng", href: "/thong-tin/huong-dan-mua-hang" },
      { label: "Phương thức thanh toán", href: "/thong-tin/phuong-thuc-thanh-toan" },
      { label: "Theo dõi đơn hàng", href: "/tra-cuu-don-hang" }, // tra cứu bằng mã đơn + số điện thoại, không cần đăng nhập
      { label: "Câu hỏi thường gặp", href: "/thong-tin/cau-hoi-thuong-gap" },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Chính sách giao hàng", href: "/thong-tin/chinh-sach-giao-hang" },
      { label: "Đổi trả & hoàn tiền", href: "/thong-tin/doi-tra-hoan-tien" },
      { label: "Bảo mật thông tin", href: "/thong-tin/bao-mat-thong-tin" },
      { label: "Điều khoản sử dụng", href: "/thong-tin/dieu-khoan-su-dung" },
    ],
  },
];

// Chỉ thông tin liên hệ thật mới thuộc về đây. Số điện thoại và email hỗ trợ giữ chỗ đã được gỡ bỏ;
// khi có thông tin thật thì thêm lại vào danh sách này.
const contacts: { icon: IconName; text: string }[] = [
  { icon: "clock", text: "8:00 – 21:00, Thứ 2 – Chủ nhật" },
];

export default function Footer() {
  return (
    <footer id="lien-he" className="border-t border-line bg-paper pt-14 text-ink">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 min-[480px]:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr]">
          <div className="min-[480px]:col-span-2 xl:col-span-1">
            <SameRouteLink href="/" className="whitespace-nowrap font-display text-[32px] font-bold leading-none text-ink">
              TuanTuStore
            </SameRouteLink>
            <p className="mt-4 max-w-[320px] text-ink-muted">
              Cửa hàng đặc sản ba miền Việt Nam — chọn lọc kỹ, rõ nguồn gốc, mang hương vị quê nhà đến mọi gia đình.
            </p>
          </div>

          {linkColumns.map((column) => {
            // Một cột chỉ gồm chữ thường thì không phải là menu điều hướng
            const hasLinks = column.links.some((link) => link.href);
            const Wrapper = hasLinks ? "nav" : "div";
            return (
              <Wrapper key={column.title} aria-label={hasLinks ? column.title : undefined}>
                <h3 className="mb-4 text-base font-semibold text-ink">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        // Bấm khi đang ở đúng trang đó thì cuộn lên đầu trang
                        <SameRouteLink
                          href={link.href}
                          className="text-ink-muted transition-colors duration-200 hover:text-primary"
                        >
                          {link.label}
                        </SameRouteLink>
                      ) : (
                        <span className="text-ink-muted">{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Wrapper>
            );
          })}

          <div>
            <h3 className="mb-4 text-base font-semibold text-ink">Liên hệ</h3>
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.icon} className="flex gap-3 text-ink-muted">
                  <Icon name={contact.icon} size={16} className="mt-1 text-primary" />
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-line py-6 text-sm text-ink-muted md:flex-row">
          <span>© 2026 TuanTuStore. Bảo lưu mọi quyền.</span>
          {/* Tác giả và giấy phép của từng ảnh (CC BY-SA yêu cầu ghi rõ) */}
          <SameRouteLink href="/nguon-anh" className="transition-colors duration-200 hover:text-primary">
            Ảnh: Wikimedia Commons — tác giả và giấy phép
          </SameRouteLink>
        </div>
      </div>
    </footer>
  );
}
