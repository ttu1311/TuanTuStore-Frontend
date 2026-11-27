import type { Product } from "@/types";
import { INITIAL_STOCK } from "@/lib/cart";

// Các đặc sản thêm vào tháng 11/2026 (ban đầu 47 món), để mỗi miền có 20 món (cùng các món có từ trước).
// Trình duyệt đã lưu danh sách sản phẩm từ trước nhận các món này MỘT LẦN (seedBatches "ba-mien-60" trong src/lib/storage.ts).
// 4 món trong nhóm ban đầu đã được thay bằng món khác (xem fullProvinceProducts ở cuối file).
// Thương hiệu là chỉ dẫn địa lý (đã kiểm chứng) hoặc tên làng nghề / vùng có thật, xem src/data/brands.ts.
// Giá và quy cách là giá trị mẫu cho đồ án, KHÔNG phải giá thị trường. Ảnh: Wikimedia Commons.
// Ngày đi từ mới nhất đến cũ nhất, xen kẽ ba miền.
export const threeRegionProducts: Product[] = [
  {
    id: "nem-chua-thanh-hoa",
    name: "Nem chua Thanh Hóa",
    shortDescription: "Nem chua gói lá chuối kiểu Thanh Hóa, vị chua dịu, thơm tỏi ớt và lá đinh lăng.",
    description:
      "Thịt lợn nạc được giã nhuyễn, trộn với bì lợn thái sợi và gia vị, rồi gói cùng lá đinh lăng, tỏi, ớt trong lá chuối. Sau vài ngày, nem lên men và có vị chua tự nhiên.\n\n" +
      "Nem chua Thanh Hóa có màu hồng, dai giòn, vị chua dịu và cay nhẹ. Món này hợp làm món nhắm hoặc ăn vặt.",
    price: 50000,
    image: "/images/p-nem-chua-thanh-hoa.jpg",
    region: "trung",
    brand: "Nem chua Thanh Hóa",
    origin: "Thanh Hóa",
    pack: "10 cái",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Bóc lá, ăn kèm tỏi, ớt và lá đinh lăng; nem chua cũng có thể rán hoặc nướng.",
      storage: "Hàng giao lạnh. Nem chín (chua) sau khoảng 2–3 ngày; bảo quản ngăn mát tủ lạnh và dùng trong khoảng một tuần.",
    },
    createdAt: "2026-11-14T09:59:00.000Z",
  },
  {
    id: "muoi-tom-tay-ninh",
    name: "Muối tôm Tây Ninh",
    shortDescription: "Muối rang với tôm khô, ớt và tỏi, mặn cay, thơm, chấm trái cây chua là ghiền.",
    description:
      "Muối tôm Tây Ninh được làm từ muối hạt, tôm khô xay, ớt và tỏi phi. Hỗn hợp được rang đều tay cho đến khi khô và dậy mùi.\n\n" +
      "Muối có màu đỏ cam, vị mặn, cay và thơm mùi tôm. Đây là món chấm quen thuộc với xoài, cóc, ổi và bánh tráng trộn.",
    price: 35000,
    image: "/images/p-muoi-tom-tay-ninh.jpg",
    region: "nam",
    brand: "Muối tôm Tây Ninh",
    origin: "Tây Ninh",
    pack: "Hũ 200g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Chấm xoài xanh, cóc, ổi; rắc lên bánh tráng nướng, bánh tráng trộn.",
      storage: "Đậy kín hũ, để nơi khô ráo để muối không bị chảy nước.",
    },
    createdAt: "2026-11-14T09:58:00.000Z",
  },
  {
    id: "cha-muc-ha-long",
    name: "Chả mực Hạ Long",
    shortDescription: "Chả mực giã tay từ mực tươi vùng biển Quảng Ninh, dai giòn, thơm, chiên vàng là ăn được ngay.",
    description:
      "Chả mực là đặc sản nổi tiếng của Hạ Long. Mực tươi được làm sạch rồi giã tay trong cối đá cho tới khi thịt mực dẻo và kết dính, sau đó nặn thành từng miếng.\n\n" +
      "Khi chiên, chả có màu vàng ruộm, cắn vào thấy dai giòn sần sật và thơm vị mực. Món này ăn với xôi, bánh cuốn hoặc cơm trắng đều hợp.",
    price: 230000,
    image: "/images/p-cha-muc-ha-long.jpg",
    region: "bac",
    brand: "Chả mực Hạ Long",
    origin: "Quảng Ninh",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "bieu-nguoi-lon"],
    story: {
      enjoy: "Chiên với dầu ở lửa vừa đến khi hai mặt vàng đều, chấm tương ớt; ăn kèm xôi trắng hoặc bánh cuốn.",
      storage: "Hàng giao lạnh. Bảo quản ngăn đá, rã đông trong ngăn mát trước khi chiên; đã rã đông thì không cấp đông lại.",
    },
    createdAt: "2026-11-14T09:57:00.000Z",
  },
  {
    id: "keo-cu-do-ha-tinh",
    name: "Kẹo cu đơ Hà Tĩnh",
    shortDescription: "Kẹo lạc mật mía kẹp giữa hai lớp bánh tráng mè, ngọt, thơm gừng, dùng với chè xanh.",
    description:
      "Kẹo cu đơ được nấu từ mật mía, đường và mạch nha, trộn với lạc rang và gừng, rồi kẹp giữa hai lớp bánh tráng nướng có rắc vừng.\n\n" +
      "Kẹo có vị ngọt đậm của mật mía, bùi của lạc và cay ấm của gừng. Người Hà Tĩnh thường ăn kẹo cu đơ cùng chén nước chè xanh.",
    price: 45000,
    image: "/images/p-keo-cu-do-ha-tinh.jpg",
    region: "trung",
    brand: "Kẹo cu đơ Hà Tĩnh",
    origin: "Hà Tĩnh",
    pack: "Gói 300g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "qua-tet"],
    story: {
      enjoy: "Bẻ miếng nhỏ ăn cùng nước chè xanh đặc.",
      storage: "Buộc kín túi, để nơi khô ráo; kẹo để lâu ngoài không khí sẽ bị ỉu.",
    },
    createdAt: "2026-11-14T09:56:00.000Z",
  },
  {
    id: "banh-trang-phoi-suong",
    name: "Bánh tráng phơi sương Trảng Bàng",
    shortDescription: "Bánh tráng nướng rồi phơi sương cho mềm dẻo, cuốn thịt heo luộc và rau rừng là ngon nhất.",
    description:
      "Bánh tráng được tráng từ bột gạo, phơi nắng rồi nướng trên lửa, sau đó đem phơi qua sương đêm. Hơi sương giúp bánh mềm, dẻo, không cần nhúng nước khi cuốn.\n\n" +
      "Món ăn đi kèm nổi tiếng là bánh tráng phơi sương cuốn thịt heo luộc, rau rừng, chấm mắm nêm.",
    price: 55000,
    image: "/images/p-banh-trang-phoi-suong-v2.jpg",
    region: "nam",
    brand: "Bánh tráng phơi sương Trảng Bàng",
    origin: "Tây Ninh",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Cuốn trực tiếp (không cần nhúng nước) với thịt heo luộc, rau sống, rau rừng, chấm mắm nêm.",
      storage: "Buộc kín túi, để nơi thoáng mát; dùng trong vài ngày sau khi mở để bánh còn dẻo.",
    },
    createdAt: "2026-11-14T09:55:00.000Z",
  },
  {
    id: "mien-dong-binh-lieu",
    name: "Miến dong Bình Liêu",
    shortDescription: "Miến làm từ tinh bột dong riềng trồng ở Bình Liêu, sợi nhỏ, dai, nấu không bị nát.",
    description:
      "Củ dong riềng được nghiền lấy tinh bột, tráng thành bánh, thái sợi rồi phơi khô. Miến dong Bình Liêu nổi tiếng nhờ sợi miến dai và có màu trong tự nhiên.\n\n" +
      "Miến dùng để nấu miến gà, miến lươn, xào hoặc làm nhân nem rán, là món thường thấy trên mâm cỗ ngày Tết của người miền Bắc.",
    price: 70000,
    image: "/images/p-mien-dong-binh-lieu-v3.jpg",
    region: "bac",
    brand: "Miến dong Bình Liêu",
    origin: "Quảng Ninh",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "qua-tet"],
    story: {
      enjoy: "Ngâm miến vào nước lạnh khoảng 5–10 phút cho mềm, chần qua nước sôi rồi dùng để nấu, xào hoặc làm nem.",
      storage: "Để nơi khô ráo, thoáng mát; buộc kín túi sau khi mở.",
    },
    createdAt: "2026-11-14T09:54:00.000Z",
  },
  {
    id: "khoai-deo-quang-binh",
    name: "Khoai deo Quảng Bình",
    shortDescription: "Khoai lang hấp chín, thái lát rồi phơi nắng cho đến khi dẻo, ăn ngọt bùi tự nhiên.",
    description:
      "Khoai lang trồng trên đất cát ven biển được hấp chín, thái lát rồi phơi dưới nắng nhiều ngày cho đến khi miếng khoai dẻo và trong.\n\n" +
      "Khoai deo có vị ngọt tự nhiên, dẻo và thơm mùi khoai. Ăn trực tiếp như món ăn vặt, hoặc nướng sơ trên bếp cho thơm hơn.",
    price: 85000,
    image: "/images/p-khoai-deo-quang-binh-v2.jpg",
    region: "trung",
    brand: "Khoai deo Quảng Bình",
    origin: "Quảng Trị",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Ăn trực tiếp, hoặc nướng sơ trên bếp than, lò nướng vài phút cho thơm.",
      storage: "Để nơi khô mát; cất ngăn mát tủ lạnh sau khi mở để khoai giữ được độ dẻo.",
    },
    createdAt: "2026-11-14T09:53:00.000Z",
  },
  {
    id: "hat-dieu-binh-phuoc",
    name: "Hạt điều rang muối Bình Phước",
    shortDescription: "Hạt điều Bình Phước rang muối còn vỏ lụa, hạt to, giòn, béo bùi.",
    description:
      "Bình Phước là vùng trồng điều lớn của Việt Nam, với đất đỏ bazan và khí hậu nắng nóng hợp với cây điều. Hạt điều được tách vỏ cứng, giữ lại lớp vỏ lụa rồi rang muối.\n\n" +
      "Hạt điều rang muối giòn, béo, bùi và mặn nhẹ. Hợp ăn vặt, đãi khách ngày Tết hoặc làm quà.",
    price: 190000,
    image: "/images/p-hat-dieu-binh-phuoc.jpg",
    region: "nam",
    brand: "Hạt điều Bình Phước",
    origin: "Đồng Nai",
    pack: "Hũ 500g",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "an-vat", "bieu-nguoi-lon"],
    story: {
      enjoy: "Ăn trực tiếp; bóc lớp vỏ lụa nếu không thích vị chát nhẹ.",
      storage: "Đậy kín hũ, để nơi khô mát để hạt luôn giòn.",
    },
    createdAt: "2026-11-14T09:52:00.000Z",
  },
  {
    id: "banh-dau-xanh-hai-duong",
    name: "Bánh đậu xanh Hải Dương",
    shortDescription: "Bánh làm từ đậu xanh xay mịn, đường và chút mỡ, tan ngay trong miệng, dùng với trà nóng.",
    description:
      "Bánh đậu xanh là đặc sản nổi tiếng nhất của Hải Dương. Đậu xanh được đãi vỏ, đồ chín, xay mịn rồi trộn với đường và mỡ, ép thành những bánh nhỏ vuông vắn.\n\n" +
      "Bánh có vị ngọt bùi, béo nhẹ, mịn và tan ngay khi ăn. Món này hợp nhâm nhi cùng trà nóng hoặc làm quà biếu.",
    price: 45000,
    image: "/images/p-banh-dau-xanh-hai-duong.jpg",
    region: "bac",
    brand: "Bánh đậu xanh Hải Dương",
    origin: "Hải Phòng",
    pack: "Hộp 250g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "qua-tet"],
    story: {
      enjoy: "Ăn trực tiếp cùng trà xanh hoặc trà sen; vị ngọt của bánh làm dịu vị chát của trà.",
      storage: "Để nơi khô mát, đậy kín sau khi mở hộp. Dùng trong hạn ghi trên bao bì.",
    },
    createdAt: "2026-11-14T09:51:00.000Z",
  },
  {
    id: "che-vang-quang-tri",
    name: "Chè vằng Quảng Trị",
    shortDescription: "Lá và thân chè vằng phơi khô, nấu nước uống có vị đắng nhẹ rồi ngọt hậu.",
    description:
      "Chè vằng là loại cây dây leo mọc ở vùng đồi núi miền Trung. Người dân thu hái lá và thân, thái nhỏ rồi phơi khô để nấu nước uống hằng ngày.\n\n" +
      "Nước chè vằng có màu vàng nâu, vị đắng nhẹ rồi ngọt dần. Ở nhiều vùng miền Trung, đây là thức uống quen thuộc trong gia đình.",
    price: 60000,
    image: "/images/p-che-vang-quang-tri.jpg",
    region: "trung",
    brand: "Chè vằng Quảng Trị",
    origin: "Quảng Trị",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon"],
    story: {
      enjoy: "Rửa sơ một nắm chè vằng, đun sôi với khoảng 1,5 lít nước trong 10–15 phút rồi uống nóng hoặc để nguội.",
      storage: "Để nơi khô ráo, buộc kín túi để tránh ẩm mốc.",
    },
    createdAt: "2026-11-14T09:50:00.000Z",
  },
  {
    id: "kho-ca-dua-can-gio",
    name: "Khô cá dứa Cần Giờ",
    shortDescription: "Khô cá dứa một nắng của Cần Giờ, thịt dày, béo, chiên hay nướng đều thơm ngon.",
    description:
      "Cá dứa sống ở vùng nước lợ cửa sông Cần Giờ. Cá được làm sạch, xẻ đôi, ướp nhẹ rồi phơi một nắng để thịt vẫn còn mềm và giữ vị ngọt.\n\n" +
      "Khô cá dứa thịt dày, béo, chiên vàng hoặc nướng than đều thơm, ăn với cơm trắng hoặc làm món nhắm.",
    price: 380000,
    image: "/images/p-kho-ca-dua-can-gio-v2.jpg",
    region: "nam",
    brand: "Khô cá dứa Cần Giờ",
    origin: "Hồ Chí Minh",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "bieu-nguoi-lon"],
    story: {
      enjoy: "Chiên vàng hai mặt hoặc nướng than, ăn với cơm trắng và dưa leo, chấm nước mắm chua ngọt.",
      storage: "Bảo quản ngăn đá để giữ lâu; rã đông trước khi chiên nướng.",
    },
    createdAt: "2026-11-14T09:49:00.000Z",
  },
  {
    id: "me-xung-hue",
    name: "Mè xửng Huế",
    shortDescription: "Kẹo dẻo mạch nha với đậu phộng, phủ mè rang, ngọt thanh kiểu Huế, dùng với trà.",
    description:
      "Mè xửng được nấu từ mạch nha, đường và bột, cho thêm đậu phộng rang, rồi cán mỏng và phủ một lớp mè rang ở hai mặt.\n\n" +
      "Kẹo dẻo, ngọt thanh, thơm mùi mè và bùi đậu phộng. Mè xửng là món quà quen thuộc của du khách khi ghé Huế.",
    price: 45000,
    image: "/images/p-me-xung-hue.jpg",
    region: "trung",
    brand: "Mè xửng Huế",
    origin: "Huế",
    pack: "Hộp 250g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "qua-tet"],
    story: {
      enjoy: "Ăn cùng trà nóng; kẹo dẻo nên cắt miếng nhỏ vừa ăn.",
      storage: "Để nơi khô mát, đậy kín; trời nóng kẹo có thể mềm hơn.",
    },
    createdAt: "2026-11-14T09:47:00.000Z",
  },
  {
    id: "nem-lai-vung",
    name: "Nem Lai Vung",
    shortDescription: "Nem chua từ thịt heo, bì, tỏi, ớt gói lá chuối, chua nhẹ, giòn dai kiểu miền Tây.",
    description:
      "Thịt heo nạc tươi được xay nhuyễn, trộn với bì heo thái sợi, tỏi, ớt và gia vị, rồi gói kín trong lá. Sau vài ngày, nem lên men và có vị chua tự nhiên.\n\n" +
      "Nem Lai Vung có màu hồng tươi, giòn dai, chua nhẹ và thơm tỏi ớt, ăn vặt hoặc làm món nhắm đều hợp.",
    price: 60000,
    image: "/images/p-nem-lai-vung.jpg",
    region: "nam",
    brand: "Nem Lai Vung",
    origin: "Đồng Tháp",
    pack: "10 cái",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Ăn kèm tỏi, ớt, rau sống; hoặc chiên, nướng nem cho thơm.",
      storage: "Hàng giao lạnh. Bảo quản ngăn mát tủ lạnh, dùng trong khoảng một tuần.",
    },
    createdAt: "2026-11-14T09:46:00.000Z",
  },
  {
    id: "long-nhan-hung-yen",
    name: "Long nhãn Hưng Yên",
    shortDescription: "Cùi nhãn lồng Hưng Yên sấy khô, dày, màu nâu cánh gián, vị ngọt đậm, dùng nấu chè hoặc pha trà.",
    description:
      "Long nhãn là cùi nhãn đã được bóc và sấy khô. Nhãn lồng Hưng Yên quả to, cùi dày và ngọt, nên long nhãn làm từ nhãn lồng thường dày cùi và thơm.\n\n" +
      "Long nhãn dùng nấu chè hạt sen long nhãn, pha trà hoặc ăn trực tiếp như một món ăn vặt.",
    price: 120000,
    image: "/images/p-long-nhan-hung-yen.jpg",
    region: "bac",
    brand: "Nhãn lồng Hưng Yên",
    origin: "Hưng Yên",
    pack: "Túi 300g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "bieu-nguoi-lon"],
    story: {
      enjoy: "Nấu chè cùng hạt sen, pha với nước nóng như trà, hoặc ăn trực tiếp vài miếng.",
      storage: "Đựng trong hũ kín; sau khi mở nên cất ngăn mát tủ lạnh để cùi nhãn không bị ẩm.",
      season: "Nhãn lồng Hưng Yên chín vào khoảng tháng 7 – tháng 8, long nhãn mới thường có sau mùa này.",
    },
    createdAt: "2026-11-14T09:45:00.000Z",
  },
  {
    id: "hat-sen-dong-thap",
    name: "Hạt sen sấy Đồng Tháp",
    shortDescription: "Hạt sen Đồng Tháp đã bóc vỏ, bỏ tim, sấy khô, nấu chè hay hầm canh đều bùi và thơm.",
    description:
      "Sen được trồng nhiều ở vùng Đồng Tháp Mười. Hạt sen già được tách vỏ, bỏ tim rồi sấy khô để giữ được lâu.\n\n" +
      "Hạt sen nấu chín bùi, thơm nhẹ, dùng nấu chè hạt sen long nhãn, hầm gà hoặc nấu cơm sen.",
    price: 150000,
    image: "/images/p-hat-sen-dong-thap.jpg",
    region: "nam",
    brand: "Sen Đồng Tháp",
    origin: "Đồng Tháp",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "bieu-nguoi-lon"],
    story: {
      enjoy: "Ngâm hạt sen 2–3 tiếng cho mềm, rồi nấu chè, hầm gà hoặc hầm xương.",
      storage: "Để nơi khô ráo, đậy kín; muốn giữ lâu thì cất ngăn mát tủ lạnh.",
    },
    createdAt: "2026-11-14T09:43:00.000Z",
  },
  {
    id: "banh-cay-lang-nguyen",
    name: "Bánh cáy làng Nguyễn",
    shortDescription: "Bánh cáy làng Nguyễn làm từ gạo nếp, mạch nha, gấc, vừng và gừng, giòn xốp, ngọt thơm.",
    description:
      "Bánh cáy được làm từ gạo nếp rang nổ, trộn với mạch nha, đường, vừng, lạc, gấc, gừng và vỏ quýt, rồi nén vào khuôn và cắt thành miếng. Người ta kể rằng những hạt nổ nhiều màu trong bánh trông giống trứng con cáy, nên bánh có tên như vậy.\n\n" +
      "Bánh có vị ngọt, giòn xốp, thơm mùi gừng và vừng. Người Thái Bình dùng bánh cáy trong mâm cỗ cưới, ngày Tết và để mời khách cùng chén trà.",
    price: 60000,
    image: "/images/p-banh-cay-lang-nguyen.jpg",
    region: "bac",
    brand: "Bánh cáy làng Nguyễn",
    origin: "Hưng Yên",
    pack: "Hộp 300g",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "an-vat"],
    story: {
      enjoy: "Ăn cùng trà xanh hoặc trà sen; cắt miếng mỏng bày đĩa mời khách ngày Tết.",
      storage: "Để nơi khô ráo, đậy kín để bánh không bị ỉu.",
    },
    createdAt: "2026-11-14T09:42:00.000Z",
  },
  {
    id: "banh-trang-dai-loc",
    name: "Bánh tráng Đại Lộc",
    shortDescription: "Bánh tráng gạo tráng mỏng, phơi nắng trên giàn tre, dùng cuốn thịt heo luộc hoặc nướng ăn giòn.",
    description:
      "Gạo được ngâm, xay thành bột nước rồi tráng mỏng trên nồi hấp, sau đó trải lên giàn tre phơi nắng cho khô. Ở Đại Lộc có loại bánh tráng mỏng để cuốn và loại dày có rắc mè để nướng.\n\n" +
      "Bánh tráng Đại Lộc là thứ không thể thiếu khi ăn món bánh tráng cuốn thịt heo hai đầu da, đặc sản của vùng.",
    price: 50000,
    image: "/images/p-banh-trang-dai-loc.jpg",
    region: "trung",
    brand: "Bánh tráng Đại Lộc",
    origin: "Đà Nẵng",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Nhúng bánh qua nước rồi cuốn thịt heo luộc, rau sống, chấm mắm nêm; loại bánh dày có mè thì nướng giòn.",
      storage: "Để nơi khô ráo, buộc kín túi để bánh không bị ẩm.",
    },
    createdAt: "2026-11-14T09:41:00.000Z",
  },
  {
    id: "hu-tieu-my-tho",
    name: "Hủ tiếu khô Mỹ Tho",
    shortDescription: "Sợi hủ tiếu khô làm từ gạo, sợi nhỏ, dai, trong, để nấu hủ tiếu nước hay xào.",
    description:
      "Hủ tiếu Mỹ Tho được làm từ bột gạo, tráng thành bánh, phơi khô rồi cắt sợi. Sợi hủ tiếu nhỏ, dai và trong, nấu không bị nhão.\n\n" +
      "Sợi khô dùng để nấu hủ tiếu Mỹ Tho với nước dùng xương heo, tôm, thịt bằm, hoặc làm hủ tiếu xào.",
    price: 40000,
    image: "/images/p-hu-tieu-my-tho-v2.jpg",
    region: "nam",
    brand: "Hủ tiếu Mỹ Tho",
    origin: "Đồng Tháp",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Trụng sợi trong nước sôi khoảng 1–2 phút, xả nước lạnh, rồi chan nước dùng hoặc xào.",
      storage: "Để nơi khô ráo, buộc kín túi sau khi mở.",
    },
    createdAt: "2026-11-14T09:40:00.000Z",
  },
  {
    id: "tuong-ban",
    name: "Tương Bần",
    shortDescription: "Tương làm từ xôi nếp lên mốc, đậu tương rang và muối, phơi nắng nhiều tháng, vị ngọt đậm.",
    description:
      "Tương Bần được làm từ ba nguyên liệu chính: gạo nếp, đậu tương và muối. Xôi nếp được ủ cho lên mốc vàng, đậu tương rang rồi ngâm nước, sau đó trộn cùng muối và phơi nắng trong chum nhiều tháng.\n\n" +
      "Tương có màu vàng sánh, vị ngọt đậm và mặn nhẹ. Đây là nước chấm quen thuộc cho rau muống luộc, đậu phụ rán và các món om, kho của người miền Bắc.",
    price: 35000,
    image: "/images/p-tuong-ban-v3.jpg",
    region: "bac",
    brand: "Tương Bần",
    origin: "Hưng Yên",
    pack: "Chai 500ml",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Chấm rau muống luộc, đậu phụ, thịt luộc; dùng để om cá, kho thịt, làm món ốc om chuối đậu.",
      storage: "Đậy kín, để nơi thoáng mát; sau khi mở nên cất ngăn mát tủ lạnh.",
    },
    createdAt: "2026-11-14T09:39:00.000Z",
  },
  {
    id: "toi-ly-son",
    name: "Tỏi Lý Sơn",
    shortDescription: "Tỏi trồng trên đất cát của đảo Lý Sơn, củ nhỏ, tép chắc, thơm, cay nhẹ và có hậu ngọt.",
    description:
      "Trên đảo Lý Sơn, người dân trồng tỏi trên lớp cát trắng phủ lên nền đất núi lửa. Tỏi được thu hoạch, phơi khô và bó thành từng chùm.\n\n" +
      "Tỏi Lý Sơn củ nhỏ, tép trắng, chắc, mùi thơm dịu, vị cay nhẹ và có hậu ngọt. Dùng phi thơm, làm nước chấm hoặc ngâm mật ong.",
    price: 120000,
    image: "/images/p-toi-ly-son-v2.jpg",
    region: "trung",
    brand: "Tỏi Lý Sơn",
    origin: "Quảng Ngãi",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Phi thơm để xào, nấu; giã với ớt làm nước chấm; hoặc ngâm với mật ong.",
      storage: "Treo hoặc để nơi khô thoáng, tránh ẩm để tỏi không mọc mầm.",
    },
    createdAt: "2026-11-14T09:38:00.000Z",
  },
  {
    id: "lap-xuong-soc-trang",
    name: "Lạp xưởng Sóc Trăng",
    shortDescription: "Lạp xưởng thịt heo nạc, mỡ, ướp rượu mai quế lộ, phơi khô, chiên hay hấp đều thơm ngọt.",
    description:
      "Lạp xưởng được làm từ thịt heo nạc và mỡ thái hạt lựu, ướp đường, muối, rượu mai quế lộ, rồi nhồi vào ruột heo và phơi khô.\n\n" +
      "Lạp xưởng có vị ngọt đậm, thơm mùi rượu, dùng để chiên ăn với cơm, hấp, làm xôi lạp xưởng hoặc cơm chiên.",
    price: 150000,
    image: "/images/p-lap-xuong-soc-trang-v2.jpg",
    region: "nam",
    brand: "Lạp xưởng Sóc Trăng",
    origin: "Cần Thơ",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "vao-bep"],
    story: {
      enjoy: "Chiên lửa nhỏ với chút nước cho chín đều, hoặc hấp; thái lát ăn với cơm, dưa chua.",
      storage: "Bảo quản ngăn mát (khoảng 1 tháng) hoặc ngăn đá để giữ lâu hơn.",
    },
    createdAt: "2026-11-14T09:37:00.000Z",
  },
  {
    id: "com-chay-ninh-binh",
    name: "Cơm cháy Ninh Bình",
    shortDescription: "Cơm cháy giòn rụm làm từ gạo, chiên vàng, ăn vặt hoặc chan sốt theo kiểu Ninh Bình.",
    description:
      "Cơm được nấu rồi ép mỏng, phơi khô, sau đó chiên giòn thành những miếng cơm cháy vàng ruộm. Đây là món ăn nổi tiếng của Ninh Bình, quen thuộc với khách du lịch Tràng An, Tam Cốc.\n\n" +
      "Cơm cháy chiên sẵn giòn tan, thơm mùi gạo, có thể ăn vặt trực tiếp hoặc chan sốt tim cật như cách ăn truyền thống.",
    price: 40000,
    image: "/images/p-com-chay-ninh-binh.jpg",
    region: "bac",
    brand: "Cơm cháy Ninh Bình",
    origin: "Ninh Bình",
    pack: "Gói 200g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Ăn trực tiếp như bánh snack, hoặc chan sốt tim cật, sốt thịt bò khi ăn theo kiểu Ninh Bình.",
      storage: "Buộc kín túi sau khi mở để cơm cháy luôn giòn; để nơi khô ráo, tránh ẩm.",
    },
    createdAt: "2026-11-14T09:36:00.000Z",
  },
  {
    id: "mach-nha-thi-pho",
    name: "Mạch nha Thi Phổ",
    shortDescription: "Mạch nha nấu từ nếp và mầm lúa theo cách truyền thống, trong vàng, ngọt thanh, ăn kèm bánh tráng.",
    description:
      "Mạch nha được nấu từ gạo nếp và mầm lúa (lúa nảy mầm), lọc lấy nước rồi cô nhiều giờ trên bếp cho đến khi sánh và trong.\n\n" +
      "Mạch nha Thi Phổ có màu vàng hổ phách, vị ngọt thanh. Người Quảng Ngãi thường cuộn mạch nha bằng đôi đũa rồi kẹp giữa hai miếng bánh tráng mè để ăn.",
    price: 55000,
    image: "/images/p-mach-nha-thi-pho.jpg",
    region: "trung",
    brand: "Mạch nha Thi Phổ",
    origin: "Quảng Ngãi",
    pack: "Hũ 500g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "vao-bep"],
    story: {
      enjoy: "Dùng đũa cuộn mạch nha kẹp giữa bánh tráng mè; hoặc dùng tạo vị ngọt khi kho, nấu chè.",
      storage: "Đậy kín, để nơi khô mát; trời lạnh mạch nha đặc lại thì ngâm hũ vào nước ấm cho mềm.",
    },
    createdAt: "2026-11-14T09:35:00.000Z",
  },
  {
    id: "mam-chau-doc",
    name: "Mắm cá lóc Châu Đốc",
    shortDescription: "Mắm cá lóc Châu Đốc ủ chín, thịt cá mềm, vị mặn ngọt, dùng chưng, kho hoặc nấu lẩu mắm.",
    description:
      "Cá lóc đồng được làm sạch, ướp muối, rồi trộn với thính gạo rang và đường thốt nốt, ủ trong khạp nhiều tháng cho đến khi mắm chín.\n\n" +
      "Mắm cá lóc có thịt cá mềm, màu đỏ nâu, vị mặn ngọt đậm đà. Dùng để chưng thịt, kho, ăn sống trộn tỏi ớt chanh, hoặc nấu lẩu mắm.",
    price: 90000,
    image: "/images/p-mam-chau-doc.jpg",
    region: "nam",
    brand: "Mắm Châu Đốc",
    origin: "An Giang",
    pack: "Hũ 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Chưng với thịt heo bằm, trứng; kho với thịt ba chỉ; hoặc nấu nước lẩu mắm.",
      storage: "Đậy kín hũ, bảo quản ngăn mát tủ lạnh sau khi mở.",
    },
    createdAt: "2026-11-14T09:34:00.000Z",
  },
  {
    id: "che-shan-tuyet-moc-chau",
    name: "Chè Shan tuyết Mộc Châu",
    shortDescription: "Chè từ giống Shan tuyết trên cao nguyên Mộc Châu, búp có lông tơ trắng, nước vàng sánh, hương thơm.",
    description:
      "Shan tuyết là giống chè cây lớn ở vùng núi cao phía Bắc; búp chè có lớp lông tơ trắng như phủ tuyết. Cao nguyên Mộc Châu có khí hậu mát mẻ quanh năm, hợp với cây chè.\n\n" +
      "Chè pha cho nước vàng sánh, hương thơm dịu, vị chát nhẹ và ngọt hậu rõ.",
    price: 150000,
    image: "/images/p-che-shan-tuyet-moc-chau.jpg",
    region: "bac",
    brand: "Chè Shan tuyết Mộc Châu",
    origin: "Sơn La",
    pack: "Gói 200g",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon", "qua-tet"],
    story: {
      enjoy: "Tráng ấm, cho khoảng 5–7g chè, rót nước khoảng 90°C, đợi 1–2 phút. Chè Shan tuyết pha được nhiều nước.",
      storage: "Đựng hộp kín, để nơi khô mát, tránh nắng và đồ có mùi.",
    },
    createdAt: "2026-11-14T09:33:00.000Z",
  },
  {
    id: "ho-tieu-chu-se",
    name: "Hồ tiêu Chư Sê",
    shortDescription: "Hạt tiêu đen trồng trên đất đỏ bazan Chư Sê, hạt chắc, cay nồng và thơm.",
    description:
      "Chư Sê là một trong những vùng trồng hồ tiêu lớn của Tây Nguyên. Tiêu được trồng trên đất đỏ bazan, thu hái khi chín rồi phơi khô thành tiêu đen.\n\n" +
      "Hạt tiêu Chư Sê chắc, đều hạt, vị cay nồng và mùi thơm rõ. Xay mới khi dùng để giữ trọn hương.",
    price: 65000,
    image: "/images/p-ho-tieu-chu-se.jpg",
    region: "trung",
    brand: "Hồ tiêu Chư Sê",
    origin: "Gia Lai",
    pack: "Hũ 200g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Xay hoặc giã ngay khi dùng; rắc vào cháo, canh, ướp thịt, làm muối tiêu chanh.",
      storage: "Đựng hũ kín, để nơi khô ráo, tránh ánh nắng.",
    },
    createdAt: "2026-11-14T09:32:00.000Z",
  },
  {
    id: "duong-thot-not",
    name: "Đường thốt nốt An Giang",
    shortDescription: "Đường nấu từ nước hoa thốt nốt vùng Bảy Núi, màu vàng nâu, vị ngọt thanh và thơm.",
    description:
      "Người dân vùng Bảy Núi trèo lên ngọn cây thốt nốt để lấy nước từ buồng hoa, rồi nấu nhiều giờ trên bếp củi cho đến khi cô đặc thành đường.\n\n" +
      "Đường thốt nốt có màu vàng nâu, vị ngọt thanh, thơm đặc trưng. Dùng nấu chè, kho cá, kho thịt hoặc ăn trực tiếp.",
    price: 85000,
    image: "/images/p-duong-thot-not-v2.jpg",
    region: "nam",
    brand: "Đường thốt nốt An Giang",
    origin: "An Giang",
    pack: "Túi 1kg",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Dùng nấu chè, làm bánh, kho cá kho thịt cho màu đẹp và vị ngọt thanh; có thể ăn trực tiếp như kẹo.",
      storage: "Để nơi khô ráo, đậy kín vì đường dễ hút ẩm.",
    },
    createdAt: "2026-11-14T09:31:00.000Z",
  },
  {
    id: "thit-trau-gac-bep",
    name: "Thịt trâu gác bếp Sơn La",
    shortDescription: "Thịt trâu tẩm mắc khén, gừng, ớt, hun khói trên gác bếp kiểu người Thái, xé sợi ăn dai và thơm.",
    description:
      "Thịt trâu được thái thành thớ dài, ướp với muối, gừng, ớt, sả và hạt mắc khén, rồi treo trên gác bếp để khói củi hun khô dần. Đây là cách người Thái ở Tây Bắc dự trữ thịt cho mùa đông.\n\n" +
      "Thịt có màu nâu sẫm, xé ra thành sợi, dai và thơm mùi khói bếp lẫn vị cay nồng của mắc khén. Món này hợp làm món nhắm hoặc quà biếu.",
    price: 480000,
    image: "/images/p-thit-trau-gac-bep.jpg",
    region: "bac",
    brand: "Thịt trâu gác bếp Sơn La",
    origin: "Sơn La",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon", "qua-tet"],
    story: {
      enjoy: "Hấp hoặc nướng sơ cho mềm thơm, đập dập rồi xé sợi, chấm chẩm chéo hoặc tương ớt.",
      storage: "Bảo quản ngăn mát tủ lạnh (khoảng 1–2 tháng) hoặc ngăn đá để giữ lâu hơn.",
    },
    createdAt: "2026-11-14T09:30:00.000Z",
  },
  {
    id: "bo-mot-nang-krong-pa",
    name: "Bò một nắng Krông Pa",
    shortDescription: "Thịt bò thái miếng tẩm gia vị, phơi đúng một nắng, nướng lên mềm ngọt, chấm muối kiến vàng.",
    description:
      "Thịt bò được thái miếng mỏng, ướp muối, tiêu, sả, ớt rồi phơi dưới nắng gió Krông Pa trong một ngày. Thịt khô bên ngoài nhưng vẫn mềm bên trong.\n\n" +
      "Khi nướng, bò một nắng mềm, ngọt và thơm mùi sả ớt. Món này thường ăn kèm muối kiến vàng, một đặc sản khác của vùng.",
    price: 260000,
    image: "/images/p-bo-mot-nang-krong-pa.jpg",
    region: "trung",
    brand: "Bò một nắng Krông Pa",
    origin: "Gia Lai",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "bieu-nguoi-lon"],
    story: {
      enjoy: "Nướng than hoặc chiên sơ, xé miếng vừa ăn, chấm muối kiến vàng hoặc tương ớt.",
      storage: "Bảo quản ngăn mát (khoảng 1 tuần) hoặc ngăn đá để giữ lâu hơn.",
    },
    createdAt: "2026-11-14T09:29:00.000Z",
  },
  {
    id: "xoai-cat-hoa-loc",
    name: "Xoài cát Hòa Lộc",
    shortDescription: "Xoài cát Hòa Lộc chín vàng, thịt dày, mịn, ngọt thơm và ít xơ.",
    description:
      "Xoài cát Hòa Lộc có nguồn gốc từ vùng Hòa Lộc, Cái Bè, nơi đất phù sa ven sông Tiền. Quả thuôn dài, khi chín vỏ chuyển sang màu vàng.\n\n" +
      "Thịt xoài màu vàng, dày, mịn, ít xơ, vị ngọt đậm và thơm. Xoài ăn tươi, làm sinh tố hoặc làm quà biếu đều hợp.",
    price: 180000,
    image: "/images/p-xoai-cat-hoa-loc.jpg",
    region: "nam",
    brand: "Xoài cát Hòa Lộc",
    origin: "Đồng Tháp",
    pack: "Thùng 2kg",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon", "an-vat"],
    story: {
      enjoy: "Để xoài chín vàng đều rồi gọt ăn; cho vào ngăn mát khoảng 1 tiếng trước khi ăn sẽ ngon hơn.",
      storage: "Hàng tươi. Xoài còn xanh để nơi thoáng mát cho chín dần; xoài đã chín cất ngăn mát và dùng trong 3–5 ngày.",
    },
    createdAt: "2026-11-14T09:28:00.000Z",
  },
  {
    id: "gao-tam-dien-bien",
    name: "Gạo tám Điện Biên",
    shortDescription: "Gạo tám trồng ở lòng chảo Điện Biên, hạt nhỏ dài, cơm dẻo, thơm và ngọt.",
    description:
      "Lòng chảo Điện Biên với cánh đồng Mường Thanh là vựa lúa lớn nhất vùng Tây Bắc. Đất phù sa và khí hậu chênh lệch ngày đêm giúp hạt gạo ở đây thơm và dẻo.\n\n" +
      "Gạo tám Điện Biên có hạt nhỏ, dài, trong. Cơm nấu chín dẻo, mềm, có mùi thơm nhẹ.",
    price: 175000,
    image: "/images/p-gao-tam-dien-bien.jpg",
    region: "bac",
    brand: "Gạo Điện Biên",
    origin: "Điện Biên",
    pack: "Túi 5kg",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "qua-tet"],
    story: {
      enjoy: "Vo nhẹ 1–2 lần, nấu với lượng nước ít hơn gạo thường một chút để cơm dẻo vừa.",
      storage: "Để nơi khô ráo, thoáng mát, đậy kín để tránh mọt.",
    },
    createdAt: "2026-11-14T09:27:00.000Z",
  },
  {
    id: "nho-say-ninh-thuan",
    name: "Nho sấy Ninh Thuận",
    shortDescription: "Nho Ninh Thuận sấy dẻo, chua ngọt tự nhiên, ăn vặt hoặc làm bánh.",
    description:
      "Ninh Thuận có khí hậu khô, nhiều nắng, hợp với cây nho; ở đây nho cho thu hoạch nhiều vụ trong năm. Nho chín được sấy dẻo để giữ lâu và dễ mang đi xa.\n\n" +
      "Nho sấy có vị chua ngọt tự nhiên, dẻo và thơm. Ăn trực tiếp, trộn sữa chua, làm bánh hoặc pha trà.",
    price: 85000,
    image: "/images/p-nho-say-ninh-thuan-v2.jpg",
    region: "trung",
    brand: "Nho Ninh Thuận",
    origin: "Khánh Hòa",
    pack: "Hộp 300g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat"],
    story: {
      enjoy: "Ăn trực tiếp, trộn với sữa chua, ngũ cốc hoặc cho vào bánh.",
      storage: "Đậy kín hộp, để nơi khô mát; cất ngăn mát tủ lạnh sau khi mở.",
    },
    createdAt: "2026-11-14T09:26:00.000Z",
  },
  {
    id: "dua-sap-cau-ke",
    name: "Dừa sáp Cầu Kè",
    shortDescription: "Trái dừa sáp Cầu Kè có cơm dày, đặc và dẻo, nước sánh, nạo ăn với đá và sữa hoặc làm kem.",
    description:
      "Dừa sáp là một giống dừa đặc biệt: cơm dừa dày, mềm dẻo như sáp và lấp gần đầy trái, nước ít và sánh. Cầu Kè là nơi trồng dừa sáp nổi tiếng nhất của miền Tây.\n\n" +
      "Dừa sáp thường được nạo ra ăn cùng đá bào, sữa đặc hoặc đường, hoặc dùng làm kem, làm bánh.",
    price: 120000,
    image: "/images/p-dua-sap-cau-ke.jpg",
    region: "nam",
    brand: "Dừa sáp Cầu Kè",
    origin: "Vĩnh Long",
    pack: "1 trái",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "bieu-nguoi-lon"],
    story: {
      enjoy: "Bổ đôi trái dừa, nạo cơm dừa ra ly, thêm đá bào và chút sữa đặc hoặc đường.",
      storage: "Hàng tươi. Để nơi thoáng mát; sau khi bổ thì cất ngăn mát và dùng trong 1–2 ngày.",
    },
    createdAt: "2026-11-14T09:25:00.000Z",
  },
  {
    id: "mat-ong-bac-ha-meo-vac",
    name: "Mật ong bạc hà Mèo Vạc",
    shortDescription: "Mật ong từ hoa bạc hà dại trên cao nguyên đá, màu vàng sáng, vị ngọt thanh, thoảng hương bạc hà.",
    description:
      "Vào mùa đông, những triền núi đá ở Mèo Vạc nở đầy hoa bạc hà dại. Người dân nuôi ong để lấy mật từ loài hoa này, tạo nên một loại mật ong đặc trưng của cao nguyên đá.\n\n" +
      "Mật có màu vàng sáng, vị ngọt thanh, hơi the nhẹ ở cuối vị. Mật ong bạc hà dễ kết tinh khi trời lạnh; đó là hiện tượng tự nhiên.",
    price: 320000,
    image: "/images/p-mat-ong-bac-ha-meo-vac-v2.jpg",
    region: "bac",
    brand: "Mật ong bạc hà Mèo Vạc",
    origin: "Tuyên Quang",
    pack: "Chai 500ml",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon", "qua-tet"],
    story: {
      enjoy: "Pha với nước ấm (không quá nóng) kèm chanh hoặc gừng; ăn cùng bánh mì, sữa chua. Không dùng mật ong cho trẻ dưới 1 tuổi.",
      storage: "Đậy kín nắp, để nơi khô mát, không cần để tủ lạnh. Mật kết tinh thì ngâm chai vào nước ấm cho tan.",
      season: "Hoa bạc hà nở vào mùa đông, khoảng tháng 10 đến tháng 12.",
    },
    createdAt: "2026-11-14T09:24:00.000Z",
  },
  {
    id: "muc-mot-nang-nha-trang",
    name: "Mực một nắng Nha Trang",
    shortDescription: "Mực tươi phơi một nắng, thịt dày, ngọt, nướng hay chiên đều dai mềm và thơm.",
    description:
      "Mực câu về được làm sạch rồi phơi dưới nắng trong khoảng một ngày. Phơi một nắng giúp mực se mặt ngoài nhưng thịt bên trong vẫn mềm và giữ vị ngọt.\n\n" +
      "Mực một nắng nướng than hoặc chiên có vị ngọt, dai mềm, chấm tương ớt rất hợp.",
    price: 320000,
    image: "/images/p-muc-mot-nang-nha-trang.jpg",
    region: "trung",
    brand: "Mực một nắng Nha Trang",
    origin: "Khánh Hòa",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep", "bieu-nguoi-lon"],
    story: {
      enjoy: "Nướng than hoặc chiên vàng hai mặt, chấm tương ớt hoặc muối ớt xanh.",
      storage: "Hàng giao lạnh. Bảo quản ngăn đá; rã đông trong ngăn mát trước khi chế biến.",
    },
    createdAt: "2026-11-14T09:23:00.000Z",
  },
  {
    id: "hat-de-trung-khanh",
    name: "Hạt dẻ Trùng Khánh",
    shortDescription: "Hạt dẻ Trùng Khánh to, vỏ nâu bóng, ruột vàng, rang lên bùi và ngọt thơm.",
    description:
      "Trùng Khánh là vùng cao của Cao Bằng, nơi cây dẻ được trồng trên đồi núi. Hạt dẻ ở đây to tròn, vỏ màu nâu bóng.\n\n" +
      "Hạt dẻ rang hoặc luộc có ruột vàng, bùi, ngọt và thơm. Dẻ cũng dùng để hầm gà, nấu xôi hoặc nấu chè.",
    price: 110000,
    image: "/images/p-hat-de-trung-khanh-v2.jpg",
    region: "bac",
    brand: "Hạt dẻ Trùng Khánh",
    origin: "Cao Bằng",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["an-vat", "vao-bep"],
    story: {
      enjoy: "Khía nhẹ vỏ rồi rang với cát hoặc nướng; luộc khoảng 20 phút; hoặc bóc vỏ để hầm gà, nấu xôi.",
      storage: "Để ngăn mát tủ lạnh, dùng trong khoảng 2–3 tuần.",
    },
    createdAt: "2026-11-14T09:22:00.000Z",
  },
  {
    id: "tra-atiso-da-lat",
    name: "Trà atiso Đà Lạt",
    shortDescription: "Trà túi lọc từ hoa, lá atiso Đà Lạt, nước màu nâu, vị ngọt nhẹ, uống nóng hay lạnh đều ngon.",
    description:
      "Atiso là loài cây xứ lạnh được người Pháp đưa lên Đà Lạt từ đầu thế kỷ 20. Hoa, lá, thân và rễ atiso được thái nhỏ, sấy khô để làm trà.\n\n" +
      "Trà atiso túi lọc tiện pha, nước có màu nâu nhạt, vị ngọt nhẹ và hơi đắng. Đây là món quà quen thuộc khi du lịch Đà Lạt.",
    price: 55000,
    image: "/images/p-tra-atiso-da-lat.jpg",
    region: "trung",
    brand: "Atiso Đà Lạt",
    origin: "Lâm Đồng",
    pack: "Hộp 20 túi lọc",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon"],
    story: {
      enjoy: "Pha 1 túi với khoảng 200ml nước sôi, đợi 3–5 phút; uống nóng hoặc thêm đá.",
      storage: "Để nơi khô ráo, đậy kín hộp.",
    },
    createdAt: "2026-11-14T09:21:00.000Z",
  },
  {
    id: "hoa-hoi-lang-son",
    name: "Hoa hồi Lạng Sơn",
    shortDescription: "Hoa hồi khô tám cánh của Lạng Sơn, thơm nồng, dùng nấu phở, kho thịt và các món hầm.",
    description:
      "Hồi là cây gia vị trồng nhiều trên đồi núi Lạng Sơn. Quả hồi hình ngôi sao tám cánh, được hái về phơi hoặc sấy khô.\n\n" +
      "Hoa hồi Lạng Sơn có mùi thơm nồng, ngọt ấm. Đây là gia vị không thể thiếu khi nấu nước dùng phở, kho thịt, hầm xương và làm ngũ vị hương.",
    price: 45000,
    image: "/images/p-hoa-hoi-lang-son.jpg",
    region: "bac",
    brand: "Hoa hồi Lạng Sơn",
    origin: "Lạng Sơn",
    pack: "Gói 100g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Rang sơ cho dậy mùi rồi cho vào nồi nước dùng phở, bò kho hoặc thịt hầm; vài cánh hồi là đủ thơm cả nồi.",
      storage: "Đựng hũ kín, để nơi khô ráo, tránh ẩm để giữ mùi thơm.",
    },
    createdAt: "2026-11-14T09:20:00.000Z",
  },
  {
    id: "nuoc-mam-phan-thiet",
    name: "Nước mắm Phan Thiết",
    shortDescription: "Nước mắm cá cơm ủ chượp truyền thống của Phan Thiết, màu cánh gián, thơm, vị mặn đậm và ngọt hậu.",
    description:
      "Phan Thiết là một trong những thủ phủ nước mắm của Việt Nam. Cá cơm đánh bắt ngoài khơi được trộn muối, ủ chượp trong thùng gỗ nhiều tháng rồi rút lấy nước mắm.\n\n" +
      "Nước mắm có màu cánh gián, mùi thơm đặc trưng, vị mặn đậm và ngọt hậu, dùng để chấm và nêm nấu.",
    price: 95000,
    image: "/images/p-nuoc-mam-phan-thiet-v2.jpg",
    region: "trung",
    brand: "Nước mắm Phan Thiết",
    origin: "Lâm Đồng",
    pack: "Chai 500ml",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Chấm trực tiếp, pha nước mắm chua ngọt, hoặc nêm canh, kho cá kho thịt.",
      storage: "Đậy kín nắp, để nơi thoáng mát, tránh ánh nắng trực tiếp.",
    },
    createdAt: "2026-11-14T09:19:00.000Z",
  },
  {
    id: "que-van-yen",
    name: "Quế Văn Yên",
    shortDescription: "Quế vỏ Văn Yên dày, nhiều tinh dầu, vị cay ngọt, dùng nấu ăn, pha trà hoặc làm bánh.",
    description:
      "Văn Yên là vùng trồng quế lớn của miền Bắc. Vỏ quế được bóc từ thân cây, phơi hoặc sấy khô rồi cắt thành thanh.\n\n" +
      "Quế Văn Yên có vỏ dày, nhiều tinh dầu, mùi thơm ấm và vị cay ngọt. Quế dùng để nấu phở, kho, làm bánh, pha trà quế.",
    price: 55000,
    image: "/images/p-que-van-yen.jpg",
    region: "bac",
    brand: "Quế Văn Yên",
    origin: "Lào Cai",
    pack: "Gói 200g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Bẻ một mẩu quế cho vào nồi phở, thịt kho; pha trà quế với mật ong; hoặc xay bột làm bánh.",
      storage: "Đựng hũ kín, để nơi khô ráo, tránh ánh nắng.",
    },
    createdAt: "2026-11-14T09:18:00.000Z",
  },
  {
    id: "ca-phe-khe-sanh",
    name: "Cà phê Khe Sanh",
    shortDescription: "Cà phê chè (arabica) trồng trên vùng đồi Khe Sanh, rang mộc, hương thơm, vị chua nhẹ và đắng dịu.",
    description:
      "Khe Sanh thuộc huyện Hướng Hóa, vùng đồi núi phía tây Quảng Trị, nơi cây cà phê được người Pháp đưa vào trồng từ đầu thế kỷ 20. Khí hậu mát và đất đỏ bazan giúp hạt cà phê ở đây có hương thơm riêng.\n\n" +
      "Cà phê được rang mộc và xay sẵn, pha phin cho nước nâu sánh, vị đắng dịu, chua nhẹ và thơm. Hợp uống đen đá hoặc pha với sữa.",
    price: 140000,
    image: "/images/p-ca-phe-khe-sanh-v2.jpg",
    region: "trung",
    brand: "Cà phê Khe Sanh",
    origin: "Quảng Trị",
    pack: "Gói 500g",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon"],
    story: {
      enjoy: "Pha phin khoảng 20–25g cà phê với nước sôi, ủ 30 giây rồi rót đầy; uống đen hoặc thêm sữa đặc.",
      storage: "Đóng kín túi sau khi mở, để nơi khô mát, tránh ánh nắng; nên dùng trong khoảng 1 tháng sau khi mở.",
    },
    createdAt: "2026-11-14T09:17:00.000Z",
  },
  {
    id: "yen-sao-khanh-hoa",
    name: "Yến sào Khánh Hòa",
    shortDescription: "Tổ yến thô khai thác từ hang đảo ven biển Khánh Hòa, sợi dày, dùng chưng đường phèn hoặc nấu chè.",
    description:
      "Chim yến làm tổ bằng nước bọt trong các hang đá trên đảo. Ở Khánh Hòa, nghề khai thác tổ yến đảo đã có từ lâu, tổ yến được thu hoạch theo mùa làm tổ của chim.\n\n" +
      "Tổ yến thô còn lẫn lông chim, cần ngâm và nhặt sạch trước khi nấu. Người Việt thường chưng yến với đường phèn, nấu chè hoặc cháo yến, và coi đây là món quà biếu trang trọng cho người lớn tuổi.",
    price: 1500000,
    image: "/images/p-yen-sao-khanh-hoa.jpg",
    region: "trung",
    brand: "Yến đảo Khánh Hòa",
    origin: "Khánh Hòa",
    pack: "Hộp 50g",
    stock: INITIAL_STOCK,
    occasions: ["bieu-nguoi-lon", "qua-tet"],
    story: {
      enjoy: "Ngâm tổ yến trong nước sạch khoảng 1–2 tiếng cho nở, nhặt sạch lông, rồi chưng cách thủy với đường phèn khoảng 20–30 phút.",
      storage: "Để nơi khô ráo, đậy kín hộp, tránh ẩm; yến đã ngâm nở thì để ngăn mát và dùng trong vài ngày.",
    },
    createdAt: "2026-11-14T09:15:00.000Z",
  },
  {
    id: "duong-phen-quang-ngai",
    name: "Đường phèn Quảng Ngãi",
    shortDescription: "Đường phèn kết tinh từ nước mía theo cách truyền thống, vị ngọt thanh, dùng chưng yến, nấu chè, pha trà.",
    description:
      "Nước mía được nấu và lọc, rồi để kết tinh chậm thành những tinh thể đường trong, màu vàng nhạt. Quảng Ngãi có nghề làm đường từ lâu và nổi tiếng với đường phèn, đường phổi.\n\n" +
      "Đường phèn có vị ngọt thanh, dịu hơn đường cát, thường dùng để chưng yến, nấu chè, hầm lê hoặc pha trà.",
    price: 45000,
    image: "/images/p-duong-phen-quang-ngai.jpg",
    region: "trung",
    brand: "Đường phèn Quảng Ngãi",
    origin: "Quảng Ngãi",
    pack: "Túi 500g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Dùng chưng yến, nấu chè hạt sen, hầm lê, hoặc pha nước chanh, trà gừng.",
      storage: "Đựng hũ kín, để nơi khô ráo vì đường dễ hút ẩm.",
    },
    createdAt: "2026-11-14T09:14:00.000Z",
  },
];

