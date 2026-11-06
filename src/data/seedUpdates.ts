import { initialProducts } from "@/data/initialData";

// Các thay đổi với sản phẩm mẫu SAU khi chúng đã được lưu trong một số trình duyệt (xem applySeedUpdates trong src/lib/storage.ts).
// Mỗi dòng nói: "với sản phẩm có id này, nếu trường này VẪN LÀ giá trị mẫu cũ (`from`) thì đổi thành giá trị mới trong initialData".
// Nếu Admin đã tự sửa trường đó thì nó không còn khớp `from`, nên bị bỏ qua và thay đổi của Admin được giữ nguyên.
// Các dòng này không có hại khi chạy lại nhiều lần: sau khi đổi, trường không còn khớp `from` nữa.
export type SeedUpdate = {
  id: string;
  field: "brand" | "origin" | "shortDescription" | "description" | "price";
  from: string | number | RegExp;
};

const placeholderBrand = /^Thương hiệu [A-Z]$/; // "Thương hiệu A" … giá trị giữ chỗ cũ

export const seedUpdates: SeedUpdate[] = [
  // Thương hiệu giữ chỗ -> thương hiệu thật (mọi sản phẩm mẫu)
  ...initialProducts.map((product): SeedUpdate => ({ id: product.id, field: "brand", from: placeholderBrand })),

  // Xuất xứ cho khớp với thương hiệu mới
  { id: "banh-com", field: "origin", from: "Hàng Than, Hà Nội" },
  { id: "banh-pia", field: "origin", from: "Vũng Thơm, Sóc Trăng" },
  { id: "keo-dua", field: "origin", from: "Cồn Phụng, Bến Tre" },
  { id: "kho-ca-boi-ca-mau", field: "origin", from: "Cà Mau" },

  // Khô cá bổi: cá bổi (cá sặc rằn) là cá nước ngọt nuôi ở U Minh, không phải "cá biển nhỏ" như bản cũ viết
  { id: "kho-ca-boi-ca-mau", field: "shortDescription", from: /cá biển nhỏ/ },
  { id: "kho-ca-boi-ca-mau", field: "description", from: /cá biển nhỏ/ },

  // Kẹo dừa: ảnh mới là kẹo dừa ca cao, nên mô tả nói thêm về ca cao
  { id: "keo-dua", field: "shortDescription", from: /^Kẹo dẻo từ nước cốt dừa và đường, thơm béo/ },
  { id: "keo-dua", field: "description", from: /Kẹo được nấu từ nước cốt dừa và đường, sau đó/ },

  // Giá cua mẫu cũ bị gõ thừa hai số 0 (36.000.000₫/kg)
  { id: "cua-bien-nam-can", field: "price", from: 36000000 },
];

// Ảnh đã đổi tên hoặc đã xóa khỏi public/images -> ảnh thay thế.
// Áp dụng cho MỌI sản phẩm đang dùng ảnh cũ (kể cả sản phẩm Admin tự tạo), vì tệp cũ không còn nữa.
export const renamedImages: Record<string, string> = {
  "/images/placeholder-mat-ong-rung-u-minh-ha.jpg": "/images/p-mat-ong-u-minh-ha.jpg",
  "/images/placeholder-kho-ca-boi.jpg": "/images/p-kho-ca-boi.jpg",
  "/images/p-keo-dua.jpg": "/images/p-keo-dua-ben-tre.jpg",
};
