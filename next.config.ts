import type { NextConfig } from "next";

// Các địa chỉ được phép mở server PHÁT TRIỂN (`npm run dev`), ngoài http://localhost.
// Điện thoại cùng Wi-Fi mở web bằng địa chỉ mạng nội bộ của máy tính, ví dụ http://192.168.1.20:3000.
// Nếu thiếu danh sách này, Next.js chặn các địa chỉ đó khi chạy dev và trang không bao giờ tải xong
// (cứ hiện "Đang tải…"). `npm run build` + `npm run start` thì không cần.
const privateNetworkAddresses = [
  "192.168.*.*", // hầu hết router gia đình và điểm phát Wi-Fi từ điện thoại
  "10.*.*.*", // nhiều mạng trường học và công ty
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`), // 172.16.0.0 – 172.31.255.255
  "*.local", // tên máy tính dạng my-mac.local
];

const nextConfig: NextConfig = {
  // Đưa <title> của trang vào HTML đầu tiên (thay vì gửi bổ sung sau).
  // Riêng trang sản phẩm tự hiển thị <title> mang tên sản phẩm: xem src/app/(shop)/san-pham/[id]/page.tsx.
  htmlLimitedBots: /.*/,
  allowedDevOrigins: privateNetworkAddresses,
  // Ẩn nút tròn "N" (công cụ dev của Next.js) ở góc dưới bên trái khi chạy `npm run dev`: chỗ đó là nút nhạc nền.
  // Bảng báo lỗi của Next.js vẫn hiện khi có lỗi. Bản build / Vercel không có nút này.
  devIndicators: false,
  // Trang /lien-he (form "Yêu cầu gọi lại") đã bỏ: link cũ và bookmark đi tới phần liên hệ ở footer (id="lien-he"), không ra 404.
  // Tạm thời (307), không phải vĩnh viễn, để trình duyệt không nhớ mãi chuyển hướng này.
  async redirects() {
    return [{ source: "/lien-he", destination: "/#lien-he", permanent: false }];
  },
};

export default nextConfig;