// Đổi 5 món (11/2026) để cả 34 tỉnh đều có sản phẩm, mỗi miền vẫn 20 món: Nước mắm Cát Hải -> Bánh gai Ninh Giang,
// Bánh cốm -> Vải thiều sấy Lục Ngạn (Bắc Ninh), Trà sen Tây Hồ -> Bưởi Đoan Hùng (Phú Thọ),
// Bánh đa nem làng Chều -> Thảo quả Lai Châu (Lai Châu), Nước mắm Nam Ô -> Cam Vinh (Nghệ An).
// Mỗi món mới giữ ngày tạo của món cũ, để thứ tự "Mới nhất" không đổi. Trình duyệt cũ nhận nhóm này MỘT LẦN
// (seedBatches "du-34-tinh"); món cũ được bỏ bởi các bước replace-* trong runMigrations (src/lib/storage.ts).
// Bưởi và Cam Vinh là trái cây tươi theo mùa (ngoại lệ của tiêu chí "đồ khô hoặc đóng gói kín"): câu chuyện sản phẩm ghi rõ hạn dùng.
export const fullProvinceProducts: Product[] = [
  {
    id: "banh-gai-ninh-giang",
    name: "Bánh gai Ninh Giang",
    shortDescription: "Bánh nếp bọc lá chuối, vỏ đen từ lá gai, nhân dừa và đậu, dẻo thơm mùi lá gai.",
    description:
      "Bánh gai là đặc sản của vùng Ninh Giang, Hải Dương cũ (nay thuộc Hải Phòng). Vỏ bánh làm từ bột nếp trộn lá gai nấu nhừ nên có màu đen bóng và mùi thơm riêng của lá gai.\n\n" +
      "Nhân bánh thường có dừa, đậu và chút mỡ heo, bánh được gói lá chuối rồi hấp chín. Bánh dẻo, ngọt bùi, béo nhẹ, hợp làm quà biếu hoặc ăn nhẹ cùng trà nóng.",
    price: 60000,
    image: "/images/p-banh-gai-ninh-giang.jpg",
    region: "bac",
    brand: "Bánh gai Ninh Giang",
    origin: "Hải Phòng",
    pack: "Hộp 6 cái",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "an-vat"],
    story: {
      enjoy: "Bóc lá, cắt miếng ăn ngay hoặc hấp lại vài phút cho bánh mềm dẻo; hợp ăn cùng trà nóng.",
      storage: "Hàng làm mới, giao nhanh. Bánh làm từ nếp nên mau cứng: để ngăn mát và dùng trong vài ngày; hấp lại trước khi ăn.",
    },
    createdAt: "2026-11-14T09:48:00.000Z",
  },
  {
    id: "vai-thieu-say-luc-ngan",
    name: "Vải thiều sấy Lục Ngạn",
    shortDescription: "Vải thiều Lục Ngạn sấy khô nguyên quả, cùi dẻo, ngọt đậm, thơm mùi khói nhẹ.",
    description:
      "Lục Ngạn (Bắc Giang cũ, nay thuộc Bắc Ninh) là vùng vải thiều lớn nhất cả nước; vải thiều Lục Ngạn được bảo hộ chỉ dẫn địa lý trong nước và được Nhật Bản bảo hộ năm 2021. Sau mùa vải tươi, một phần quả được sấy khô nguyên vỏ để dùng quanh năm.\n\n" +
      "Vải sấy có cùi màu nâu cánh gián, dẻo, ngọt đậm hơn vải tươi. Bóc vỏ ăn như món nhâm nhi cùng trà, hoặc nấu chè.",
    price: 120000,
    image: "/images/p-vai-thieu-say-luc-ngan.jpg",
    region: "bac",
    brand: "Vải thiều Lục Ngạn",
    origin: "Bắc Ninh",
    pack: "Túi 1kg",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "an-vat"],
    story: {
      enjoy: "Bóc vỏ, ăn cùi vải sấy như món nhâm nhi cùng trà nóng; có thể nấu chè hoặc hầm cùng long nhãn, táo đỏ.",
      storage: "Đồ khô, để nhiệt độ thường: giữ trong túi hoặc hũ kín, nơi khô ráo (có gói hút ẩm càng tốt). Dùng trong khoảng 6 tháng; cứ 2–3 tháng xem lại một lần, bỏ quả bị ẩm mốc.",
      season: "Vải thiều Lục Ngạn chín vào khoảng tháng 6–7; vải sấy làm sau vụ nên có quanh năm.",
    },
    createdAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "buoi-doan-hung",
    name: "Bưởi Đoan Hùng",
    shortDescription: "Bưởi Đoan Hùng quả tròn, múi vàng mọng, vị ngọt mát; hàng tươi theo mùa, giao nhanh.",
    description:
      "Đoan Hùng (Phú Thọ) là vùng bưởi nổi tiếng của miền Bắc, với giống bưởi Bằng Luân nổi tiếng nhất. Bưởi Đoan Hùng được cấp chỉ dẫn địa lý năm 2006.\n\n" +
      "Múi bưởi vàng nhạt, mọng nước, vị ngọt mát. Bưởi là món quà quen thuộc dịp cuối năm và mâm ngũ quả ngày Tết.",
    price: 120000,
    image: "/images/p-buoi-doan-hung.jpg",
    region: "bac",
    brand: "Bưởi Đoan Hùng",
    origin: "Phú Thọ",
    pack: "2 quả (khoảng 2kg)",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "bieu-nguoi-lon"],
    story: {
      enjoy: "Bóc vỏ, tách múi ăn tươi; vỏ bưởi có thể làm mứt hoặc nấu chè bưởi.",
      storage: "Hàng tươi theo mùa, giao nhanh. Để nơi khô thoáng, tránh nắng, không cần tủ lạnh; nên dùng trong khoảng 3 tuần kể từ khi nhận. Vỏ hơi héo là bình thường, múi bên trong vẫn ngọt.",
      season: "Bưởi vào mùa cuối năm, ngon nhất dịp cận Tết.",
    },
    createdAt: "2026-11-14T10:00:00.000Z",
  },
  {
    id: "thao-qua-lai-chau",
    name: "Thảo quả Lai Châu",
    shortDescription: "Quả thảo quả sấy khô từ rừng Lai Châu, mùi thơm nồng, là gia vị không thể thiếu của phở và các món hầm.",
    description:
      "Thảo quả được trồng dưới tán rừng ở các vùng núi cao Lai Châu như Mường Tè, Tam Đường, Tân Uyên. Người dân gọi thảo quả là \"vàng đỏ\" vì đây là cây giúp nhiều hộ thoát nghèo. Quả chín được hái rồi sấy khô.\n\n" +
      "Thảo quả khô có vỏ nâu, nhiều rãnh dọc, hạt bên trong thơm nồng và hơi cay. Đây là gia vị quen thuộc của nước dùng phở, bò kho, thắng cố và các món hầm.",
    price: 70000,
    image: "/images/p-thao-qua-lai-chau.jpg",
    region: "bac",
    brand: "Thảo quả Lai Châu",
    origin: "Lai Châu",
    pack: "Gói 200g",
    stock: INITIAL_STOCK,
    occasions: ["vao-bep"],
    story: {
      enjoy: "Nướng sơ cho dậy mùi, đập dập rồi cho vào nồi nước dùng phở, bò kho, thắng cố hay món hầm; 1–2 quả cho một nồi.",
      storage: "Gia vị khô, để nhiệt độ thường: đựng trong túi hoặc hũ kín, nơi khô mát, tránh ẩm. Dùng tốt trong khoảng 12 tháng; để nguyên quả giữ mùi lâu hơn đã đập dập.",
    },
    createdAt: "2026-11-14T09:16:00.000Z",
  },
  {
    id: "cam-vinh",
    name: "Cam Vinh",
    shortDescription: "Cam Vinh vỏ vàng xanh, múi mọng nước, vị ngọt thanh và thơm; hàng tươi theo mùa, giao nhanh.",
    description:
      "Cam Vinh là đặc sản của Nghệ An, được Cục Sở hữu trí tuệ cấp chỉ dẫn địa lý số 00012 năm 2007; vùng được dùng chỉ dẫn địa lý đã được mở rộng năm 2019.\n\n" +
      "Quả cam vỏ vàng xanh, múi mọng nước, vị ngọt thanh, thơm mùi tinh dầu vỏ cam. Cam vào chính vụ khoảng tháng 11–12, đúng dịp làm quà cuối năm.",
    price: 90000,
    image: "/images/p-cam-vinh.jpg",
    region: "trung",
    brand: "Cam Vinh",
    origin: "Nghệ An",
    pack: "Túi 2kg",
    stock: INITIAL_STOCK,
    occasions: ["qua-tet", "bieu-nguoi-lon"],
    story: {
      enjoy: "Ăn tươi hoặc vắt lấy nước; nước cam nên uống ngay sau khi vắt.",
      storage: "Hàng tươi theo mùa, giao nhanh. Để nơi khô thoáng, tránh nắng thì nên dùng trong khoảng 1 tuần; cất ngăn mát tủ lạnh giữ được đến khoảng 3 tuần.",
      season: "Chính vụ khoảng tháng 11–12.",
    },
    createdAt: "2026-11-14T09:44:00.000Z",
  },
];
