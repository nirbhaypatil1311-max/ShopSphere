"use client";

import Link from "next/link";

import ProductGrid from "@/components/ProductGrid";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <Wishlist />
    </ProtectedRoute>
  );
}

function Wishlist() {
  const { wishlist } =
    useWishlist();

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-black">
        Wishlist
      </h1>

      <div className="mt-8">
        {wishlist.length ? (
          <ProductGrid
            products={wishlist}
          />
        ) : (
          <div className="card p-10 text-center">
            <p>
              Your wishlist is empty.
            </p>

            <Link
              href="/products"
              className="btn btn-primary mt-5"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}