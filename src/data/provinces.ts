// 34 tỉnh, thành phố sau sáp nhập (Nghị quyết 202/2025/QH15, hiệu lực từ 01/7/2025).
// Địa chỉ giao hàng có 2 cấp: Tỉnh/Thành phố → Xã/Phường/Đặc khu (không còn Quận/Huyện).
import { simplifyText } from "@/lib/text";

// Mỗi tỉnh MỘT tọa độ: trung tâm hành chính của tỉnh/thành mới (kinh độ °Đ, vĩ độ °B, làm tròn 2 chữ số).
// Vĩ độ dùng cho cột vĩ độ của tuyến "Bắc vào Nam" ở trang chủ và để xếp các tỉnh từ Bắc xuống Nam;
// cả tọa độ dùng cho chấm của tỉnh trên bản đồ, nên hai nơi luôn khớp nhau.
const provinceInfo: { name: string; center: string; longitude: number; latitude: number }[] = [
  { name: "Cao Bằng", center: "Cao Bằng", longitude: 106.25, latitude: 22.67 },
  { name: "Lai Châu", center: "Lai Châu", longitude: 103.46, latitude: 22.4 },
  { name: "Lạng Sơn", center: "Lạng Sơn", longitude: 106.76, latitude: 21.85 },
  { name: "Tuyên Quang", center: "Tuyên Quang", longitude: 105.21, latitude: 21.82 },
  { name: "Lào Cai", center: "Yên Bái", longitude: 104.87, latitude: 21.72 },
  { name: "Thái Nguyên", center: "Thái Nguyên", longitude: 105.85, latitude: 21.59 },
  { name: "Điện Biên", center: "Điện Biên Phủ", longitude: 103.02, latitude: 21.39 },
  { name: "Sơn La", center: "Sơn La", longitude: 103.91, latitude: 21.33 },
  { name: "Phú Thọ", center: "Việt Trì", longitude: 105.4, latitude: 21.32 },
  { name: "Bắc Ninh", center: "Bắc Giang", longitude: 106.19, latitude: 21.27 },
  { name: "Hà Nội", center: "Hà Nội", longitude: 105.85, latitude: 21.03 },
  { name: "Quảng Ninh", center: "Hạ Long", longitude: 107.08, latitude: 20.95 },
  { name: "Hải Phòng", center: "Hải Phòng", longitude: 106.68, latitude: 20.86 },
  { name: "Hưng Yên", center: "Hưng Yên", longitude: 106.05, latitude: 20.65 },
  { name: "Ninh Bình", center: "Ninh Bình", longitude: 105.97, latitude: 20.25 },
  { name: "Thanh Hóa", center: "Thanh Hóa", longitude: 105.78, latitude: 19.81 },
  { name: "Nghệ An", center: "Vinh", longitude: 105.68, latitude: 18.68 },
  { name: "Hà Tĩnh", center: "Hà Tĩnh", longitude: 105.9, latitude: 18.34 },
  { name: "Quảng Trị", center: "Đồng Hới", longitude: 106.6, latitude: 17.47 },
  { name: "Huế", center: "Huế", longitude: 107.59, latitude: 16.46 },
  { name: "Đà Nẵng", center: "Đà Nẵng", longitude: 108.21, latitude: 16.05 },
  { name: "Quảng Ngãi", center: "Quảng Ngãi", longitude: 108.8, latitude: 15.12 },
  { name: "Gia Lai", center: "Quy Nhơn", longitude: 109.22, latitude: 13.78 },
  { name: "Đắk Lắk", center: "Buôn Ma Thuột", longitude: 108.04, latitude: 12.67 },
  { name: "Khánh Hòa", center: "Nha Trang", longitude: 109.19, latitude: 12.24 },
  { name: "Lâm Đồng", center: "Đà Lạt", longitude: 108.44, latitude: 11.94 },
  { name: "Đồng Nai", center: "Biên Hòa", longitude: 106.82, latitude: 10.95 },
  { name: "Hồ Chí Minh", center: "TP. Hồ Chí Minh", longitude: 106.7, latitude: 10.78 },
  { name: "Tây Ninh", center: "Tân An", longitude: 106.41, latitude: 10.54 },
  { name: "Đồng Tháp", center: "Mỹ Tho", longitude: 106.36, latitude: 10.36 },
  { name: "Vĩnh Long", center: "Vĩnh Long", longitude: 105.97, latitude: 10.25 },
  { name: "Cần Thơ", center: "Cần Thơ", longitude: 105.78, latitude: 10.03 },
  { name: "An Giang", center: "Rạch Giá", longitude: 105.08, latitude: 10.01 },
  { name: "Cà Mau", center: "Cà Mau", longitude: 105.15, latitude: 9.18 },
];

