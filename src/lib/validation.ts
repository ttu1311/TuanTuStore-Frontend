// Simple checks shared by the register, login, account and checkout forms.

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

// Vietnamese phone: 10 digits starting with 0 (or +84 followed by 9 digits). Spaces, dots and dashes are ignored.
export function isValidPhone(phone: string) {
  return /^(0|\+84)\d{9}$/.test(normalizePhone(phone));
}

// "090 123.4567" -> "0901234567"
export function normalizePhone(phone: string) {
  return phone.replace(/[\s.-]/g, "");
}

// Emails are compared in lower case, so "An@Mail.com" and "an@mail.com" are the same account
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Minimum password length for accounts (NIST recommends at least 8)
export const MIN_PASSWORD_LENGTH = 8;

export const MAX_NAME_LENGTH = 100;

// ---------- Register ----------

export type RegisterValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (values.fullName.trim() === "") errors.fullName = "Vui lòng nhập họ và tên";
  else if (values.fullName.trim().length > MAX_NAME_LENGTH) errors.fullName = `Họ và tên tối đa ${MAX_NAME_LENGTH} ký tự`;

  if (values.email.trim() === "") errors.email = "Vui lòng nhập email";
  else if (!isValidEmail(values.email)) errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";

  if (values.phone.trim() === "") errors.phone = "Vui lòng nhập số điện thoại";
  else if (!isValidPhone(values.phone)) errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";

  if (values.password === "") errors.password = "Vui lòng nhập mật khẩu";
  else if (values.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;

  if (values.confirmPassword === "") errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Mật khẩu xác nhận không khớp";

  return errors;
}

// ---------- Profile ----------

export type ProfileErrors = { fullName?: string; phone?: string };

export function validateProfile(fullName: string, phone: string): ProfileErrors {
  const errors: ProfileErrors = {};
  if (fullName.trim() === "") errors.fullName = "Vui lòng nhập họ và tên";
  else if (fullName.trim().length > MAX_NAME_LENGTH) errors.fullName = `Họ và tên tối đa ${MAX_NAME_LENGTH} ký tự`;
  if (phone.trim() === "") errors.phone = "Vui lòng nhập số điện thoại";
  else if (!isValidPhone(phone)) errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  return errors;
}

// ---------- Change password ----------

export type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
export type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

export function validatePasswordChange(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};
  if (values.currentPassword === "") errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
  if (values.newPassword === "") errors.newPassword = "Vui lòng nhập mật khẩu mới";
  else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  }
  if (values.confirmPassword === "") errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
  else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  return errors;
}
