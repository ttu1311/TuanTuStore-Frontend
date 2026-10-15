"use client";

import { useState } from "react";
import Field from "@/components/account/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { validateProfile, type ProfileErrors } from "@/lib/validation";
import type { User } from "@/types";

// Name and phone can be changed. The email is shown but cannot be changed.
export default function ProfileSection({ user }: { user: User }) {
  const { updateProfile } = useStore();
  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);
    setSaveError("");

    const newErrors = validateProfile(fullName, phone);
    setErrors(newErrors);
    const firstInvalid = (["fullName", "phone"] as const).find((field) => newErrors[field]);
    if (firstInvalid) return document.getElementById(firstInvalid)?.focus();

    // Saved into the user list in localStorage
    const result = updateProfile(fullName, phone);
    if (result.ok) setSuccess(true);
    else setSaveError(result.message);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-ink">Thông tin cá nhân</h2>
      <Field
        id="fullName"
        label="Họ và tên"
        value={fullName}
        error={errors.fullName}
        autoComplete="name"
        onChange={(value) => {
          setFullName(value);
          setSuccess(false);
          setErrors({ ...errors, fullName: undefined });
        }}
      />
      {/* The email identifies the account, so it cannot be changed */}
      <Field id="email" label="Email" type="email" value={user.email} autoComplete="email" readOnly />
      <Field
        id="phone"
        label="Số điện thoại"
        type="tel"
        value={phone}
        error={errors.phone}
        autoComplete="tel"
        onChange={(value) => {
          setPhone(value);
          setSuccess(false);
          setErrors({ ...errors, phone: undefined });
        }}
      />
      <button type="submit" className={`${btnBase} ${btnPrimary}`}>
        Lưu thay đổi
      </button>
      {saveError && (
        <p role="alert" className="text-sm text-sale">
          {saveError}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
          Đã lưu thông tin cá nhân!
        </p>
      )}
    </form>
  );
}
