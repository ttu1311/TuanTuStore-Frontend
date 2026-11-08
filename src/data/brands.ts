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
];
