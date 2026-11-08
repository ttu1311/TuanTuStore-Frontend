// "Hộ chiếu đặc sản": mỗi tỉnh khách đã nhận hàng được "đóng dấu".
// Tính hoàn toàn từ dữ liệu thật: đơn hàng của khách và xuất xứ của sản phẩm.
import { groupProducts, productProvince } from "@/lib/products";
import type { Order, Product, Region } from "@/types";

// stamped = đã nhận hàng (đơn "Hoàn thành"); on-the-way = đã đặt nhưng chưa nhận; none = chưa đặt món nào của tỉnh này
export type StampState = "stamped" | "on-the-way" | "none";

export type ProvinceStamp = {
  province: string;
  region: Region;
  state: StampState;
  stampedAt?: string; // ngày ISO của đơn hoàn thành ĐẦU TIÊN có món của tỉnh này
  tasted: string[]; // tên các món của tỉnh này khách đã nhận
};

export function buildPassport(products: Product[], orders: Order[], userId: string): ProvinceStamp[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const myOrders = orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return groupProducts(products, productProvince).map(({ name, items }) => {
    const ids = new Set(items.map((item) => item.id));
    const stamp: ProvinceStamp = { province: name, region: items[0].region, state: "none", tasted: [] };

    for (const order of myOrders) {
      if (order.status === "CANCELLED") continue; // đơn đã hủy: không có hàng tới
      const fromHere = order.items.filter((item) => ids.has(item.productId));
      if (fromHere.length === 0) continue;
      if (order.status === "COMPLETED") {
        stamp.state = "stamped";
        stamp.stampedAt ??= order.createdAt;
        for (const item of fromHere) {
          const productName = productById.get(item.productId)?.name ?? item.name;
          if (!stamp.tasted.includes(productName)) stamp.tasted.push(productName);
        }
      } else if (stamp.state === "none") {
        stamp.state = "on-the-way";
      }
    }
    return stamp;
  });
}
