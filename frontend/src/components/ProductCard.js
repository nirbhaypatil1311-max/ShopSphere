"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FiHeart,
  FiShoppingCart
} from "react-icons/fi";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({
  product
}) {
  const { addToCart } = useCart();

  const {
    isWishlisted,
    toggleWishlist
  } = useWishlist();

  const image =
    product.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  return (
    <article className="card overflow-hidden">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <Image
            src={image}
            alt={product.name || "Product"}
            width={700}
            height={500}
            unoptimized
            className="h-52 w-full object-cover"
          />
        </Link>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
          aria-label="Add to wishlist"
        >
          <FiHeart
            className={
              isWishlisted(product.id)
                ? "fill-red-500 text-red-500"
                : ""
            }
          />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs font-bold uppercase text-blue-600">
          {product.category_name ||
            product.category ||
            "Product"}
        </p>

        <Link
          href={`/product/${product.id}`}
          className="mt-1 block text-lg font-bold"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-black">
            ₹
            {Number(product.price).toLocaleString(
              "en-IN"
            )}
          </span>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="btn btn-primary gap-2"
          >
            <FiShoppingCart />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}