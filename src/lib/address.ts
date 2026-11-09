// Địa chỉ giao hàng 2 cấp (Tỉnh/Thành phố → Xã/Phường/Đặc khu): kiểm tra và hiển thị.
// Dùng chung cho trang thanh toán và "Địa chỉ mặc định" trong trang tài khoản.
import { provinces } from "@/data/provinces";
import type { SavedAddress } from "@/types";

export const ADDRESS_MAX_LENGTH: Record<keyof SavedAddress, number> = { province: 100, ward: 100, street: 200 };

export type AddressErrors = Partial<Record<keyof SavedAddress, string>>;

export function isKnownProvince(province: string) {
  return (provinces as readonly string[]).includes(province);
}

export function validateAddress(address: SavedAddress): AddressErrors {
  const errors: AddressErrors = {};
  if (address.province.trim() === "") errors.province = "Vui lòng chọn tỉnh / thành phố";
  else if (!isKnownProvince(address.province)) errors.province = "Vui lòng chọn tỉnh / thành phố trong danh sách";
  if (address.ward.trim() === "") errors.ward = "Vui lòng nhập xã / phường / đặc khu";
  if (address.street.trim() === "") errors.street = "Vui lòng nhập số nhà, tên đường";
  for (const field of Object.keys(ADDRESS_MAX_LENGTH) as (keyof SavedAddress)[]) {
    if (!errors[field] && address[field].trim().length > ADDRESS_MAX_LENGTH[field]) {
      errors[field] = `Tối đa ${ADDRESS_MAX_LENGTH[field]} ký tự`;
    }
  }
  return errors;
}

export function cleanAddress(address: SavedAddress): SavedAddress {
  return { province: address.province.trim(), ward: address.ward.trim(), street: address.street.trim() };
}

export const emptyAddress: SavedAddress = { province: "", ward: "", street: "" };

// "12 Lê Lợi, Phường Bến Thành, Hồ Chí Minh". Đơn cũ còn quận/huyện thì vẫn hiện đủ.
export function formatAddress(parts: { street: string; ward: string; district?: string; province: string }) {
  return [parts.street, parts.ward, parts.district, parts.province].filter(Boolean).join(", ");
}
