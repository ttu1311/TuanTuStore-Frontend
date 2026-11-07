import StoreStats from "@/components/home/StoreStats";
import Icon, { type IconName } from "@/components/ui/Icon";

const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "award",
    title: "Sản phẩm chọn lọc",
    text: "Mỗi món đều được nếm thử và chọn từ cơ sở làm nghề lâu năm tại địa phương.",
  },
  {
    icon: "pin",
    title: "Nguồn gốc rõ ràng",
    text: "Ghi rõ vùng sản xuất và nơi làm ra trên từng sản phẩm.",
  },
  {
    icon: "truck",
    title: "Giao hàng tiện lợi",
    text: "Đóng gói cẩn thận, giao tận nơi và theo dõi đơn hàng dễ dàng.",
  },
  {
    icon: "headset",
    title: "Hỗ trợ khách hàng",
    text: "Tư vấn chọn quà phù hợp và giải đáp thắc mắc về sản phẩm, đơn hàng.",
  },
];

// "Mua đặc sản an tâm": số liệu cửa hàng và thông tin hữu ích ở Sidebar trang chủ (mục menu "Giới thiệu" mở tới đây)
export default function TrustSection() {
  return (
    <section id="gioi-thieu" aria-labelledby="trust-title" className="rounded-lg bg-surface p-5">
      <h2 id="trust-title" className="font-display text-2xl font-bold leading-none text-ink">
        Mua đặc sản an tâm
      </h2>
      {/* Số liệu thật của cửa hàng, chạy lên khi cuộn tới */}
      <StoreStats />
      <ul className="mt-5 space-y-5">
        {benefits.map((item) => (
          <li key={item.title} className="flex gap-3">
            <Icon name={item.icon} size={22} className="mt-0.5 text-primary" />
            <div>
              <h3 className="font-semibold leading-snug text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