// Tên 34 tỉnh, xếp A → Z (cho danh sách chọn)
export const provinces = provinceInfo.map((info) => info.name).sort((a, b) => a.localeCompare(b, "vi"));

// 29 tỉnh cũ đã sáp nhập -> tỉnh/thành mới, và vài cách viết khác thường gặp.
// Để sản phẩm Admin còn ghi tên cũ (ví dụ "Bến Tre") vẫn được gom đúng vào tỉnh mới.
const oldNames: Record<string, string> = {
  "Hà Giang": "Tuyên Quang",
  "Yên Bái": "Lào Cai",
  "Bắc Kạn": "Thái Nguyên",
  "Vĩnh Phúc": "Phú Thọ",
  "Hòa Bình": "Phú Thọ",
  "Bắc Giang": "Bắc Ninh",
  "Thái Bình": "Hưng Yên",
  "Hải Dương": "Hải Phòng",
  "Hà Nam": "Ninh Bình",
  "Nam Định": "Ninh Bình",
  "Quảng Bình": "Quảng Trị",
  "Quảng Nam": "Đà Nẵng",
  "Kon Tum": "Quảng Ngãi",
  "Bình Định": "Gia Lai",
  "Phú Yên": "Đắk Lắk",
  "Ninh Thuận": "Khánh Hòa",
  "Đắk Nông": "Lâm Đồng",
  "Bình Thuận": "Lâm Đồng",
  "Bình Phước": "Đồng Nai",
  "Bình Dương": "Hồ Chí Minh",
  "Bà Rịa - Vũng Tàu": "Hồ Chí Minh",
  "Long An": "Tây Ninh",
  "Tiền Giang": "Đồng Tháp",
  "Bến Tre": "Vĩnh Long",
  "Trà Vinh": "Vĩnh Long",
  "Sóc Trăng": "Cần Thơ",
  "Hậu Giang": "Cần Thơ",
  "Bạc Liêu": "Cà Mau",
  "Kiên Giang": "An Giang",
  // Cách viết khác
  "Thừa Thiên Huế": "Huế",
  "Sài Gòn": "Hồ Chí Minh",
  "TP HCM": "Hồ Chí Minh",
};

// So khớp không tính dấu, hoa/thường và tiền tố "Tỉnh", "Thành phố", "TP."
function provinceKey(name: string) {
  return simplifyText(name)
    .replace(/^(tinh|thanh pho|tp\.?)\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const byKey = new Map<string, string>([
  ...provinceInfo.map((info): [string, string] => [provinceKey(info.name), info.name]),
  ...Object.entries(oldNames).map(([old, now]): [string, string] => [provinceKey(old), now]),
]);

// "Bến Tre" -> "Vĩnh Long", "tp. hồ chí minh" -> "Hồ Chí Minh", "Đà Nẵng" -> "Đà Nẵng".
// Tên không nhận ra (nơi ngoài 34 tỉnh, gõ sai…) được trả lại nguyên văn.
export function normalizeProvince(name: string) {
  return byKey.get(provinceKey(name)) ?? name.trim();
}

function findProvince(name: string) {
  const now = normalizeProvince(name);
  return provinceInfo.find((info) => info.name === now);
}

// Vĩ độ của một tỉnh (tên mới hoặc cũ). undefined = không nhận ra tỉnh, nên không bao giờ hiện một con số đoán mò.
export function provinceLatitude(name: string) {
  return findProvince(name)?.latitude;
}

// [kinh độ, vĩ độ] của trung tâm tỉnh, cho bản đồ. undefined = không nhận ra tỉnh.
export function provinceLocation(name: string): [longitude: number, latitude: number] | undefined {
  const info = findProvince(name);
  return info && [info.longitude, info.latitude];
}

// Danh sách Xã/Phường/Đặc khu của một tỉnh. CHƯA CÓ dữ liệu đã kiểm chứng sau sáp nhập, nên luôn trả về null
// và form hiện ô gõ tay. Khi có dữ liệu chính thức: trả về mảng tên ở đây, form tự đổi sang danh sách chọn
// (xem WardField trong src/components/address/AddressFields.tsx), không phải sửa chỗ nào khác.
export function wardOptions(province: string): string[] | null {
  void province;
  return null;
}
