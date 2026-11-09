import { paymentStatusLabels, paymentStatusOf, paymentStatusStyles } from "@/lib/orders";
import type { Order } from "@/types";

// "Chờ thanh toán" / "Đã thanh toán" của đơn chuyển khoản. Đơn COD không hiện gì.
export default function PaymentStatusBadge({ order }: { order: Order }) {
  const status = paymentStatusOf(order);
  if (!status) return null;
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusStyles[status]}`}>
      {paymentStatusLabels[status]}
    </span>
  );
}
