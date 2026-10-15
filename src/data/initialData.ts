import type { Product, User } from "@/types";

// The data written into localStorage on the FIRST visit only (see initializeStorage in src/lib/storage.ts).
// After that, the website always uses what is saved in localStorage, so Admin changes are kept.

// Dates go from newest to oldest in this list, so the default "Mới nhất" order
// shows the products in the same order as below. Products added by the Admin are newer and come first.
export const initialProducts: Product[] = [
  {
    id: "tra-thai-nguyen",
    name: "Chè Thái Nguyên",
    shortDescription: "Chè xanh sao khô từ vùng trà Tân Cương, nước xanh vàng, vị chát nhẹ và hậu ngọt.",
    description:
      "Thái Nguyên là một trong những vùng trồng chè nổi tiếng nhất miền Bắc, và Tân Cương thường được nhắc đến như cái nôi của chè xanh Việt Nam. Búp chè được hái, sao và vò thủ công hoặc bằng máy để giữ hương thơm tự nhiên.\n\n" +
      "Chè pha nước nóng cho màu xanh vàng, vị chát dịu rồi ngọt dần ở cuối vị. Thích hợp để uống hằng ngày hoặc làm quà biếu.",
    price: 185000,
    oldPrice: 220000,
    image: "/images/p-tra-thai-nguyen.jpg",
    region: "bac",
    brand: "Thương hiệu A",
    origin: "Tân Cương, Thái Nguyên",
    pack: "Gói 200g",
    isFeatured: true,
    createdAt: "2026-01-08T00:00:00.000Z",
  },
  {
    id: "o-mai",
    name: "Ô mai chanh đào",
    shortDescription: "Ô mai kiểu Hà Nội với vị chua, ngọt, mặn hòa quyện, ăn vặt hoặc dùng với trà.",
    description:
      "Ô mai là món quà vặt quen thuộc của người Hà Nội, được làm từ quả tươi ngâm muối, phơi rồi tẩm gia vị. Phố Hàng Đường từ lâu đã gắn với nghề làm ô mai và mứt.\n\n" +
      "Ô mai chanh đào có vị chua thanh của chanh, ngọt của đào và chút mặn cuối vị. Món này hợp để nhâm nhi cùng trà nóng, đặc biệt vào dịp Tết.",
    price: 120000,
    image: "/images/p-o-mai.jpg",
    region: "bac",
    brand: "Thương hiệu B",
    origin: "Phố Hàng Đường, Hà Nội",
    pack: "Hộp 300g",
    isFeatured: true,
    createdAt: "2026-01-07T00:00:00.000Z",
  },
  {
    id: "banh-kho-me",
    name: "Bánh khô mè",
    shortDescription: "Bánh mỏng giòn phủ nhiều mè, vị ngọt vừa phải, món quà quen thuộc của miền Trung.",
    description:
      "Bánh khô mè là đặc sản quen thuộc của Đà Nẵng và Quảng Nam. Bánh được làm từ bột gạo, đường và mè rồi nướng cho khô giòn.\n\n" +
      "Bánh có vị ngọt nhẹ, thơm mùi mè rang. Bạn có thể ăn trực tiếp, bẻ nhỏ ăn kèm kem hoặc dùng cùng trà và cà phê.",
    price: 65000,
    oldPrice: 75000,
    image: "/images/p-banh-kho-me.jpg",
    region: "trung",
    brand: "Thương hiệu C",
    origin: "Cẩm Lệ, Đà Nẵng",
    pack: "Túi 250g",
    isFeatured: true,
    createdAt: "2026-01-06T00:00:00.000Z",
  },
  {
    id: "banh-pia",
    name: "Bánh pía",
    shortDescription: "Bánh nhiều lớp vỏ mỏng, nhân đậu xanh bùi béo, đặc sản nổi tiếng của Sóc Trăng.",
    description:
      "Bánh pía là đặc sản của Sóc Trăng, có nguồn gốc từ ẩm thực của người Hoa. Vỏ bánh gồm nhiều lớp bột mỏng xếp chồng, khi nướng lên có độ xốp nhẹ.\n\n" +
      "Nhân bánh phổ biến là đậu xanh, thường kết hợp với khoai môn, sầu riêng hoặc trứng muối. Bánh thích hợp dùng với trà nóng.",
    price: 98000,
    image: "/images/p-banh-pia.jpg",
    region: "nam",
    brand: "Thương hiệu D",
    origin: "Vũng Thơm, Sóc Trăng",
    pack: "Hộp 4 bánh",
    isFeatured: true,
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "banh-com",
    name: "Bánh cốm",
    shortDescription: "Bánh mềm màu xanh từ cốm, nhân đậu xanh và dừa, thơm mùi lá dứa.",
    description:
      "Cốm là món quà của mùa thu Hà Nội, được làm từ lúa nếp non. Từ cốm, người thợ làm ra bánh cốm với lớp vỏ xanh mềm, bên trong là nhân đậu xanh và dừa.\n\n" +
      "Bánh có vị ngọt thanh, thơm mùi cốm. Bánh thường xuất hiện trong các mâm lễ cưới và quà biếu truyền thống của người miền Bắc.",
    price: 90000,
    image: "/images/p-banh-com.jpg",
    region: "bac",
    brand: "Thương hiệu B",
    origin: "Hàng Than, Hà Nội",
    pack: "Hộp 10 bánh",
    isFeatured: false,
    rank: 1,
    createdAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "ca-phe",
    name: "Cà phê hạt",
    shortDescription: "Cà phê hạt từ vùng đất đỏ bazan Tây Nguyên, vị đậm, hậu đắng và thơm.",
    description:
      "Buôn Ma Thuột là thủ phủ cà phê của Việt Nam, nằm trên vùng đất đỏ bazan ở Tây Nguyên. Khí hậu và thổ nhưỡng nơi đây rất phù hợp để trồng cà phê.\n\n" +
      "Cà phê hạt phù hợp để xay và pha phin theo kiểu truyền thống, cho ly cà phê đậm đà, ít chua. Bạn cũng có thể dùng cho máy pha espresso.",
    price: 210000,
    oldPrice: 240000,
    image: "/images/p-ca-phe.jpg",
    region: "trung",
    brand: "Thương hiệu C",
    origin: "Buôn Ma Thuột, Đắk Lắk",
    pack: "Gói 500g",
    isFeatured: false,
    rank: 2,
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "nuoc-mam",
    name: "Nước mắm cá cơm",
    shortDescription: "Nước mắm truyền thống từ cá cơm, ủ lâu ngày, vị đậm đà và thơm.",
    description:
      "Phú Quốc nổi tiếng với nghề làm nước mắm truyền thống. Cá cơm tươi được ướp muối và ủ trong thời gian dài để cho ra nước mắm có màu cánh gián và mùi thơm đặc trưng.\n\n" +
      "Nước mắm dùng để chấm, nêm nếm hoặc pha nước chấm cho nhiều món ăn Việt Nam như bún, gỏi và cơm.",
    price: 145000,
    image: "/images/p-nuoc-mam.jpg",
    region: "nam",
    brand: "Thương hiệu D",
    origin: "Phú Quốc, Kiên Giang",
    pack: "Chai 500ml",
    isFeatured: false,
    rank: 3,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "keo-dua",
    name: "Kẹo dừa",
    shortDescription: "Kẹo dẻo từ nước cốt dừa và đường, thơm béo, đặc sản của xứ dừa Bến Tre.",
    description:
      "Bến Tre được gọi là xứ dừa, và kẹo dừa là món quà đặc trưng của vùng đất này. Kẹo được nấu từ nước cốt dừa và đường, sau đó cắt thành từng viên nhỏ.\n\n" +
      "Kẹo dẻo, béo nhẹ và thơm mùi dừa. Có thể ăn trực tiếp hoặc dùng làm quà tặng.",
    price: 55000,
    oldPrice: 65000,
    image: "/images/p-keo-dua.jpg",
    region: "nam",
    brand: "Thương hiệu A",
    origin: "Cồn Phụng, Bến Tre",
    pack: "Hộp 400g",
    isFeatured: false,
    rank: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// The demo ADMIN account of this university project (documented in README.md):
//   Email:    admin@tuantustore.vn
//   Password: Admin@123
// The password is saved as plain text, like every password of this demo (see src/lib/password.ts).
// This is a front-end simulation, NOT real security.
export const initialUsers: User[] = [
  {
    id: "u-admin",
    name: "Quản trị viên",
    email: "admin@tuantustore.vn",
    phone: "",
    password: "Admin@123",
    role: "ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
