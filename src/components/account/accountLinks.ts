export type AccountLink = {
  href: string;
  label: string; // vừa là tên trong menu, vừa là tiêu đề lớn của trang (AccountShell)
  wide?: boolean; // trang có bảng / lưới sản phẩm nên cần khung rộng hơn (xem AccountShell)
};

// Các trang con của tài khoản, theo đúng thứ tự trong menu xổ xuống ở header (AccountMenu): đó là cách DUY NHẤT để chuyển
// giữa các mục và đăng xuất, trang tài khoản không còn menu riêng. "Đăng xuất" không phải một trang nên không nằm ở đây.
export const accountLinks: readonly AccountLink[] = [
  { href: "/tai-khoan", label: "Thông tin cá nhân" },
  { href: "/tai-khoan/lich-su-mua-hang", label: "Lịch sử mua hàng", wide: true },
  { href: "/tai-khoan/yeu-thich", label: "Sản phẩm yêu thích", wide: true },
  { href: "/tai-khoan/ho-chieu", label: "Hộ chiếu đặc sản" },
  { href: "/tai-khoan/doi-mat-khau", label: "Đổi mật khẩu" },
];
