// The homepage route "Bắc vào Nam": the products ordered from north to south by where they are made.
import type { Product, Region } from "@/types";
import { simplifyText } from "@/lib/text";

// Approximate latitude (°N) of the places where specialties usually come from.
// The origin text of a product ("Tân Cương, Thái Nguyên") is matched against these names, without accents.
// The more precise names come first, so "phu quoc" wins over "kien giang".
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
  ["ca mau", 9.2],
];

// A place we do not know is put in the middle of its region
const regionLatitude: Record<Region, number> = { bac: 21, trung: 14.5, nam: 10 };

const regionOrder: Region[] = ["bac", "trung", "nam"];

export type RouteStop = {
  product: Product;
  place: string; // the first part of the origin: "Tân Cương, Thái Nguyên" -> "Tân Cương"
  area: string; // the rest: "Thái Nguyên" ("" when the origin has one part)
  latitude?: number; // only when the place is known, so a guessed value is never shown
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
        // Regions keep their order even if a latitude would mix them (e.g. Huế and Đà Nẵng are both Trung)
        regionOrder.indexOf(a.product.region) - regionOrder.indexOf(b.product.region) ||
        (b.latitude ?? regionLatitude[b.product.region]) - (a.latitude ?? regionLatitude[a.product.region]) ||
        a.product.name.localeCompare(b.product.name, "vi"),
    );
}

// 21.6 -> "21,6° B" (Vietnamese decimal comma, B = Bắc / north)
export function formatLatitude(latitude: number) {
  return `${latitude.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}° B`;
}
