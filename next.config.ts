import type { NextConfig } from "next";

// Addresses that may open the DEVELOPMENT server (`npm run dev`) besides http://localhost.
// A phone on the same Wi-Fi opens it by the computer's LAN address, e.g. http://192.168.1.20:3000.
// Without this list Next.js blocks such an address in development and the page never finishes loading
// (it stays on "Đang tải…"). `npm run build` + `npm run start` do not need it.
const privateNetworkAddresses = [
  "192.168.*.*", // most home routers and phone hotspots
  "10.*.*.*", // many campus and company networks
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`), // 172.16.0.0 – 172.31.255.255
  "*.local", // computer names such as my-mac.local
];

const nextConfig: NextConfig = {
  // Put the page <title> in the first HTML (instead of streaming it in later).
  // The product page then sets the real product name in the tab after reading localStorage,
  // and nothing overwrites it afterwards.
  htmlLimitedBots: /.*/,
  allowedDevOrigins: privateNetworkAddresses,
};

export default nextConfig;
