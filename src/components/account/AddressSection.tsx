"use client";

import { useState } from "react";
import AddressFields from "@/components/address/AddressFields";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { emptyAddress, validateAddress, type AddressErrors } from "@/lib/address";
import type { SavedAddress, User } from "@/types";

// Địa chỉ giao hàng mặc định. Khi thanh toán, "Mua cho bản thân" dùng địa chỉ này, không phải nhập lại.
export default function AddressSection({ user }: { user: User }) {
  const { updateAddress } = useStore();
  const [address, setAddress] = useState<SavedAddress>(user.address ?? emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  function handleChange(field: keyof SavedAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setSuccess(false);
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);
    setSaveError("");

    const newErrors = validateAddress(address);
    setErrors(newErrors);
    const firstInvalid = (["province", "ward", "street"] as const).find((field) => newErrors[field]);
    if (firstInvalid) return document.getElementById(`default-${firstInvalid}`)?.focus();

    const result = updateAddress(address);
    if (result.ok) setSuccess(true);
    else setSaveError(result.message);
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-labelledby="address-title" className="mt-10 border-t border-line pt-8">
      <h2 id="address-title" className="font-display text-2xl font-semibold text-ink">
        Địa chỉ giao hàng mặc định
      </h2>
      <p className="mt-1 text-ink-muted">
        Dùng khi bạn chọn “Mua cho bản thân” lúc thanh toán, để không phải nhập lại mỗi lần đặt hàng.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <AddressFields idPrefix="default-" value={address} errors={errors} onChange={handleChange} />
      </div>
      <button type="submit" className={`${btnBase} ${btnPrimary} mt-5`}>
        {user.address ? "Lưu địa chỉ" : "Thêm địa chỉ"}
      </button>
      {saveError && (
        <p role="alert" className="mt-4 text-sm text-sale">
          {saveError}
        </p>
      )}
      {success && (
        <p role="status" className="mt-4 rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
          Đã lưu địa chỉ mặc định!
        </p>
      )}
    </form>
  );
}
