// Dữ liệu cho bản đồ mini ba miền ở trang chủ: đường viền Việt Nam đơn giản hóa, ranh giới ba miền và vị trí các tỉnh.
// Đây là hình minh họa, không phải bản đồ hành chính chính xác. Tọa độ là (kinh độ °Đ, vĩ độ °B).
import { provinceLocation } from "@/data/provinces";
import type { Region } from "@/types";

// Khung vẽ rộng tới kinh độ 115°Đ và cao tới vĩ độ 7°B, để có chỗ cho hai quần đảo ở Biển Đông
export const MAP_WIDTH = 250;
export const MAP_HEIGHT = 322;

const SCALE = 20; // 1 độ vĩ = 20 đơn vị vẽ; kinh độ nhân 0,96 vì ở gần 16°B một độ kinh ngắn hơn một độ vĩ
const MIN_LONGITUDE = 102;
const TOP_LATITUDE = 23.6;

export function toMapX(longitude: number) {
  return Math.round((longitude - MIN_LONGITUDE) * SCALE * 0.96 * 10) / 10;
}
export function toMapY(latitude: number) {
  return Math.round((TOP_LATITUDE - latitude) * SCALE * 10) / 10;
}

// Đường viền: đi từ Tây Bắc, qua biên giới phía bắc, xuống dọc bờ biển Đông tới mũi Cà Mau,
// rồi lên theo bờ biển phía tây và biên giới Lào, Campuchia về lại điểm đầu.
const outlinePoints: [longitude: number, latitude: number][] = [
  [102.2, 22.4], [102.8, 22.6], [103.9, 22.5], [104.4, 23.3], [105.3, 23.35], [106.7, 22.8], [107.5, 22.0], [108.0, 21.5],
  [107.0, 20.9], [106.5, 20.2], [106.1, 19.9], [105.8, 19.3], [105.7, 18.8], [106.5, 18.1], [106.9, 17.2], [107.9, 16.4],
  [108.2, 16.1], [108.9, 15.2], [109.3, 13.8], [109.4, 12.9], [109.3, 12.2], [109.2, 11.5], [108.2, 10.9], [107.1, 10.4],
  [106.8, 10.4], [106.6, 10.2], [106.6, 9.9], [106.5, 9.5], [106.0, 9.3], [105.7, 9.0], [104.8, 8.6], [104.8, 9.0],
  [104.9, 9.7], [104.5, 10.4], [105.1, 10.9], [105.8, 11.0], [106.1, 11.6], [106.4, 11.9], [107.0, 12.2], [107.4, 12.4],
  [107.5, 13.5], [107.4, 14.5], [107.0, 15.2], [106.6, 15.9], [106.7, 16.5], [106.1, 17.4], [105.2, 18.4], [104.4, 19.2],
  [104.0, 20.0], [104.4, 20.5], [104.0, 21.1], [103.2, 21.6],
];

export const outlinePath =
  outlinePoints.map(([longitude, latitude], i) => `${i === 0 ? "M" : "L"}${toMapX(longitude)} ${toMapY(latitude)}`).join(" ") + " Z";

// Hai quần đảo của Việt Nam ở Biển Đông, vẽ bằng các chấm đảo nhỏ ở vị trí gần đúng (hình minh họa).
// Hoàng Sa thuộc thành phố Đà Nẵng, Trường Sa thuộc tỉnh Khánh Hòa, nên cả hai thuộc Miền Trung.
export const islandGroups: {
  name: string;
  label: string;
  region: Region;
  islands: [longitude: number, latitude: number][];
  labelAt: [longitude: number, latitude: number];
}[] = [
  {
    name: "Quần đảo Hoàng Sa",
    label: "Hoàng Sa",
    region: "trung",
    islands: [[111.2, 16.5], [111.5, 16.75], [111.85, 16.55], [112.3, 16.85], [111.6, 16.15], [112.0, 16.3], [111.75, 15.85], [112.35, 16.1]],
    labelAt: [111.1, 17.7],
  },
  {
    name: "Quần đảo Trường Sa",
    label: "Trường Sa",
    region: "trung",
    islands: [
      [114.3, 11.4], [114.3, 11.05], [114.4, 10.7], [113.9, 10.2], [114.3, 9.9], [114.6, 9.5], [113.4, 9.2], [114.0, 8.9],
      [112.5, 9.0], [112.0, 8.65], [113.0, 8.5], [111.9, 9.6], [112.9, 9.8],
    ],
    labelAt: [111.6, 7.7],
  },
];

// Ranh giới ba miền theo vĩ độ (xấp xỉ): từ Thanh Hóa trở ra là Bắc, từ Bình Thuận trở vào là Nam
const northSouthBoundary = toMapY(19.5);
const centralSouthBoundary = toMapY(11.0);

export const regionBands: Record<Region, { top: number; height: number }> = {
  bac: { top: 0, height: northSouthBoundary },
  trung: { top: northSouthBoundary, height: centralSouthBoundary - northSouthBoundary },
  nam: { top: centralSouthBoundary, height: MAP_HEIGHT - centralSouthBoundary },
};
export const regionBoundaries = [northSouthBoundary, centralSouthBoundary];

// Vị trí chấm trên bản đồ của một tỉnh (tên mới hoặc cũ), hoặc null nếu chưa biết.
// Tọa độ lấy từ src/data/provinces.ts: cùng vĩ độ với cột vĩ độ của tuyến "Bắc vào Nam".
export function provinceDot(province: string) {
  const location = provinceLocation(province);
  return location ? { x: toMapX(location[0]), y: toMapY(location[1]) } : null;
}
