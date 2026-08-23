import Link from "next/link";
import OrderStatus from "./OrderStatus";

export default function OrderCard({ order }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const status =
    order.status ||
    order.order_status ||
    "pending";

  const total =
    order.total_amount ||
    order.total ||
    order.grand_total ||
    0;

  return (
    <div className="card p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Order
          </p>

          <h2 className="text-lg font-bold">
            #{order.id}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {formatDate(
              order.created_at ||
                order.createdAt
            )}
          </p>
        </div>

        <OrderStatus status={status} />
      </div>

      <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="text-xl font-bold">
            {formatCurrency(total)}
          </p>
        </div>

        <Link
          href={`/orders/${order.id}`}
          className="btn btn-primary"
        >
          View Order
        </Link>
      </div>
    </div>
  );
}