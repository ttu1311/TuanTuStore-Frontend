"use client";

import { useState } from "react";
import Field from "@/components/account/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { validatePasswordChange, type PasswordErrors, type PasswordValues } from "@/lib/validation";

const emptyForm: PasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };
const fieldOrder = ["currentPassword", "newPassword", "confirmPassword"] as const;

// Changes the (simulated) password of the logged-in user in localStorage
export default function PasswordSection() {
  const { changePassword } = useStore();
  const [values, setValues] = useState<PasswordValues>(emptyForm);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [formMessage, setFormMessage] = useState(""); // error that is not about one field
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof PasswordValues, value: string) {
    setValues({ ...values, [field]: value });
    setFormMessage("");
    setSuccess(false);
    setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormMessage("");
    setSuccess(false);

    const newErrors = validatePasswordChange(values);
    setErrors(newErrors);
    const firstInvalid = fieldOrder.find((field) => newErrors[field]);
    if (firstInvalid) return document.getElementById(firstInvalid)?.focus();

    const result = changePassword(values.currentPassword, values.newPassword);
    if (result.ok) {
      setValues(emptyForm);
      setSuccess(true);
    } else if (result.field === "currentPassword") {
      setErrors({ currentPassword: result.message });
      document.getElementById("currentPassword")?.focus();
    } else {
      setFormMessage(result.message);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-ink">Đổi mật khẩu</h2>
      <Field
        id="currentPassword"
        label="Mật khẩu hiện tại"
        type="password"
        autoComplete="current-password"
        value={values.currentPassword}
        error={errors.currentPassword}
        onChange={(value) => handleChange("currentPassword", value)}
      />
      <Field
        id="newPassword"
        label="Mật khẩu mới"
        type="password"
        autoComplete="new-password"
        value={values.newPassword}
        error={errors.newPassword}
        onChange={(value) => handleChange("newPassword", value)}
      />
      <Field
        id="confirmPassword"
        label="Xác nhận mật khẩu mới"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(value) => handleChange("confirmPassword", value)}
      />
      <button type="submit" className={`${btnBase} ${btnPrimary}`}>
        Đổi mật khẩu
      </button>
      {formMessage && (
        <p role="alert" className="text-sm text-sale">
          {formMessage}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
          Đổi mật khẩu thành công! Lần đăng nhập sau, hãy dùng mật khẩu mới.
        </p>
      )}
    </form>
  );
}
