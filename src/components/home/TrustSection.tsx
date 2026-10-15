import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";

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

export default function TrustSection() {
  return (
    <section id="gioi-thieu" aria-labelledby="trust-title" className="border-t border-line py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <SectionHeader id="trust-title" title="Mua đặc sản an tâm" />
        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <li key={item.title}>
              <Icon name={item.icon} size={28} className="text-primary" />
              <h3 className="mt-4 text-lg font-semibold leading-snug">{item.title}</h3>
              <p className="mt-2 max-w-[32ch] text-ink-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
