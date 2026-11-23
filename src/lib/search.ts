// Tìm kiếm sản phẩm, dùng chung cho danh sách /san-pham và ô tìm kiếm gợi ý ở header.
// Logic thuần (không React, không localStorage).
import { simplifyText } from "@/lib/text";
import type { Product } from "@/types";

// Chữ thường, và cùng một dạng Unicode cho mọi chữ cái tiếng Việt
function lowerText(text: string) {
  return text.toLowerCase().normalize("NFC");
}

// Tách thành từng từ (bỏ dấu câu)
function splitWords(text: string) {
  return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// Vị trí (chỉ số từ) mà các từ liền nhau của `words` khớp từ khóa, hoặc -1 nếu không khớp.
// Từ cuối của từ khóa được phép chưa gõ xong.
function findMatch(words: string[], termWords: string[]) {
  return words.findIndex((_, start) =>
    termWords.every((termWord, i) => {
      const word = words[start + i];
      if (word === undefined) return false;
      return i === termWords.length - 1 ? word.startsWith(termWord) : word === termWord;
    })
  );
}

// Từ khóa đã chuẩn hóa: các từ không dấu, và có phải khách gõ CÓ DẤU không (để biết có tìm trong mô tả không)
function parseTerm(search: string) {
  const term = lowerText(search.trim());
  return { term, plainTerm: splitWords(simplifyText(term)), typedWithAccents: simplifyText(term) !== term };
}

// Món khớp từ khóa ở mức nào (số càng nhỏ càng khớp tốt), hoặc null nếu không khớp.
// 0 = khớp ở ĐẦU tên, 1 = khớp trong tên, 2 = khớp xuất xứ / thương hiệu, 3 = khớp mô tả.
//
// Tìm theo TỪ NGUYÊN VẸN (không phải chuỗi con), từ khóa nhiều từ phải khớp các từ liền nhau.
// - Tên, xuất xứ, thương hiệu: bỏ qua dấu, nên "o mai" tìm ra "Ô mai", "ca mau" tìm ra "Cà Mau".
// - Mô tả ngắn: dấu phải khớp. Nếu bỏ dấu thì "cua" khớp nhầm "của" và "cửa" ("vùng cửa biển"),
//   nên gõ không dấu sẽ không tìm trong mô tả. Gõ có dấu ("trà", "cửa") thì có.
function matchRank(product: Product, search: string): number | null {
  const { term, plainTerm, typedWithAccents } = parseTerm(search);
  if (!term || plainTerm.length === 0) return 0; // không có từ khóa: món nào cũng khớp

  const inName = findMatch(splitWords(simplifyText(product.name)), plainTerm);
  if (inName === 0) return 0;
  if (inName > 0) return 1;

  const otherFields = [product.origin, product.brand];
  if (otherFields.some((text) => findMatch(splitWords(simplifyText(text)), plainTerm) >= 0)) return 2;

  if (typedWithAccents && findMatch(splitWords(lowerText(product.shortDescription)), splitWords(term)) >= 0) return 3;
  return null;
}

export function matchesSearch(product: Product, search: string) {
  return matchRank(product, search) !== null;
}

// Các món khớp từ khóa, xếp: khớp ở đầu tên > khớp trong tên > khớp xuất xứ / thương hiệu > khớp mô tả.
// Bằng nhau thì món bán được nhiều hơn (sold: id -> số lượng đã bán) lên trước, rồi theo tên.
// Không có từ khóa thì trả về danh sách rỗng (gợi ý cần có từ khóa).
export function searchProducts(products: Product[], search: string, limit?: number, sold?: Map<string, number>) {
  if (!parseTerm(search).term) return [];
  const hits: { product: Product; rank: number }[] = [];
  for (const product of products) {
    const rank = matchRank(product, search);
    if (rank !== null) hits.push({ product, rank });
  }
  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      (sold?.get(b.product.id) ?? 0) - (sold?.get(a.product.id) ?? 0) ||
      a.product.name.localeCompare(b.product.name, "vi")
  );
  const found = hits.map((hit) => hit.product);
  return limit === undefined ? found : found.slice(0, limit);
}

export type TextPart = { text: string; match: boolean };

// Tách `text` thành các đoạn để in đậm phần khớp từ khóa. Bỏ qua dấu như lúc tìm:
// gõ "che" thì "Chè Thái Nguyên" cho [{ "Chè", match }, { " Thái Nguyên" }]. Không khớp thì trả về một đoạn duy nhất.
export function splitMatch(text: string, search: string): TextPart[] {
  const { plainTerm } = parseTerm(search);
  const whole = [{ text, match: false }];
  if (plainTerm.length === 0) return whole;

  // Chữ không dấu, kèm chỉ số ký tự gốc của từng chữ (bỏ dấu chỉ bớt ký tự, không đổi thứ tự)
  const chars = [...text];
  let plain = "";
  const origin: number[] = [];
  chars.forEach((char, index) => {
    const simple = simplifyText(char);
    for (let i = 0; i < simple.length; i++) origin.push(index);
    plain += simple;
  });

  const words = [...plain.matchAll(/[\p{L}\p{N}]+/gu)].map((m) => ({ word: m[0], start: m.index }));
  const start = findMatch(words.map((w) => w.word), plainTerm);
  if (start < 0) return whole;

  const last = words[start + plainTerm.length - 1];
  const from = origin[words[start].start];
  const to = origin[last.start + plainTerm[plainTerm.length - 1].length - 1] + 1; // từ cuối: chỉ phần đã gõ
  const parts: TextPart[] = [
    { text: chars.slice(0, from).join(""), match: false },
    { text: chars.slice(from, to).join(""), match: true },
    { text: chars.slice(to).join(""), match: false },
  ];
  return parts.filter((part) => part.text !== "");
}

// ---------- Tìm kiếm gần đây ----------

export const RECENT_SEARCH_LIMIT = 5;

// Thêm một từ khóa vào đầu danh sách "Tìm gần đây": bỏ khoảng trắng thừa, không trùng (không phân biệt hoa thường và dấu),
// tối đa RECENT_SEARCH_LIMIT từ khóa. Từ khóa rỗng thì giữ nguyên danh sách.
export function addRecentSearch(list: string[], search: string) {
  const term = search.trim().replace(/\s+/g, " ").slice(0, 100);
  if (!term) return list;
  const key = simplifyText(term);
  return [term, ...list.filter((item) => simplifyText(item) !== key)].slice(0, RECENT_SEARCH_LIMIT);
}
