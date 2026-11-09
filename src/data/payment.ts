// Tài khoản ngân hàng nhận chuyển khoản, dùng để tạo mã QR VietQR ở trang thanh toán.
// Điền số thật trong tệp .env.local (xem .env.example), KHÔNG sửa giá trị mẫu dưới đây.
//
// ⚠️ TẠM THỜI (chưa có backend): khách quét QR và chuyển khoản, đơn ở trạng thái "Chờ thanh toán",
// Admin bấm "Xác nhận đã nhận tiền" thủ công. Xác nhận TỰ ĐỘNG cần một server nhận webhook từ cổng thanh toán
// (dự kiến PayOS): kiểm tra chữ ký, khớp mã đơn + số tiền, và không xác nhận trùng một giao dịch.

// Tài khoản MẪU: số tài khoản toàn số 0 để không ai chuyển nhầm tiền thật cho người lạ
const sampleAccount = {
  bin: "970436", // mã BIN ngân hàng theo NAPAS (970436 = Vietcombank)
  bankName: "Vietcombank",
  accountNo: "0000000000",
  accountName: "DAC SAN 3 MIEN (TAI KHOAN MAU)",
};

// NEXT_PUBLIC_*: Next.js chép giá trị vào mã trình duyệt lúc build. Đây là thông tin NHẬN tiền (in trên QR), không phải bí mật.
export const bankAccount = {
  bin: process.env.NEXT_PUBLIC_BANK_BIN || sampleAccount.bin,
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || sampleAccount.bankName,
  accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || sampleAccount.accountNo,
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || sampleAccount.accountName,
  // Chưa điền số tài khoản thật: trang thanh toán hiện cảnh báo "tài khoản mẫu"
  isSample: !process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO,
};
