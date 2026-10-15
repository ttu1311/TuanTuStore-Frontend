// 185000 -> "185.000₫"
export function formatVND(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

// "2026-10-06T08:00:00.000Z" -> "06/10/2026" (always Vietnam time)
export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(isoDate));
}
