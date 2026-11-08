// Nội dung mã QR chuyển khoản theo chuẩn VietQR (NAPAS, dựa trên EMVCo).
// Mọi ứng dụng ngân hàng Việt Nam quét được: tự điền ngân hàng, số tài khoản, số tiền và nội dung chuyển khoản.
// Tạo hoàn toàn trong trình duyệt, không gửi gì tới dịch vụ bên ngoài.

// Một trường EMVCo: mã 2 số + độ dài 2 số + giá trị
function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

// CRC-16/CCITT-FALSE (đa thức 0x1021, giá trị đầu 0xFFFF), tính trên toàn bộ chuỗi kể cả "6304"
function crc16(text: string) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

type VietQrInput = {
  bin: string; // mã BIN ngân hàng, ví dụ "970436"
  accountNo: string;
  amount: number; // VND, số nguyên
  message: string; // nội dung chuyển khoản (chữ không dấu, tối đa 25 ký tự), ở đây là mã đơn
};

export function vietQrPayload({ bin, accountNo, amount, message }: VietQrInput) {
  const beneficiary = field("00", bin) + field("01", accountNo);
  // 38: thông tin người nhận theo VietQR. QRIBFTTA = chuyển nhanh 24/7 tới SỐ TÀI KHOẢN
  const merchant = field("00", "A000000727") + field("01", beneficiary) + field("02", "QRIBFTTA");
  const body =
    field("00", "01") + // phiên bản
    field("01", "12") + // 12 = mã động (có số tiền, dùng cho một đơn)
    field("38", merchant) +
    field("53", "704") + // VND
    field("54", String(Math.round(amount))) +
    field("58", "VN") +
    field("62", field("08", message.slice(0, 25))) + // 08 = nội dung chuyển khoản
    "6304"; // CRC đứng cuối, tính trên cả phần "6304"
  return body + crc16(body);
}
