import Logo from "@/components/brand/Logo";
import SameRouteLink from "@/components/layout/SameRouteLink";
import Icon from "@/components/ui/Icon";
import { contactChannels, storeContact } from "@/data/contact";

// Các liên kết nhanh bắt đầu bằng "/" nên dùng được từ mọi trang.
// "/#id" nghĩa là: về trang chủ, rồi cuộn tới phần có id đó.
// Mục KHÔNG có `href` thì chưa có trang phía sau: nó hiển thị như chữ thường, không bao giờ giả làm liên kết.
type FooterItem = { label: string; href?: string };

const linkColumns: { title: string; links: FooterItem[] }[] = [
  {
    title: "Liên kết nhanh",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/#gioi-thieu" },
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Đặc sản 3 miền", href: "/#ba-mien" },
      { label: "Hộp quà Ba Miền", href: "/hop-qua" },
      { label: "Bản đồ đặc sản", href: "/ban-do" },
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


export default function Footer() {
  return (
    <footer id="lien-he" className="border-t border-line bg-paper pt-14 text-ink">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 min-[480px]:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr]">
          <div className="min-[480px]:col-span-2 xl:col-span-1">
            <SameRouteLink href="/" aria-label="Đặc sản 3 Miền — Trang chủ" className="inline-flex rounded-md">
              <Logo />
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
            {/* Thông tin liên hệ nằm ở src/data/contact.ts */}
            <ul className="space-y-2">
              {contactChannels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex gap-3 break-all text-ink-muted transition-colors duration-200 hover:text-primary"
                  >
                    <Icon name={channel.icon} size={16} className="mt-1 text-primary" />
                    <span>
                      <span className="sr-only">{channel.label}: </span>
                      {channel.footerText}
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex gap-3 text-ink-muted">
                <Icon name="clock" size={16} className="mt-1 text-primary" />
                <span>{storeContact.hours}</span>
              </li>
            </ul>
            <SameRouteLink
              href="/lien-he"
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary transition-colors duration-200 hover:underline"
            >
              Gửi yêu cầu gọi lại →
            </SameRouteLink>
          </div>
        </div>

        <div className="border-t border-line py-6 text-sm text-ink-muted">
          <span>© 2026 Đặc sản 3 Miền. Bảo lưu mọi quyền.</span>
        </div>
      </div>
    </footer>
  );
}
