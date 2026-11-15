// 34 tỉnh, thành phố sau sáp nhập (Nghị quyết 202/2025/QH15, hiệu lực từ 01/7/2025).
// Địa chỉ giao hàng có 2 cấp: Tỉnh/Thành phố → Xã/Phường/Đặc khu (không còn Quận/Huyện).
import { simplifyText } from "@/lib/text";

// Tên 34 tỉnh, thành phố mới (tên sau sáp nhập).
const provinceInfo: { name: string }[] = [
  { name: "Cao Bằng" },
  { name: "Lai Châu" },
  { name: "Lạng Sơn" },
  { name: "Tuyên Quang" },
  { name: "Lào Cai" },
  { name: "Thái Nguyên" },
  { name: "Điện Biên" },
  { name: "Sơn La" },
  { name: "Phú Thọ" },
  { name: "Bắc Ninh" },
  { name: "Hà Nội" },
  { name: "Quảng Ninh" },
  { name: "Hải Phòng" },
  { name: "Hưng Yên" },
  { name: "Ninh Bình" },
  { name: "Thanh Hóa" },
  { name: "Nghệ An" },
  { name: "Hà Tĩnh" },
  { name: "Quảng Trị" },
  { name: "Huế" },
  { name: "Đà Nẵng" },
  { name: "Quảng Ngãi" },
  { name: "Gia Lai" },
  { name: "Đắk Lắk" },
  { name: "Khánh Hòa" },
  { name: "Lâm Đồng" },
  { name: "Đồng Nai" },
  { name: "Hồ Chí Minh" },
  { name: "Tây Ninh" },
  { name: "Đồng Tháp" },
  { name: "Vĩnh Long" },
  { name: "Cần Thơ" },
  { name: "An Giang" },
  { name: "Cà Mau" },
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

// Danh sách Xã/Phường/Đặc khu của một tỉnh. CHƯA CÓ dữ liệu đã kiểm chứng sau sáp nhập, nên luôn trả về null
// và form hiện ô gõ tay. Khi có dữ liệu chính thức: trả về mảng tên ở đây, form tự đổi sang danh sách chọn
// (xem WardField trong src/components/address/AddressFields.tsx), không phải sửa chỗ nào khác.
export function wardOptions(province: string): string[] | null {
  void province;
  return null;
}
