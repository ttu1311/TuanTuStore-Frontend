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
  // Trang sản phẩm sẽ đặt tên sản phẩm thật lên tab sau khi đọc localStorage,
  // và về sau không có gì ghi đè lên nó.
  htmlLimitedBots: /.*/,
  allowedDevOrigins: privateNetworkAddresses,
};

export default nextConfig;
