"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const params =
    useSearchParams();

  const orderId =
    params.get("orderId");

  return (
    <section className="container-page py-20 text-center">
      <div className="card mx-auto max-w-xl p-10">
        <div className="text-5xl text-green-600">
          ✓
        </div>

        <h1 className="mt-4 text-4xl font-black">
          Order Confirmed!
        </h1>

        <p className="mt-3 text-slate-600">
          Thank you for shopping with
          ShopSphere.
        </p>

        {orderId && (
          <p className="mt-4 font-bold">
            Order #{orderId}
          </p>
        )}

        <div className="mt-7 flex justify-center gap-3">
          <Link
            href={
              orderId
                ? `/orders/${orderId}`
                : "/orders"
            }
            className="btn btn-primary"
          >
            View Order
          </Link>

          <Link
            href="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}