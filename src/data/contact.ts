// Thông tin liên hệ của cửa hàng: NƠI DUY NHẤT để sửa. Footer, trang /lien-he và các trang hỗ trợ đều đọc từ đây.
import type { IconName } from "@/components/ui/Icon";

export const storeContact = {
  phone: "0969087677", // dùng cho liên kết gọi (tel:) và Zalo
  phoneDisplay: "0969 087 677", // cách hiển thị cho dễ đọc
  email: "votuantu184@gmail.com",
  zalo: "https://zalo.me/0969087677",
  facebook: "", // để trống thì không hiện; điền link trang Facebook (https://facebook.com/...) để hiện
  hours: "8:00 – 21:00, Thứ 2 – Chủ nhật",
};

export type ContactChannel = {
  icon: IconName;
  label: string; // ví dụ "Gọi điện"
  value: string; // ví dụ "0969 087 677"
  footerText: string; // chữ ngắn hiện ở footer
  href: string;
  external?: boolean; // mở ở tab mới (Zalo, Facebook)
};

// Các cách liên hệ trực tiếp, theo thứ tự hiển thị. Kênh nào chưa có link thì không hiện.
const allChannels: ContactChannel[] = [
  {
    icon: "phone",
    label: "Gọi điện",
    value: storeContact.phoneDisplay,
    footerText: storeContact.phoneDisplay,
    href: `tel:${storeContact.phone}`,
  },
  {
    icon: "chat",
    label: "Nhắn Zalo",
    value: storeContact.phoneDisplay,
    footerText: `Zalo: ${storeContact.phoneDisplay}`,
    href: storeContact.zalo,
    external: true,
  },
  {
    icon: "mail",
    label: "Gửi email",
    value: storeContact.email,
    footerText: storeContact.email,
    href: `mailto:${storeContact.email}`,
  },
  {
    icon: "user",
    label: "Facebook",
    value: "Nhắn tin qua Facebook",
    footerText: "Facebook",
    href: storeContact.facebook,
    external: true,
  },
];

export const contactChannels = allChannels.filter((channel) => channel.href !== "");
