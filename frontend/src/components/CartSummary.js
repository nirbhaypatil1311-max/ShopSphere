import Link from "next/link";

export default function CartSummary({
  total
}) {
  const shipping =
    total >= 1000 ? 0 : total ? 80 : 0;

  const tax = total * 0.18;

  const grandTotal =
    total + shipping + tax;

  return (
    <aside className="card h-fit p-5">
      <h2 className="text-xl font-black">
        Order Summary
      </h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            ₹{total.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            ₹{shipping.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>
            ₹{tax.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-t pt-3 text-lg font-black">
          <span>Total</span>

          <span>
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="btn btn-primary mt-5 w-full"
      >
        Proceed to Checkout
      </Link>
    </aside>
  );
}