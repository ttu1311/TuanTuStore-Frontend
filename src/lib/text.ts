// Chuyển chữ thường và bỏ dấu tiếng Việt: "Chè Thái Nguyên" -> "che thai nguyen".
// Dùng cho tìm kiếm, nên "o mai" cũng tìm ra "Ô mai" và "nuoc mam" tìm ra "Nước mắm".
export function simplifyText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ các dấu thanh
    .replace(/đ/g, "d");
}

// "Bánh tráng trộn" -> "banh-trang-tron" (dùng để tạo id cho sản phẩm mới)
export function slugify(text: string) {
  return simplifyText(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
