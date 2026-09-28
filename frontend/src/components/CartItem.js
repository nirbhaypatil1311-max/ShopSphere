"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const {
    increase,
    decrease,
    removeFromCart
  } = useCart();

  const image =
    item.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  return (
    <div className="card flex gap-4 p-4">
      <Image
        src={image}
        alt={item.name}
        width={120}
        height={100}
        className="h-24 w-24 rounded-lg object-cover"
      />

      <div className="min-w-0 flex-1">
        <h3 className="font-bold">
          {item.name}
        </h3>

        <p className="mt-1 font-bold">
          ₹{Number(item.price).toLocaleString("en-IN")}
        </p>

        <div className="mt-3 flex items-center gap-2">

          {/* Decrease Quantity */}
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() =>
              decrease(item.product_id)
            }
          >
            -
          </button>

          {/* Current Quantity */}
          <span className="min-w-6 text-center font-semibold">
            {item.quantity}
          </span>

          {/* Increase Quantity */}
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() =>
              increase(item.product_id)
            }
          >
            +
          </button>

          {/* Remove Product */}
          <button
            type="button"
            className="ml-3 text-sm font-semibold text-red-600"
            onClick={() =>
              removeFromCart(item.product_id)
            }
          >
            Remove
          </button>

        </div>
      </div>
    </div>
  );
}
