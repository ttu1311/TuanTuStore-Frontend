import { orderStatusLabels, orderStatusStyles } from "@/lib/orders";
import type { OrderStatus } from "@/types";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusStyles[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
