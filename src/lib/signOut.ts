// Cờ "đang đăng xuất", để RequireLogin không đẩy người vừa bấm Đăng xuất sang /dang-nhap.
//
// Vấn đề: đứng ở một trang cần đăng nhập (/tai-khoan/...) mà đăng xuất thì RequireLogin thấy "chưa đăng nhập" ngay và chuyển tới
// /dang-nhap, trước khi trang chủ kịp mở. Cách xử lý: useSignOutToHome (RequireLogin.tsx) bật cờ này rồi mới đăng xuất;
// RequireLogin thấy cờ thì đứng yên; cờ chỉ được tắt khi đường dẫn ĐÃ THỰC SỰ là "/" (HeaderActions theo dõi usePathname),
// nên cờ không phụ thuộc thời gian và không kẹt lại cho lần vào trang cần đăng nhập sau đó.
// Đây là biến của trình duyệt (chỉ đọc / ghi trong trình xử lý sự kiện và effect, không bao giờ lúc render).
let signingOut = false;

export function beginSignOut() {
  signingOut = true;
}

export function endSignOut() {
  signingOut = false;
}

export function isSigningOut() {
  return signingOut;
}
