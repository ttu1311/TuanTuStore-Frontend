// Các kiểu dữ liệu của TuanTuStore.
// Mọi danh sách bên dưới đều được lưu trong localStorage của trình duyệt (xem src/lib/storage.ts).

export type Region = "bac" | "trung" | "nam";

export interface Product {
  id: string; // ví dụ "tra-thai-nguyen", dùng trong URL /san-pham/tra-thai-nguyen. Không bao giờ đổi.
  name: string;
  shortDescription: string; // hiển thị cạnh giá ở trang chi tiết
  description: string; // các đoạn văn cách nhau bằng một dòng trống
  price: number; // tính bằng VND (số nguyên)
  oldPrice?: number; // tùy chọn: hiện giá gạch ngang và phần giảm giá
  image: string; // đường dẫn trong /public, ví dụ "/images/p-o-mai.jpg"
  region: Region;
  brand: string;
  origin: string; // nơi sản xuất
  pack: string; // ví dụ "Gói 200g"
  isFeatured: boolean; // hiển thị trong "Sản phẩm nổi bật" ở trang chủ
  rank?: number; // vị trí bán chạy: 1 = "Top 1". Để trống với sản phẩm khác.
  createdAt: string; // ngày ISO, dùng cho cách sắp xếp "Mới nhất"
}

// Loại thương hiệu, để khách biết "thương hiệu" này thực chất là gì
export type BrandKind = "Thương hiệu" | "Nhãn hiệu tập thể" | "Chỉ dẫn địa lý" | "Nghề truyền thống";

// Thông tin về một thương hiệu (xem src/data/brands.ts). Sản phẩm chỉ giữ TÊN thương hiệu (Product.brand).
export interface Brand {
  name: string; // trùng với Product.brand
  kind: BrandKind;
  place: string; // nơi gắn với thương hiệu, ví dụ "Năm Căn, Cà Mau"
  about: string; // vài câu giới thiệu
}

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string; // luôn lưu bằng chữ thường, duy nhất
  phone: string; // "" khi chưa biết
  // CHỮ THƯỜNG, có chủ đích: đây là bản demo front-end không có server, nên mật khẩu vốn không thể được bảo vệ.
  // Xem src/lib/password.ts và "Demo accounts" trong README.md. Đừng bao giờ dùng mật khẩu thật ở đây.
  password: string;
  role: Role;
  createdAt: string; // ngày ISO
}

// Giỏ hàng chỉ lưu sản phẩm nào và bao nhiêu. Tên, giá và ảnh lấy từ danh sách sản phẩm.
export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED";

export type PaymentMethod = "COD" | "BANK_TRANSFER";

// Bản sao của sản phẩm tại thời điểm mua,
// để thay đổi sản phẩm về sau (tên, giá) không bao giờ làm đổi một đơn hàng cũ.
export interface OrderItem {
  productId: string;
  name: string;
  price: number; // đơn giá tại thời điểm mua
  quantity: number;
}

export interface Order {
  code: string; // "TT-000001": duy nhất, hiển thị cho khách hàng
  userId: string | null; // null = khách chưa đăng nhập
  customerName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string; // "" khi khách không viết gì
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string; // ngày ISO
}
