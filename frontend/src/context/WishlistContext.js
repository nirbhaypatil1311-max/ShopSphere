
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../lib/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
  const token = localStorage.getItem("shopsphere_token");

  if (!token) {
    setWishlist([]);
    setLoading(false);
    return;
  }

  try {
    const response = await api.get("/wishlist");

    setWishlist(response.data.items || []);
  } catch (error) {
    console.error(
      "Failed to load wishlist:",
      error.response?.data?.message ||
        error.message
    );

    setWishlist([]);
  } finally {
    setLoading(false);
  }
};

  const isWishlisted = (id) => {
    return wishlist.some(
      (item) =>
        Number(item.product_id) === Number(id)
    );
  };

  const toggleWishlist = async (product) => {
    try {
      const exists = wishlist.some(
        (item) =>
          Number(item.product_id) ===
          Number(product.id)
      );

      if (exists) {
        await api.delete(
          `/wishlist/${product.id}`
        );
      } else {
        await api.post(
          `/wishlist/${product.id}`
        );
      }

      await loadWishlist();
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error.response?.data?.message ||
          error.message
      );

      throw error;
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);

      await loadWishlist();
    } catch (error) {
      console.error(
        "Failed to remove wishlist item:",
        error.response?.data?.message ||
          error.message
      );

      throw error;
    }
  };

  const clearWishlist = async () => {
    try {
      await api.delete("/wishlist");

      await loadWishlist();
    } catch (error) {
      console.error(
        "Failed to clear wishlist:",
        error.response?.data?.message ||
          error.message
      );

      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        loadWishlist,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

