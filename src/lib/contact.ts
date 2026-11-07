// Form "Yêu cầu liên hệ lại" ở trang /lien-he: các lựa chọn và kiểm tra dữ liệu.
import { MAX_NAME_LENGTH, isValidEmail, isValidPhone } from "@/lib/validation";

export const contactTopics = [
  { id: "tu-van", label: "Tư vấn chọn quà" },
  { id: "don-hang", label: "Hỏi về đơn hàng" },
  { id: "so-luong-lon", label: "Đặt số lượng lớn / quà doanh nghiệp" },
  { id: "khac", label: "Vấn đề khác" },
] as const;

export const callTimes = [
  { id: "bat-ky", label: "Lúc nào cũng được" },
  { id: "sang", label: "Buổi sáng (8:00 – 12:00)" },
  { id: "chieu", label: "Buổi chiều (13:00 – 17:00)" },
  { id: "toi", label: "Buổi tối (18:00 – 21:00)" },
] as const;

// id lạ (lựa chọn đã bị bỏ) thì hiện nguyên id
export function topicLabel(id: string) {
  return contactTopics.find((topic) => topic.id === id)?.label ?? id;
}

export function callTimeLabel(id: string) {
  return callTimes.find((time) => time.id === id)?.label ?? id;
}

export const MAX_CONTACT_MESSAGE_LENGTH = 500;

export type ContactValues = {
  name: string;
  phone: string;
  email: string;
  topic: string;
  callTime: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (values.name.trim() === "") errors.name = "Vui lòng nhập họ và tên";
  else if (values.name.trim().length > MAX_NAME_LENGTH) errors.name = `Họ và tên tối đa ${MAX_NAME_LENGTH} ký tự`;

  if (values.phone.trim() === "") errors.phone = "Vui lòng nhập số điện thoại để cửa hàng gọi lại";
  else if (!isValidPhone(values.phone)) errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";

  // Email không bắt buộc, nhưng đã ghi thì phải đúng
  if (values.email.trim() !== "" && !isValidEmail(values.email)) errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";

  if (!contactTopics.some((topic) => topic.id === values.topic)) errors.topic = "Vui lòng chọn chủ đề";
  if (!callTimes.some((time) => time.id === values.callTime)) errors.callTime = "Vui lòng chọn thời gian";

  if (values.message.trim().length > MAX_CONTACT_MESSAGE_LENGTH) {
    errors.message = `Nội dung tối đa ${MAX_CONTACT_MESSAGE_LENGTH} ký tự`;
  }

  return errors;
}
