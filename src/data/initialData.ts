import type { Product, User } from "@/types";

// Dữ liệu chỉ được ghi vào localStorage ở lần truy cập ĐẦU TIÊN (xem initializeStorage trong src/lib/storage.ts).
// Sau đó, website luôn dùng những gì đã lưu trong localStorage, nên thay đổi của Admin được giữ lại.

// Các đặc sản Cà Mau (Miền Nam), được thêm sau phiên bản đầu tiên của website.
// Trình duyệt đã lưu danh sách sản phẩm trước khi chúng xuất hiện sẽ nhận chúng MỘT LẦN (xem seedBatches trong src/lib/storage.ts).
// Giá và quy cách là giá trị mẫu cho đồ án đại học này, KHÔNG phải giá thị trường đã kiểm chứng.
// Thương hiệu của các đặc sản Cà Mau là NHÃN HIỆU TẬP THỂ của địa phương (xem src/data/brands.ts), không phải một công ty cụ thể.
export const caMauProducts: Product[] = [
  {
    id: "cua-bien-nam-can",
    name: "Cua biển Năm Căn",
    shortDescription: "Cua biển nuôi dưới tán rừng ngập mặn Năm Căn, thịt chắc và ngọt, hợp hấp, rang me hoặc nấu lẩu.",
    description:
      "Năm Căn nằm ở vùng rừng ngập mặn phía nam tỉnh Cà Mau. Cua biển ở đây được nuôi quảng canh trong các vuông nuôi xen giữa rừng đước, sống trong môi trường nước lợ tự nhiên.\n\n" +
      "Cua có thịt chắc, vị ngọt, cua gạch có phần gạch béo. Cách chế biến đơn giản nhất là hấp hoặc luộc rồi chấm muối tiêu chanh; cua cũng hợp để rang me, nấu lẩu hoặc nấu cháo.",
    price: 360000,
    image: "/images/p-cua-bien-nam-can.jpg",
    region: "nam",
    brand: "Cua Năm Căn",
    origin: "Năm Căn, Cà Mau",
    pack: "1kg (3–4 con)",
    isFeatured: false,
    createdAt: "2026-10-25T05:00:00.000Z",
  },
  {
    id: "tom-kho-rach-goc",
    name: "Tôm khô Rạch Gốc",
    shortDescription: "Tôm khô từ vùng cửa biển Rạch Gốc, màu đỏ cam tự nhiên, vị ngọt đậm, dùng nấu canh hoặc ăn với củ kiệu.",
    description:
      "Rạch Gốc là vùng cửa biển ở phía nam tỉnh Cà Mau, nổi tiếng với nghề làm tôm khô. Tôm tươi được luộc chín, phơi khô dưới nắng rồi chà bỏ vỏ, giữ lại phần thịt tôm.\n\n" +
      "Tôm khô có màu đỏ cam tự nhiên và vị ngọt đậm. Bạn có thể dùng để nấu canh, xào rau, trộn gỏi, hoặc ăn cùng củ kiệu trong những ngày Tết.",
    price: 380000,
    image: "/images/p-tom-kho-rach-goc.jpg",
    region: "nam",
    brand: "Tôm khô Rạch Gốc",
    origin: "Rạch Gốc, Cà Mau",
    pack: "Túi 250g",
    isFeatured: false,
    createdAt: "2026-10-25T04:00:00.000Z",
  },
  {
    id: "ba-khia-muoi-rach-goc",
    name: "Ba khía muối Rạch Gốc",
    shortDescription: "Ba khía bắt ở rừng ngập mặn Rạch Gốc, muối mặn để dành, trộn tỏi ớt chanh đường ăn với cơm.",
    description:
      "Ba khía là loài cua nhỏ sống trong rừng ngập mặn, có càng màu đỏ tím. Ở vùng Rạch Gốc, Cà Mau, người dân bắt ba khía vào mùa rồi muối mặn trong hũ để dùng dần.\n\n" +
      "Trước khi ăn, ba khía muối thường được bóp với tỏi, ớt, chanh và đường cho có vị chua ngọt. Món này ăn kèm cơm trắng là món quen thuộc của người miền Tây.",
    price: 65000,
    image: "/images/p-ba-khia-muoi.jpg",
    region: "nam",
    brand: "Ba khía Rạch Gốc",
    origin: "Rạch Gốc, Cà Mau",
    pack: "Hũ 500g",
    isFeatured: false,
    createdAt: "2026-10-25T03:00:00.000Z",
  },
  {
    id: "mat-ong-rung-u-minh-ha",
    name: "Mật ong rừng U Minh Hạ",
    shortDescription: "Mật ong lấy từ rừng tràm U Minh Hạ theo nghề gác kèo ong truyền thống, thơm mùi hoa tràm.",
    description:
      "U Minh Hạ là vùng rừng tràm lớn của tỉnh Cà Mau. Người dân nơi đây có nghề gác kèo ong: đặt những thanh kèo dưới tán rừng để đàn ong rừng đến làm tổ, rồi chỉ cắt phần tổ chứa mật, chừa lại phần còn lại để đàn ong tiếp tục ở lại.\n\n" +
      "Mật ong có màu vàng sậm và mùi thơm của hoa tràm. Bạn có thể pha với nước ấm, chanh hoặc gừng, hoặc dùng để ướp các món nướng. Không dùng mật ong cho trẻ dưới 1 tuổi.",
    price: 280000,
    image: "/images/p-mat-ong-u-minh-ha.jpg",
    region: "nam",
    brand: "Mật ong U Minh Hạ",
    origin: "U Minh Hạ, Cà Mau",
    pack: "Chai 500ml",
    isFeatured: false,
    createdAt: "2026-10-25T02:00:00.000Z",
  },
  {
    id: "kho-ca-boi-ca-mau",
    name: "Khô cá bổi Cà Mau",
    shortDescription:
      "Khô từ cá bổi (cá sặc rằn) vùng U Minh, Cà Mau; thịt thơm, dai, vị ngọt, chiên giòn hoặc nướng đều ngon.",
    description:
      "Cá bổi (còn gọi là cá sặc rằn) là loài cá nước ngọt, sống nhiều ở vùng quanh rừng U Minh Hạ của Cà Mau. Hiện nay cá chủ yếu được nuôi trong ao, tập trung ở huyện Trần Văn Thời và huyện U Minh. Cá được làm sạch rồi phơi nắng cho khô.\n\n" +
      "Khô cá bổi có thịt thơm, dai và vị ngọt. Bạn có thể chiên giòn hoặc nướng, ăn với cơm trắng hay dùng làm món nhắm. “Khô cá bổi U Minh” là nhãn hiệu tập thể đã được bảo hộ của Cà Mau.",
    price: 165000,
    image: "/images/p-kho-ca-boi.jpg",
    region: "nam",
    brand: "Khô cá bổi U Minh",
    origin: "Trần Văn Thời, Cà Mau",
    pack: "Túi 500g",
    isFeatured: false,
    createdAt: "2026-10-25T01:00:00.000Z",
  },
];

