// Các "dịp tặng" để khách chọn quà theo mục đích (lọc ở /san-pham?dip=..., và câu hỏi "dịp nào" của Hộp quà Ba Miền).
// Mỗi sản phẩm có thể thuộc nhiều dịp (Product.occasions). Đây là gợi ý của cửa hàng, Admin sửa được trong form sản phẩm.
export type Occasion = { id: string; label: string; description: string };

export const occasions: Occasion[] = [
  { id: "qua-tet", label: "Quà Tết", description: "Bày mâm, biếu tặng dịp năm mới" },
  { id: "bieu-nguoi-lon", label: "Biếu ông bà, bố mẹ", description: "Món quà chu đáo cho người lớn tuổi" },
  { id: "an-vat", label: "Ăn vặt, nhâm nhi", description: "Bánh, kẹo, ô mai dùng cùng trà" },
  { id: "vao-bep", label: "Cho gian bếp", description: "Nước mắm, đồ khô, hải sản để nấu" },
];

export function findOccasion(id: string) {
  return occasions.find((occasion) => occasion.id === id);
}
