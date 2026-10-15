// Lower-case and remove Vietnamese accents: "Chè Thái Nguyên" -> "che thai nguyen".
// Used by the search, so "o mai" also finds "Ô mai" and "nuoc mam" finds "Nước mắm".
export function simplifyText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove accent marks
    .replace(/đ/g, "d");
}

// "Bánh tráng trộn" -> "banh-trang-tron" (used to build the id of a new product)
export function slugify(text: string) {
  return simplifyText(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