// Ngày đi từ mới nhất đến cũ nhất trong danh sách này, nên thứ tự "Mới nhất" mặc định
// hiển thị sản phẩm đúng thứ tự bên dưới. Sản phẩm do Admin thêm có ngày của thời điểm thêm.
export const initialProducts: Product[] = [
  ...caMauProducts,
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
    brand: "Chè Tân Cương",
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
    brand: "Hồng Lam",
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
    brand: "Bà Liễu Mẹ",
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
    brand: "Tân Huê Viên",
    origin: "Sóc Trăng",
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
    brand: "Hồng Lam",
    origin: "Hà Nội",
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
    brand: "Trung Nguyên",
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
    brand: "Khải Hoàn",
    origin: "Phú Quốc, Kiên Giang",
    pack: "Chai 500ml",
    isFeatured: false,
    rank: 3,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "keo-dua",
    name: "Kẹo dừa",
    shortDescription: "Kẹo dừa vị ca cao: kẹo dẻo từ nước cốt dừa, đường và ca cao, thơm béo, đặc sản của xứ dừa Bến Tre.",
    description:
      "Bến Tre được gọi là xứ dừa, và kẹo dừa là món quà đặc trưng của vùng đất này. Kẹo được nấu từ nước cốt dừa và đường, loại này có thêm ca cao nên có màu nâu, sau đó cắt thành từng viên nhỏ.\n\n" +
      "Kẹo dẻo, béo nhẹ, thơm mùi dừa và ca cao. Có thể ăn trực tiếp hoặc dùng làm quà tặng.",
    price: 55000,
    oldPrice: 65000,
    image: "/images/p-keo-dua-ben-tre.jpg",
    region: "nam",
    brand: "Cô Hai Tỏ",
    origin: "Bến Tre",
    pack: "Hộp 400g",
    isFeatured: false,
    rank: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
//   Email:    admin@tuantustore.vn
//   Password: Admin@123
// Mật khẩu được lưu dạng chữ thường, như mọi mật khẩu của bản demo này (xem src/lib/password.ts).
// Đây là mô phỏng front-end, KHÔNG phải bảo mật thật.
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
