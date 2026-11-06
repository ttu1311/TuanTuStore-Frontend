// Tuyến "Bắc vào Nam" ở trang chủ: các sản phẩm xếp từ bắc xuống nam theo nơi sản xuất.
import type { Product, Region } from "@/types";
import { simplifyText } from "@/lib/text";

// Vĩ độ gần đúng (°B) của những nơi thường cho ra đặc sản.
// Chữ xuất xứ của sản phẩm ("Tân Cương, Thái Nguyên") được khớp với các tên này, không tính dấu.
// Tên cụ thể hơn đứng trước, nên "phu quoc" thắng "kien giang".
const knownPlaces: [name: string, latitude: number][] = [
  ["ha giang", 22.8],
  ["lao cai", 22.5],
  ["sa pa", 22.3],
  ["cao bang", 22.7],
  ["lang son", 21.9],
  ["son la", 21.3],
  ["thai nguyen", 21.6],
  ["bac ninh", 21.2],
  ["ha noi", 21.0],
  ["hai phong", 20.9],
  ["hai duong", 20.9],
  ["hung yen", 20.6],
  ["quang ninh", 21.0],
  ["nam dinh", 20.4],
  ["ninh binh", 20.3],
  ["thanh hoa", 19.8],
  ["nghe an", 18.7],
  ["ha tinh", 18.3],
  ["quang binh", 17.5],
  ["quang tri", 16.8],
  ["hue", 16.5],
  ["da nang", 16.0],
  ["hoi an", 15.9],
  ["quang nam", 15.6],
  ["quang ngai", 15.1],
  ["binh dinh", 13.8],
  ["gia lai", 13.9],
  ["kon tum", 14.4],
  ["phu yen", 13.1],
  ["dak lak", 12.7],
  ["buon ma thuot", 12.7],
  ["khanh hoa", 12.2],
  ["nha trang", 12.2],
  ["da lat", 11.9],
  ["lam dong", 11.9],
  ["ninh thuan", 11.6],
  ["binh thuan", 10.9],
  ["phan thiet", 10.9],
  ["tay ninh", 11.3],
  ["binh duong", 11.0],
  ["dong nai", 10.9],
  ["ho chi minh", 10.8],
  ["sai gon", 10.8],
  ["vung tau", 10.4],
  ["long an", 10.6],
  ["tien giang", 10.4],
  ["dong thap", 10.5],
  ["ben tre", 10.2],
  ["phu quoc", 10.2],
  ["vinh long", 10.2],
  ["an giang", 10.5],
  ["can tho", 10.0],
  ["kien giang", 10.0],
  ["tra vinh", 9.9],
  ["hau giang", 9.8],
  ["soc trang", 9.6],
  ["bac lieu", 9.3],
  ["u minh ha", 9.3],
  ["nam can", 8.8],
  ["rach goc", 8.7],
  ["ca mau", 9.2],
];

// Nơi ta không biết sẽ được đặt ở giữa vùng của nó
const regionLatitude: Record<Region, number> = { bac: 21, trung: 14.5, nam: 10 };

const regionOrder: Region[] = ["bac", "trung", "nam"];

export type RouteStop = {
  product: Product;
  place: string; // phần đầu của xuất xứ: "Tân Cương, Thái Nguyên" -> "Tân Cương"
  area: string; // phần còn lại: "Thái Nguyên" ("" khi xuất xứ chỉ có một phần)
  latitude?: number; // chỉ khi biết nơi đó, để không bao giờ hiển thị một giá trị đoán mò
};

function findLatitude(origin: string) {
  const text = simplifyText(origin);
  return knownPlaces.find(([name]) => text.includes(name))?.[1];
}

export function buildRoute(products: Product[]): RouteStop[] {
  return products
    .map((product) => {
      const [place, ...rest] = product.origin.split(",").map((part) => part.trim());
      return { product, place, area: rest.join(", "), latitude: findLatitude(product.origin) };
    })
    .sort(
      (a, b) =>
        // Các vùng giữ nguyên thứ tự dù vĩ độ có thể làm lẫn lộn (ví dụ Huế và Đà Nẵng đều thuộc Trung)
        regionOrder.indexOf(a.product.region) - regionOrder.indexOf(b.product.region) ||
        (b.latitude ?? regionLatitude[b.product.region]) - (a.latitude ?? regionLatitude[a.product.region]) ||
        a.product.name.localeCompare(b.product.name, "vi"),
    );
}

// 21.6 -> "21,6° B" (dấu phẩy thập phân kiểu Việt, B = Bắc)
export function formatLatitude(latitude: number) {
  return `${latitude.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}° B`;
}
