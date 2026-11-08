"use client";

import { provinces, wardOptions } from "@/data/provinces";
import { ADDRESS_MAX_LENGTH, type AddressErrors } from "@/lib/address";
import type { SavedAddress } from "@/types";

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#686D69] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

type AddressFieldsProps = {
  idPrefix: string; // id của các ô: `${idPrefix}province`, `${idPrefix}ward`, `${idPrefix}street`
  value: SavedAddress;
  errors: AddressErrors;
  onChange: (field: keyof SavedAddress, value: string) => void;
};

// Ba ô địa chỉ 2 cấp: Tỉnh/Thành phố (chọn trong 34 tỉnh) → Xã/Phường/Đặc khu → Số nhà, tên đường.
// Đặt trong một lưới 2 cột (sm:grid-cols-2) của form cha.
export default function AddressFields({ idPrefix, value, errors, onChange }: AddressFieldsProps) {
  const id = (field: keyof SavedAddress) => `${idPrefix}${field}`;
  const describedBy = (field: keyof SavedAddress) => (errors[field] ? `${id(field)}-error` : undefined);
  const error = (field: keyof SavedAddress) =>
    errors[field] && (
      <p id={`${id(field)}-error`} className="mt-1.5 text-sm text-sale">
        {errors[field]}
      </p>
    );

  return (
    <>
      <div>
        <label htmlFor={id("province")} className="mb-2 block font-medium text-ink">
          Tỉnh / Thành phố
        </label>
        <select
          id={id("province")}
          value={value.province}
          autoComplete="address-level1"
          onChange={(event) => {
            onChange("province", event.target.value);
            // Đổi tỉnh thì xã/phường cũ không còn đúng (khi đã có danh sách chọn)
            if (wardOptions(event.target.value)) onChange("ward", "");
          }}
          aria-invalid={errors.province ? true : undefined}
          aria-describedby={describedBy("province")}
          className={`${fieldStyle} ${errors.province ? fieldBad : fieldOk}`}
        >
          <option value="">Chọn tỉnh / thành phố</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        {error("province")}
      </div>

      <WardField
        id={id("ward")}
        province={value.province}
        value={value.ward}
        invalid={Boolean(errors.ward)}
        describedBy={describedBy("ward")}
        onChange={(ward) => onChange("ward", ward)}
      >
        {error("ward")}
      </WardField>

      <div className="sm:col-span-2">
        <label htmlFor={id("street")} className="mb-2 block font-medium text-ink">
          Số nhà, tên đường
        </label>
        <input
          id={id("street")}
          value={value.street}
          maxLength={ADDRESS_MAX_LENGTH.street}
          autoComplete="street-address"
          placeholder="Ví dụ: 12 Lê Lợi, ấp 3"
          onChange={(event) => onChange("street", event.target.value)}
          aria-invalid={errors.street ? true : undefined}
          aria-describedby={describedBy("street")}
          className={`${fieldStyle} ${errors.street ? fieldBad : fieldOk}`}
        />
        {error("street")}
      </div>
    </>
  );
}

type WardFieldProps = {
  id: string;
  province: string;
  value: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  children?: React.ReactNode; // thông báo lỗi
};

// Xã / Phường / Đặc khu. Hiện là ô gõ tay vì chưa có danh sách đã kiểm chứng sau sáp nhập.
// Khi wardOptions() (src/data/provinces.ts) trả về danh sách, ô này tự thành danh sách chọn.
function WardField({ id, province, value, invalid, describedBy, onChange, children }: WardFieldProps) {
  const options = wardOptions(province);
  const className = `${fieldStyle} ${invalid ? fieldBad : fieldOk}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-medium text-ink">
        Xã / Phường / Đặc khu
      </label>
      {options ? (
        <select
          id={id}
          value={value}
          disabled={!province}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={className}
        >
          <option value="">{province ? "Chọn xã / phường" : "Chọn tỉnh trước"}</option>
          {options.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          value={value}
          maxLength={ADDRESS_MAX_LENGTH.ward}
          autoComplete="address-level2"
          placeholder="Ví dụ: Phường Bến Thành"
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={className}
        />
      )}
      {children}
    </div>
  );
}
