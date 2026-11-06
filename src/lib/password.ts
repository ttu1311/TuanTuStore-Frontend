// Mật khẩu của BẢN DEMO FRONT-END.
//
// QUAN TRỌNG: đây KHÔNG phải bảo mật thật, và cũng không có ý định như vậy.
// Mật khẩu được lưu dạng chữ thường trong bản ghi người dùng ở localStorage của trình duyệt, và việc "kiểm tra" đăng nhập
// chỉ đơn giản là so sánh nó với những gì khách gõ. Không có server nào có thể giữ bí mật mật khẩu:
// ai mở công cụ nhà phát triển của trình duyệt cũng đọc được mọi mật khẩu và sửa được mọi tài khoản.
// Nó chỉ tồn tại để bản demo có thể cho thấy form đăng nhập, đăng ký và "đổi mật khẩu" hoạt động thật.
//
// Nó không cần tính năng trình duyệt nào (không dùng Web Crypto), nên chạy giống nhau trên http://localhost,
// trên địa chỉ http://192.168.x.x thường (điện thoại cùng Wi-Fi) và trên https://.
// Đừng bao giờ gõ mật khẩu thật vào website này.

// Cùng một chữ cái tiếng Việt có thể gõ theo nhiều cách ("ế" là một ký tự, hoặc "e" + các dấu).
// NFKC làm chúng giống hệt nhau, nên mật khẩu vẫn khớp dù gõ bằng bàn phím nào.
function normalize(password: string) {
  return password.normalize("NFKC");
}

// Mật khẩu đã gõ có khớp với mật khẩu đã lưu không? `saved` là undefined với tài khoản cũ không có mật khẩu.
export function isSamePassword(typed: string, saved: string | undefined) {
  return typeof saved === "string" && normalize(typed) === normalize(saved);
}
