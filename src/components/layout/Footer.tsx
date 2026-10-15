import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

// Quick links start with "/" so they work from any page.
// "/#id" means: go to the homepage, then scroll to the section with that id.
// An item WITHOUT `href` has no page behind it yet: it is shown as plain text, never as a fake link.
type FooterItem = { label: string; href?: string };

const linkColumns: { title: string; links: FooterItem[] }[] = [
  {
    title: "Liên kết nhanh",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Đặc sản 3 miền", href: "/#ba-mien" },
      { label: "Bán chạy", href: "/#ban-chay" },
      { label: "Giới thiệu", href: "/#gioi-thieu" },
    ],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Hướng dẫn mua hàng" },
      { label: "Phương thức thanh toán" },
      { label: "Theo dõi đơn hàng", href: "/tai-khoan?tab=orders" }, // the order list in the customer's account
      { label: "Câu hỏi thường gặp" },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Chính sách giao hàng" },
      { label: "Đổi trả & hoàn tiền" },
      { label: "Bảo mật thông tin" },
      { label: "Điều khoản sử dụng" },
    ],
  },
];

// Only real contact details belong here. The placeholder phone number and support email were removed;
// add the real ones back to this list when they are known.
const contacts: { icon: IconName; text: string }[] = [
  { icon: "clock", text: "8:00 – 21:00, Thứ 2 – Chủ nhật" },
];

export default function Footer() {
  return (
    <footer id="lien-he" className="bg-footer pt-16 text-footer-text">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 min-[480px]:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr]">
          <div className="min-[480px]:col-span-2 xl:col-span-1">
            <Link href="/" className="whitespace-nowrap font-display text-[32px] font-bold leading-none text-white">
              TuanTuStore
            </Link>
            <p className="mt-4 max-w-[320px] text-footer-muted">
              Cửa hàng đặc sản ba miền Việt Nam — chọn lọc kỹ, rõ nguồn gốc, mang hương vị quê nhà đến mọi gia đình.
            </p>
          </div>

          {linkColumns.map((column) => {
            // A column made only of plain text is not a navigation menu
            const hasLinks = column.links.some((link) => link.href);
            const Wrapper = hasLinks ? "nav" : "div";
            return (
              <Wrapper key={column.title} aria-label={hasLinks ? column.title : undefined}>
                <h3 className="mb-4 text-base font-semibold text-white">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link href={link.href} className="text-footer-muted transition-colors duration-200 hover:text-white">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-footer-muted">{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Wrapper>
            );
          })}

          <div>
            <h3 className="mb-4 text-base font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.icon} className="flex gap-3 text-footer-muted">
                  <Icon name={contact.icon} size={16} className="mt-1 text-gold-light" />
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-white/[0.12] py-6 text-sm text-footer-muted md:flex-row">
          <span>© 2026 TuanTuStore. Bảo lưu mọi quyền.</span>
          <span>Ảnh: Wikimedia Commons</span>
        </div>
      </div>
    </footer>
  );
}
