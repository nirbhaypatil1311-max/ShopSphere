"use client";

import Link from "next/link";

import CartItem from "@/components/CartItem";
import CartSummary from "@/components/CartSummary";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    totalPrice
  } = useCart();

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-black">
        Shopping Cart
      </h1>

      {!cart.length ? (
        <div className="card mt-8 p-10 text-center">
          <p>
            Your cart is empty.
          </p>

          <Link
            href="/products"
            className="btn btn-primary mt-5"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
              />
            ))}
          </div>

          <CartSummary
            total={totalPrice}
          />
        </div>
      )}
    </section>
  );
}