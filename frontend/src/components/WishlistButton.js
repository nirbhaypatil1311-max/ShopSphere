"use client";

import { FiHeart } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({
  product
}) {
  const {
    isWishlisted,
    toggleWishlist
  } = useWishlist();

  const active = isWishlisted(
    product.id
  );

  return (
    <button
      onClick={() =>
        toggleWishlist(product)
      }
      className={`btn gap-2 ${
        active
          ? "bg-red-100 text-red-600"
          : "btn-secondary"
      }`}
    >
      <FiHeart
        className={
          active ? "fill-current" : ""
        }
      />

      {active
        ? "Wishlisted"
        : "Add to Wishlist"}
    </button>
  );
}