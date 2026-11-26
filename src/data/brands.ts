import type { Brand } from "@/types";

// Danh mục thương hiệu: mỗi thương hiệu thuộc những sản phẩm nào thì lấy từ danh sách sản phẩm (Product.brand),
// còn file này chỉ cho biết thương hiệu đó là gì.
//
// Đây là các thương hiệu / nhãn hiệu THẬT, ghi theo thông tin công khai trên báo chí và các trang của cơ quan nhà nước
// (nguồn ghi trong README.md, mục Credits). Đặc sản 3 Miền là đồ án học tập, không phải đại lý hay nhà phân phối chính thức
// của các thương hiệu này; giá và quy cách của sản phẩm chỉ là giá trị mẫu.
// Với các đặc sản Cà Mau, "thương hiệu" là nhãn hiệu tập thể của địa phương (không phải một công ty cụ thể).
export const brands: Brand[] = [
  {
    name: "Hồng Lam",
    kind: "Thương hiệu",
    place: "Hà Nội",
    about: "Thương hiệu ô mai nổi tiếng của Hà Nội, gắn với phố Hàng Đường. Ngoài ô mai, Hồng Lam còn làm bánh cốm và mứt sen.",
  },
  {
    name: "Chè Tân Cương",
    kind: "Chỉ dẫn địa lý",
    place: "Tân Cương, Thái Nguyên",
    about:
      "Tân Cương là vùng chè nổi tiếng của Thái Nguyên. Chỉ dẫn địa lý “Tân Cương” chỉ dành cho các tổ chức, cá nhân đủ điều kiện sản xuất, kinh doanh chè của vùng này.",
  },
  {
    name: "Bà Liễu Mẹ",
    kind: "Thương hiệu",
    place: "Cẩm Lệ, Đà Nẵng",
    about: "Cơ sở làm bánh khô mè theo nghề gia truyền ở Cẩm Lệ, Đà Nẵng; bánh khô mè của cơ sở được công nhận là sản phẩm OCOP của Đà Nẵng.",
  },
  {
    name: "Trung Nguyên",
    kind: "Thương hiệu",
    place: "Buôn Ma Thuột, Đắk Lắk",
    about: "Thương hiệu cà phê Việt Nam, ra đời năm 1996 tại Buôn Ma Thuột, thủ phủ cà phê của Tây Nguyên.",
  },
  {
    name: "Tân Huê Viên",
    kind: "Thương hiệu",
    place: "Sóc Trăng (nay thuộc TP. Cần Thơ)",
    about: "Thương hiệu bánh pía lâu đời của Sóc Trăng. Ngoài bánh pía, Tân Huê Viên còn làm bánh in, lạp xưởng và bánh Trung thu.",
  },
  {
    name: "Khải Hoàn",
    kind: "Thương hiệu",
    place: "Đặc khu Phú Quốc, An Giang",
    about: "Nhà thùng nước mắm ở Phú Quốc, làm nước mắm từ cá cơm đánh bắt trên biển, ủ chượp trong những thùng gỗ lớn.",
  },
  {
    name: "Cô Hai Tỏ",
    kind: "Thương hiệu",
    place: "Bến Tre (nay thuộc Vĩnh Long)",
    about: "Thương hiệu kẹo dừa của Bến Tre, bắt đầu sản xuất từ năm 1978 theo thông tin trên báo chí.",
  },
  {
    name: "Cua Năm Căn",
    kind: "Nhãn hiệu tập thể",
    place: "Năm Căn, Cà Mau",
    about:
      "Nhãn hiệu tập thể “Cua Năm Căn – Cà Mau” được Cục Sở hữu trí tuệ cấp năm 2015, do Hội Thủy sản huyện Năm Căn quản lý.",
  },
  {
    name: "Tôm khô Rạch Gốc",
    kind: "Nhãn hiệu tập thể",
    place: "Rạch Gốc, Cà Mau",
    about: "Nhãn hiệu tập thể của Cà Mau dành cho tôm khô làm ở vùng Rạch Gốc.",
  },
  {
    name: "Ba khía Rạch Gốc",
    kind: "Nghề truyền thống",
    place: "Rạch Gốc, Cà Mau",
    about:
      "Nghề muối ba khía ở thị trấn Rạch Gốc (huyện Ngọc Hiển) được đưa vào danh mục di sản văn hóa phi vật thể quốc gia năm 2019.",
  },
  {
    name: "Mật ong U Minh Hạ",
    kind: "Nhãn hiệu tập thể",
    place: "U Minh Hạ, Cà Mau",
    about:
      "Nhãn hiệu tập thể của mật ong vùng rừng tràm U Minh Hạ. Nghề gác kèo ong ở đây cũng được công nhận là di sản văn hóa phi vật thể quốc gia.",
  },
  {
    name: "Khô cá bổi U Minh",
    kind: "Nhãn hiệu tập thể",
    place: "Trần Văn Thời, Cà Mau",
    about:
      "Nhãn hiệu tập thể “Khô cá bổi U Minh”, chủ sở hữu là Hội Nông dân huyện Trần Văn Thời. Sản phẩm phải đạt tiêu chuẩn của nhãn hiệu này.",
  },
  // ----- Thêm tháng 11/2026: chỉ dẫn địa lý (đã kiểm chứng) và làng nghề / vùng đặc sản có thật -----
  {
    name: "Bưởi Đoan Hùng",
    kind: "Chỉ dẫn địa lý",
    place: "Đoan Hùng, Phú Thọ",
    about: "Bưởi Đoan Hùng được Cục Sở hữu trí tuệ cấp văn bằng chỉ dẫn địa lý năm 2006; giống nổi tiếng nhất là bưởi Bằng Luân.",
  },
  {
    name: "Chả mực Hạ Long",
    kind: "Chỉ dẫn địa lý",
    place: "Hạ Long, Quảng Ninh",
    about: "Chả mực Hạ Long được bảo hộ chỉ dẫn địa lý. Chả làm từ mực tươi của vùng biển Quảng Ninh, giã tay theo cách truyền thống.",
  },
  {
    name: "Miến dong Bình Liêu",
    kind: "Nghề truyền thống",
    place: "Bình Liêu, Quảng Ninh",
    about: "Bình Liêu là vùng núi của Quảng Ninh, nơi đồng bào Tày, Dao trồng củ dong riềng và làm miến theo cách truyền thống.",
  },
  {
    name: "Bánh đậu xanh Hải Dương",
    kind: "Nghề truyền thống",
    place: "Hải Dương (nay thuộc TP. Hải Phòng)",
    about: "Hải Dương có nghề làm bánh đậu xanh lâu đời; bánh làm từ đậu xanh, đường và mỡ, ép thành những bánh nhỏ vuông vắn.",
  },
  {
    name: "Bánh gai Ninh Giang",
    kind: "Nghề truyền thống",
    place: "Ninh Giang, Hải Dương cũ (nay thuộc Hải Phòng)",
    about: "Ninh Giang (Hải Dương cũ) nổi tiếng với bánh gai: vỏ nếp màu đen làm từ lá gai, nhân dừa, đậu và mỡ heo.",
  },
  {
    name: "Nhãn lồng Hưng Yên",
    kind: "Chỉ dẫn địa lý",
    place: "Hưng Yên",
    about: "Chỉ dẫn địa lý “Hưng Yên” bảo hộ cho quả nhãn lồng của tỉnh; long nhãn ở đây được sấy từ nhãn lồng của vùng.",
  },
  {
    name: "Bánh cáy làng Nguyễn",
    kind: "Nghề truyền thống",
    place: "Làng Nguyễn, Thái Bình cũ (nay thuộc Hưng Yên)",
    about: "Làng Nguyễn ở Thái Bình nổi tiếng với nghề làm bánh cáy, món bánh truyền thống dùng trong lễ cưới hỏi và ngày Tết.",
  },
  {
    name: "Tương Bần",
    kind: "Nghề truyền thống",
    place: "Bần Yên Nhân, Hưng Yên",
    about: "Làng Bần Yên Nhân ở Hưng Yên có nghề làm tương từ gạo nếp, đậu tương và muối, nổi tiếng khắp miền Bắc.",
  },
  {
    name: "Cơm cháy Ninh Bình",
    kind: "Nghề truyền thống",
    place: "Ninh Bình",
    about: "Cơm cháy là đặc sản của Ninh Bình, thường ăn cùng thịt dê núi; ngày nay cơm cháy còn được làm khô đóng gói để làm quà.",
  },
  {
    name: "Chè Shan tuyết Mộc Châu",
    kind: "Chỉ dẫn địa lý",
    place: "Mộc Châu, Sơn La",
    about: "Chỉ dẫn địa lý “Mộc Châu” bảo hộ cho chè Shan tuyết của vùng cao nguyên Mộc Châu.",
  },
  {
    name: "Thịt trâu gác bếp Sơn La",
    kind: "Nghề truyền thống",
    place: "Sơn La",
    about: "Người Thái ở Tây Bắc có cách giữ thịt bằng cách tẩm gia vị rồi treo trên gác bếp; thịt trâu gác bếp nay là đặc sản nổi tiếng của Sơn La.",
  },
  {
    name: "Gạo Điện Biên",
    kind: "Chỉ dẫn địa lý",
    place: "Lòng chảo Điện Biên",
    about: "Chỉ dẫn địa lý “Điện Biên” bảo hộ cho gạo của vùng lòng chảo Điện Biên, nơi có cánh đồng Mường Thanh rộng lớn.",
  },
  {
    name: "Mật ong bạc hà Mèo Vạc",
    kind: "Chỉ dẫn địa lý",
    place: "Mèo Vạc, Hà Giang cũ (nay thuộc Tuyên Quang)",
    about: "Chỉ dẫn địa lý “Mèo Vạc” bảo hộ cho mật ong bạc hà, do ong lấy mật từ hoa bạc hà dại trên cao nguyên đá Hà Giang.",
  },
  {
    name: "Hạt dẻ Trùng Khánh",
    kind: "Chỉ dẫn địa lý",
    place: "Trùng Khánh, Cao Bằng",
    about: "Chỉ dẫn địa lý “Trùng Khánh” bảo hộ cho hạt dẻ của vùng núi Trùng Khánh, Cao Bằng.",
  },
  {
    name: "Hoa hồi Lạng Sơn",
    kind: "Chỉ dẫn địa lý",
    place: "Lạng Sơn",
    about: "Chỉ dẫn địa lý “Lạng Sơn” bảo hộ cho hoa hồi của tỉnh, vùng trồng hồi lớn của Việt Nam.",
  },
  {
    name: "Quế Văn Yên",
    kind: "Chỉ dẫn địa lý",
    place: "Văn Yên, Yên Bái cũ (nay thuộc Lào Cai)",
    about: "Chỉ dẫn địa lý “Văn Yên” bảo hộ cho quế vỏ của vùng Văn Yên, nơi trồng quế lâu đời ở miền Bắc.",
  },
  {
    name: "Thảo quả Lai Châu",
    kind: "Đặc sản địa phương",
    place: "Mường Tè, Tam Đường, Tân Uyên (Lai Châu)",
    about: "Thảo quả được trồng dưới tán rừng ở vùng núi cao Lai Châu; người dân gọi là \"vàng đỏ\" vì giúp nhiều hộ thoát nghèo.",
  },
  {
    name: "Vải thiều Lục Ngạn",
    kind: "Đặc sản địa phương",
    place: "Lục Ngạn, Bắc Giang cũ (nay thuộc Bắc Ninh)",
    about: "Lục Ngạn là vùng trồng vải thiều lớn nhất cả nước. Chỉ dẫn địa lý vải thiều Lục Ngạn được cấp năm 2008 và được Nhật Bản bảo hộ năm 2021 (cho quả tươi); vải sấy là sản phẩm chế biến của vùng.",
  },
  {
    name: "Nem chua Thanh Hóa",
    kind: "Nghề truyền thống",
    place: "Thanh Hóa",
    about: "Nem chua là đặc sản nổi tiếng của Thanh Hóa, làm từ thịt lợn nạc, bì lợn và lá đinh lăng, gói trong lá chuối.",
  },
  {
    name: "Kẹo cu đơ Hà Tĩnh",
    kind: "Nghề truyền thống",
    place: "Hà Tĩnh",
    about: "Kẹo cu đơ là món quà quen thuộc của Hà Tĩnh, làm từ mật mía, lạc rang và gừng kẹp giữa hai lớp bánh tráng.",
  },
  {
    name: "Khoai deo Quảng Bình",
    kind: "Nghề truyền thống",
    place: "Quảng Bình cũ (nay thuộc Quảng Trị)",
    about: "Khoai deo là đặc sản của vùng cát ven biển Quảng Bình, Quảng Trị, làm từ khoai lang hấp chín rồi phơi cho đến khi dẻo.",
  },
  {
    name: "Chè vằng Quảng Trị",
    kind: "Đặc sản địa phương",
    place: "Quảng Trị",
    about: "Chè vằng là cây dây leo mọc ở vùng đồi Quảng Trị; lá và thân được phơi khô để nấu nước uống.",
  },
  {
    name: "Mè xửng Huế",
    kind: "Nghề truyền thống",
    place: "Huế",
    about: "Mè xửng là món kẹo truyền thống của Huế, làm từ mạch nha, đường, đậu phộng và mè.",
  },
  {
    name: "Cam Vinh",
    kind: "Chỉ dẫn địa lý",
    place: "Nghệ An",
    about: "Cam Vinh được Cục Sở hữu trí tuệ cấp giấy chứng nhận chỉ dẫn địa lý số 00012 năm 2007 (Quyết định 386/QĐ-SHTT); khu vực địa lý được mở rộng năm 2019.",
  },
  {
    name: "Bánh tráng Đại Lộc",
    kind: "Nghề truyền thống",
    place: "Đại Lộc, Quảng Nam cũ (nay thuộc TP. Đà Nẵng)",
    about: "Đại Lộc có nhiều làng làm bánh tráng truyền thống; bánh được tráng từ bột gạo rồi phơi trên giàn tre.",
  },
  {
    name: "Tỏi Lý Sơn",
    kind: "Chỉ dẫn địa lý",
    place: "Đảo Lý Sơn, Quảng Ngãi",
    about: "Tỏi Lý Sơn được Cục Sở hữu trí tuệ cấp giấy chứng nhận đăng ký chỉ dẫn địa lý số 00081 năm 2020; trước đó đã có nhãn hiệu tập thể từ năm 2009.",
  },
  {
    name: "Mạch nha Thi Phổ",
    kind: "Nghề truyền thống",
    place: "Thi Phổ, Mộ Đức, Quảng Ngãi",
    about: "Làng Thi Phổ ở Mộ Đức (Quảng Ngãi) nổi tiếng với nghề nấu mạch nha từ gạo nếp và mầm lúa.",
  },
  {
    name: "Hồ tiêu Chư Sê",
    kind: "Chỉ dẫn địa lý",
    place: "Chư Sê, Gia Lai",
    about: "Chỉ dẫn địa lý “Chư Sê” bảo hộ cho hạt tiêu của vùng Chư Sê, Gia Lai, vùng trồng tiêu nổi tiếng của Tây Nguyên.",
  },
  {
    name: "Bò một nắng Krông Pa",
    kind: "Nghề truyền thống",
    place: "Krông Pa, Gia Lai",
    about: "Bò một nắng là đặc sản của vùng Krông Pa, Gia Lai: thịt bò tẩm gia vị rồi phơi đúng một nắng.",
  },
  {
    name: "Nho Ninh Thuận",
    kind: "Chỉ dẫn địa lý",
    place: "Ninh Thuận cũ (nay thuộc Khánh Hòa)",
    about: "Chỉ dẫn địa lý “Ninh Thuận” bảo hộ cho nho của vùng đất nắng gió Ninh Thuận.",
  },
  {
    name: "Mực một nắng Nha Trang",
    kind: "Nghề truyền thống",
    place: "Nha Trang, Khánh Hòa",
    about: "Mực một nắng là mực tươi phơi đúng một nắng, đặc sản quen thuộc của các làng chài ven biển Khánh Hòa.",
  },
  {
    name: "Atiso Đà Lạt",
    kind: "Đặc sản địa phương",
    place: "Đà Lạt, Lâm Đồng",
    about: "Atiso được trồng ở Đà Lạt từ đầu thế kỷ 20; hoa, lá và thân được sấy khô để làm trà.",
  },
  {
    name: "Nước mắm Phan Thiết",
    kind: "Chỉ dẫn địa lý",
    place: "Phan Thiết, Bình Thuận cũ (nay thuộc Lâm Đồng)",
    about: "Chỉ dẫn địa lý “Phan Thiết” bảo hộ cho nước mắm của vùng biển Phan Thiết, nơi có nghề làm nước mắm lâu đời.",
  },
  {
    name: "Cà phê Khe Sanh",
    kind: "Đặc sản địa phương",
    place: "Khe Sanh, Hướng Hóa, Quảng Trị",
    about: "Vùng đồi Khe Sanh (Hướng Hóa, Quảng Trị) trồng cà phê từ thời Pháp thuộc, nổi tiếng với cà phê chè (arabica).",
  },
  {
    name: "Yến đảo Khánh Hòa",
    kind: "Nghề truyền thống",
    place: "Các đảo ven biển Khánh Hòa",
    about: "Khánh Hòa có nghề khai thác tổ chim yến trong các hang đảo đá ven biển từ lâu đời.",
  },
  {
    name: "Đường phèn Quảng Ngãi",
    kind: "Nghề truyền thống",
    place: "Quảng Ngãi",
    about: "Quảng Ngãi là vùng mía đường lâu đời của miền Trung, nổi tiếng với đường phèn, đường phổi và mạch nha.",
  },
  {
    name: "Muối tôm Tây Ninh",
    kind: "Nghề truyền thống",
    place: "Tây Ninh",
    about: "Muối tôm là đặc sản nổi tiếng của Tây Ninh, làm từ muối, tôm khô, ớt và tỏi rang xay.",
  },
  {
    name: "Bánh tráng phơi sương Trảng Bàng",
    kind: "Nghề truyền thống",
    place: "Trảng Bàng, Tây Ninh",
    about: "Trảng Bàng nổi tiếng với bánh tráng phơi sương: bánh tráng được nướng rồi phơi qua sương đêm cho mềm dẻo.",
  },
  {
    name: "Hạt điều Bình Phước",
    kind: "Chỉ dẫn địa lý",
    place: "Bình Phước cũ (nay thuộc Đồng Nai)",
    about: "Chỉ dẫn địa lý “Bình Phước” bảo hộ cho hạt điều của tỉnh, vùng trồng điều lớn của Việt Nam.",
  },
  {
    name: "Khô cá dứa Cần Giờ",
    kind: "Nghề truyền thống",
    place: "Cần Giờ, TP. Hồ Chí Minh",
    about: "Cần Giờ là vùng rừng ngập mặn ven biển của TP. Hồ Chí Minh, nổi tiếng với khô cá dứa phơi một nắng.",
  },
  {
    name: "Nem Lai Vung",
    kind: "Nghề truyền thống",
    place: "Lai Vung, Đồng Tháp",
    about: "Lai Vung (Đồng Tháp) nổi tiếng với nghề làm nem chua từ thịt heo, bì heo, tỏi và ớt.",
  },
  {
    name: "Sen Đồng Tháp",
    kind: "Đặc sản địa phương",
    place: "Đồng Tháp",
    about: "Đồng Tháp được biết đến là vùng đất sen, với những cánh đồng sen rộng lớn ở vùng Đồng Tháp Mười.",
  },
  {
    name: "Hủ tiếu Mỹ Tho",
    kind: "Nghề truyền thống",
    place: "Mỹ Tho, Tiền Giang cũ (nay thuộc Đồng Tháp)",
    about: "Mỹ Tho nổi tiếng với hủ tiếu làm từ bột gạo, sợi nhỏ, dai và trong.",
  },
  {
    name: "Lạp xưởng Sóc Trăng",
    kind: "Nghề truyền thống",
    place: "Sóc Trăng cũ (nay thuộc TP. Cần Thơ)",
    about: "Lạp xưởng là món quen thuộc của Sóc Trăng, làm từ thịt heo nạc và mỡ, nhồi vào ruột rồi phơi khô.",
  },
  {
    name: "Mắm Châu Đốc",
    kind: "Nghề truyền thống",
    place: "Châu Đốc, An Giang",
    about: "Châu Đốc được gọi là thủ phủ mắm của miền Tây, với nhiều loại mắm làm từ cá đồng như cá lóc, cá linh, cá sặc.",
  },
  {
    name: "Đường thốt nốt An Giang",
    kind: "Nghề truyền thống",
    place: "Vùng Bảy Núi (Tri Tôn, Tịnh Biên), An Giang",
    about: "Cây thốt nốt mọc nhiều ở vùng Bảy Núi, An Giang; người dân lấy nước từ buồng hoa thốt nốt rồi nấu thành đường.",
  },
  {
    name: "Xoài cát Hòa Lộc",
    kind: "Chỉ dẫn địa lý",
    place: "Hòa Lộc, Cái Bè, Tiền Giang cũ (nay thuộc Đồng Tháp)",
    about: "Chỉ dẫn địa lý “Hòa Lộc” bảo hộ cho xoài cát của vùng Hòa Lộc, Cái Bè.",
  },
  {
    name: "Dừa sáp Cầu Kè",
    kind: "Đặc sản địa phương",
    place: "Cầu Kè, Trà Vinh cũ (nay thuộc Vĩnh Long)",
    about: "Cầu Kè (Trà Vinh cũ) là vùng trồng dừa sáp nổi tiếng nhất miền Tây; cơm dừa sáp đặc và dẻo như sáp.",
  },
];
