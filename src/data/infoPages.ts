import { DISCOUNT, FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import { orderStatuses, orderStatusLabels } from "@/lib/orders";

// Nội dung các trang hướng dẫn và chính sách (/thong-tin/<slug>), liên kết từ Footer.
// Các con số (phí vận chuyển, mức miễn phí, giảm giá) lấy từ src/lib/cart.ts, nên luôn khớp với giỏ hàng.
// TuanTuStore là đồ án học tập: đây là chính sách MẪU, mô tả cách cửa hàng vận hành, và mỗi trang đều nói rõ điều đó.

export type InfoSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[]; // danh sách gạch đầu dòng
  steps?: string[]; // danh sách đánh số
};

export type InfoPage = {
  slug: string;
  group: "Hỗ trợ khách hàng" | "Chính sách";
  title: string;
  description: string; // một câu, dùng cho thẻ meta và dưới tiêu đề
  sections?: InfoSection[];
  faq?: { question: string; answer: string }[];
};

const shipping = formatVND(SHIPPING_FEE);
const freeFrom = formatVND(FREE_SHIPPING_MIN);
const discount = formatVND(DISCOUNT);
const statusFlow = orderStatuses.map((status) => orderStatusLabels[status]).join(" → ");

export const infoPages: InfoPage[] = [
  {
    slug: "huong-dan-mua-hang",
    group: "Hỗ trợ khách hàng",
    title: "Hướng dẫn mua hàng",
    description: "Các bước chọn đặc sản, đặt hàng và theo dõi đơn tại TuanTuStore.",
    sections: [
      {
        heading: "Đặt hàng trong 5 bước",
        steps: [
          "Tìm đặc sản: gõ tên món vào ô tìm kiếm, chọn một miền trên menu, hoặc bấm vào bản đồ ba miền ở trang chủ. Ở trang Sản phẩm bạn có thể lọc theo vùng miền, tỉnh thành, thương hiệu và khoảng giá.",
          "Bấm “Thêm vào giỏ” ở sản phẩm bạn muốn mua. Số trên biểu tượng giỏ hàng cho biết giỏ đang có bao nhiêu món.",
          "Mở giỏ hàng để kiểm tra số lượng, xóa món không cần, và xem còn bao nhiêu nữa thì được miễn phí vận chuyển.",
          "Bấm “Tiến hành thanh toán”, điền họ tên, số điện thoại, email và địa chỉ giao hàng, rồi chọn phương thức thanh toán.",
          "Bấm “Đặt hàng”. Màn hình hiện mã đơn hàng (ví dụ TT-000001): hãy ghi lại mã này để tra cứu đơn.",
        ],
      },
      {
        heading: "Có cần tài khoản không?",
        paragraphs: [
          "Không bắt buộc. Bạn có thể đặt hàng mà không đăng nhập và theo dõi đơn ở trang Tra cứu đơn hàng bằng mã đơn và số điện thoại.",
          "Nếu đăng nhập, thông tin của bạn được điền sẵn khi thanh toán, và mọi đơn hàng được gom trong mục “Đơn hàng của tôi” ở trang Tài khoản.",
        ],
      },
      {
        heading: "Theo dõi đơn hàng",
        paragraphs: [`Mỗi đơn hàng đi qua các trạng thái: ${statusFlow}.`],
      },
    ],
  },
  {
    slug: "phuong-thuc-thanh-toan",
    group: "Hỗ trợ khách hàng",
    title: "Phương thức thanh toán",
    description: "Các cách thanh toán khi đặt hàng tại TuanTuStore.",
    sections: [
      {
        heading: "Thanh toán khi nhận hàng (COD)",
        paragraphs: ["Bạn trả tiền mặt cho nhân viên giao hàng khi nhận được đơn. Hãy kiểm tra gói hàng trước khi thanh toán."],
      },
      {
        heading: "Chuyển khoản ngân hàng",
        paragraphs: [
          "Sau khi đơn được xác nhận, cửa hàng gửi thông tin chuyển khoản cho bạn. Nội dung chuyển khoản ghi mã đơn hàng (ví dụ TT-000001) để đối chiếu nhanh.",
        ],
      },
      {
        heading: "Lưu ý về bản demo",
        paragraphs: [
          "Website này là đồ án học tập: không có cổng thanh toán thật và không thu tiền của bất kỳ ai. Vui lòng không chuyển khoản theo bất kỳ thông tin nào nhân danh TuanTuStore.",
        ],
      },
    ],
  },
  {
    slug: "cau-hoi-thuong-gap",
    group: "Hỗ trợ khách hàng",
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh về phí vận chuyển, đơn hàng, sản phẩm và tài khoản.",
    faq: [
      {
        question: "Phí vận chuyển là bao nhiêu?",
        answer: `Phí vận chuyển là ${shipping} cho mỗi đơn. Đơn có tạm tính từ ${freeFrom} trở lên được miễn phí vận chuyển.`,
      },
      {
        question: "Giảm giá trong giỏ hàng là gì?",
        answer: `Mỗi đơn hàng được giảm ${discount}, trừ thẳng vào tổng cộng. Một số sản phẩm còn có giá ưu đãi riêng, hiện bằng giá cũ gạch ngang và nhãn phần trăm giảm.`,
      },
      {
        question: "Tôi có cần tạo tài khoản để mua hàng không?",
        answer: "Không. Bạn có thể đặt hàng ngay, rồi tra cứu đơn bằng mã đơn và số điện thoại ở trang Tra cứu đơn hàng.",
      },
      {
        question: "Làm sao biết đơn hàng của tôi đang ở đâu?",
        answer: `Vào trang Tra cứu đơn hàng (liên kết “Theo dõi đơn hàng” ở cuối trang), nhập mã đơn và số điện thoại đã dùng khi đặt. Trạng thái đi theo thứ tự: ${statusFlow}.`,
      },
      {
        question: "Sản phẩm có rõ nguồn gốc không?",
        answer: "Mỗi sản phẩm ghi nơi làm ra (xuất xứ) và thương hiệu. Phần “Về thương hiệu” ở trang chi tiết giới thiệu thương hiệu đó là gì và còn làm những sản phẩm nào.",
      },
      {
        question: "TuanTuStore có phải đại lý chính thức của các thương hiệu không?",
        answer: "Không. TuanTuStore là đồ án học tập; tên thương hiệu được ghi theo thông tin công khai để bạn biết sản phẩm thuộc về ai. Giá và quy cách là giá trị mẫu.",
      },
      {
        question: "Tôi muốn đổi hoặc trả hàng thì làm thế nào?",
        answer: "Xem trang Đổi trả & hoàn tiền: sản phẩm lỗi, hư hỏng khi vận chuyển hoặc giao sai được đổi trả trong 7 ngày kể từ khi nhận hàng.",
      },
    ],
  },
  {
    slug: "chinh-sach-giao-hang",
    group: "Chính sách",
    title: "Chính sách giao hàng",
    description: "Phí vận chuyển, khu vực và thời gian giao hàng của TuanTuStore.",
    sections: [
      {
        heading: "Phí vận chuyển",
        list: [
          `Đơn có tạm tính dưới ${freeFrom}: phí vận chuyển ${shipping}.`,
          `Đơn có tạm tính từ ${freeFrom} trở lên: miễn phí vận chuyển.`,
          "Phí vận chuyển được tính tự động và hiện rõ trong giỏ hàng trước khi bạn đặt.",
        ],
      },
      {
        heading: "Khu vực và thời gian giao hàng",
        list: [
          "Giao hàng toàn quốc.",
          "Thời gian dự kiến: 1–3 ngày với nội thành Hà Nội, TP. Hồ Chí Minh và Đà Nẵng; 3–5 ngày với các tỉnh thành khác.",
          "Hàng tươi sống (ví dụ cua biển) chỉ giao ở những nơi có thể nhận trong ngày, để giữ chất lượng.",
        ],
      },
      {
        heading: "Đóng gói",
        paragraphs: [
          "Đặc sản được đóng gói kín, chống va đập; hàng dễ vỡ (chai nước mắm, mật ong) được chèn thêm lớp đệm. Hãy kiểm tra gói hàng ngay khi nhận.",
        ],
      },
    ],
  },
  {
    slug: "doi-tra-hoan-tien",
    group: "Chính sách",
    title: "Đổi trả & hoàn tiền",
    description: "Khi nào được đổi trả hàng và cách hoàn tiền.",
    sections: [
      {
        heading: "Trường hợp được đổi trả",
        list: [
          "Sản phẩm bị lỗi, hư hỏng hoặc biến chất khi nhận hàng.",
          "Giao sai sản phẩm, sai số lượng so với đơn hàng.",
          "Sản phẩm hết hạn sử dụng tại thời điểm nhận hàng.",
        ],
      },
      {
        heading: "Điều kiện",
        list: [
          "Yêu cầu trong vòng 7 ngày kể từ khi nhận hàng, kèm mã đơn hàng và ảnh chụp sản phẩm.",
          "Thực phẩm đã mở bao bì chỉ được đổi trả khi có lỗi từ phía cửa hàng.",
          "Không đổi trả vì lý do khẩu vị, vì đặc sản mỗi vùng có hương vị riêng.",
        ],
      },
      {
        heading: "Hoàn tiền",
        paragraphs: [
          "Tiền được hoàn theo phương thức bạn đã thanh toán (chuyển khoản lại, hoặc hoàn tiền mặt với đơn COD) sau khi cửa hàng xác nhận yêu cầu. Phí vận chuyển của hàng đổi trả do lỗi cửa hàng sẽ do cửa hàng chịu.",
        ],
      },
    ],
  },
  {
    slug: "bao-mat-thong-tin",
    group: "Chính sách",
    title: "Bảo mật thông tin",
    description: "TuanTuStore lưu những thông tin gì của bạn và lưu ở đâu.",
    sections: [
      {
        heading: "Thông tin được lưu",
        list: [
          "Khi đăng ký: họ tên, email, số điện thoại và mật khẩu.",
          "Khi đặt hàng: họ tên, số điện thoại, email, địa chỉ giao hàng, ghi chú và các sản phẩm đã mua.",
          "Giỏ hàng và các sản phẩm bạn vừa xem.",
        ],
      },
      {
        heading: "Thông tin được lưu ở đâu",
        paragraphs: [
          "Website này không có máy chủ: mọi thông tin chỉ được lưu trong bộ nhớ (localStorage) của chính trình duyệt bạn đang dùng, không gửi đi đâu cả. Trình duyệt khác, máy khác hoặc khi bạn xóa dữ liệu trang web thì sẽ không còn thấy các thông tin này.",
          "Vì là bản demo, mật khẩu được lưu ở dạng chữ thường trong trình duyệt. Đừng dùng mật khẩu thật mà bạn dùng ở nơi khác.",
        ],
      },
      {
        heading: "Mục đích sử dụng",
        paragraphs: ["Thông tin chỉ dùng để hiển thị tài khoản, giỏ hàng và đơn hàng của bạn trên chính website này."],
      },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    group: "Chính sách",
    title: "Điều khoản sử dụng",
    description: "Những điều cần biết khi sử dụng website TuanTuStore.",
    sections: [
      {
        heading: "Về website",
        paragraphs: [
          "TuanTuStore là đồ án học tập mô phỏng một cửa hàng đặc sản ba miền. Website không bán hàng thật, không thu tiền và không giao hàng.",
        ],
      },
      {
        heading: "Sản phẩm, giá và thương hiệu",
        list: [
          "Giá và quy cách sản phẩm là giá trị mẫu, không phải giá thị trường.",
          "Tên thương hiệu được ghi theo thông tin công khai để giới thiệu nguồn gốc; TuanTuStore không phải đại lý hay nhà phân phối của các thương hiệu này.",
          "Ảnh sản phẩm lấy từ Wikimedia Commons; tác giả và giấy phép xem ở trang Nguồn ảnh.",
        ],
      },
      {
        heading: "Tài khoản",
        paragraphs: ["Bạn chịu trách nhiệm với thông tin mình nhập. Không dùng thông tin cá nhân thật hoặc mật khẩu thật trên bản demo này."],
      },
    ],
  },
];

export function findInfoPage(slug: string) {
  return infoPages.find((page) => page.slug === slug);
}
