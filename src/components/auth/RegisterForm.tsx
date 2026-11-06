"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";
import { validateRegister, type RegisterErrors, type RegisterValues } from "@/lib/validation";

const emptyForm: RegisterValues = { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// Thứ tự trường = thứ tự kiểm tra, nên lỗi đầu tiên cũng là ô đầu tiên trên trang
const fieldOrder: (keyof RegisterValues)[] = ["fullName", "email", "phone", "password", "confirmPassword"];

// Tạo tài khoản khách hàng (vai trò USER) trong localStorage, đăng nhập luôn và mở /tai-khoan.
export default function RegisterForm() {
  const { isReady, currentUser, register } = useStore();
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>(emptyForm);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formMessage, setFormMessage] = useState(""); // lỗi không thuộc về một ô nào

  // Đã đăng nhập (hoặc vừa đăng ký xong): chuyển tới đúng trang
  useEffect(() => {
    if (isReady && currentUser) router.replace(currentUser.role === "ADMIN" ? "/admin" : "/tai-khoan");
  }, [isReady, currentUser, router]);

  if (!isReady || currentUser) return <LoadingState />;

  function handleChange(field: keyof RegisterValues, value: string) {
    setValues({ ...values, [field]: value });
    setFormMessage("");
    // Xóa lỗi của ô này ngay khi người dùng sửa nó
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormMessage("");

    const newErrors = validateRegister(values);
    setErrors(newErrors);
    const firstInvalid = fieldOrder.find((field) => newErrors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const result = register(values);
    if (!result.ok) {
      // "Email này đã được đăng ký" thuộc về ô email; các thông báo khác nằm dưới nút
      if (result.field === "email") {
        setErrors({ email: result.message });
        document.getElementById("email")?.focus();
      } else {
        setFormMessage(result.message);
      }
    }
  }

  // Một ô nhập có nhãn kèm thông báo lỗi
  function renderField(field: keyof RegisterValues, label: string, type: string, autoComplete: string) {
    const error = errors[field];
    return (
      <div>
        <label htmlFor={field} className="mb-1.5 block font-medium text-ink">
          {label}
        </label>
        <input
          id={field}
          type={type}
          autoComplete={autoComplete}
          value={values[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${field}-error` : undefined}
          className={`${fieldStyle} ${error ? fieldBad : fieldOk}`}
        />
        {error && (
          <p id={`${field}-error`} className="mt-1.5 text-sm text-sale">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      {renderField("fullName", "Họ và tên", "text", "name")}
      {renderField("email", "Email", "email", "email")}
      {renderField("phone", "Số điện thoại", "tel", "tel")}
      {renderField("password", "Mật khẩu", "password", "new-password")}
      {renderField("confirmPassword", "Xác nhận mật khẩu", "password", "new-password")}

      <button type="submit" className={`${btnBase} ${btnPrimary} w-full`}>
        Đăng ký
      </button>

      {formMessage && (
        <p role="alert" className="text-sm text-sale">
          {formMessage}
        </p>
      )}

      <p className="text-center text-ink-muted">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-medium text-primary underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
