// "?next=/san-pham/ca-phe": trang khách đang xem trước khi phải đăng nhập, để đưa khách quay lại sau đó.
// Chỉ nhận đường dẫn TRONG website (bắt đầu bằng một dấu "/"), để không ai lợi dụng liên kết đăng nhập
// mà chuyển khách sang một trang web khác ("//trang-la.com", "https://…").
export function safeNextPath(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || path.length > 300 || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  return path;
}

// /dang-nhap?next=<trang hiện tại>
export function loginUrl(next: string) {
  return `/dang-nhap?next=${encodeURIComponent(next)}`;
}
