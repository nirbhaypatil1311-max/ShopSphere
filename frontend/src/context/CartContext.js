
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import api from"../lib/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

 const loadCart = async () => {
  const token = localStorage.getItem("shopsphere_token");

  if (!token) {
    setCart([]);
    setLoading(false);
    return;
  }

  try {
    const response = await api.get("/cart");

    setCart(response.data.items || []);
  } catch (error) {
    console.error(
      "Failed to load cart:",
      error.response?.data?.message || error.message
    );

    setCart([]);
  } finally {
    setLoading(false);
  }
};
  const addToCart = async (product, quantity = 1) => {
    try {
      await api.post("/cart", {
        productId: product.id,
        quantity
      });

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error.response?.data?.message || error.message
      );

      throw error;
    }
  };

  const removeFromCart = async (id) => {
    try {
      await api.delete(`/cart/${id}`);

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to remove product from cart:",
        error.response?.data?.message || error.message
      );

      throw error;
    }
  };

  const increase = async (id) => {
    const item = cart.find(
      (item) =>
        Number(item.product_id) === Number(id)
    );

    if (!item) {
      return;
    }

    try {
      await api.put(`/cart/${id}`, {
        quantity: Number(item.quantity) + 1
      });

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to increase quantity:",
        error.response?.data?.message || error.message
      );

      throw error;
    }
  };

  const decrease = async (id) => {
    const item = cart.find(
      (item) =>
        Number(item.product_id) === Number(id)
    );

    if (!item) {
      return;
    }

    const quantity = Number(item.quantity);

    try {
      if (quantity <= 1) {
        await api.delete(`/cart/${id}`);
      } else {
        await api.put(`/cart/${id}`, {
          quantity: quantity - 1
        });
      }

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to decrease quantity:",
        error.response?.data?.message || error.message
      );

      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to clear cart:",
        error.response?.data?.message || error.message
      );

      throw error;
    }
  };

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      ),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price) *
            Number(item.quantity),
        0
      ),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        loadCart,
        addToCart,
        removeFromCart,
        increase,
        decrease,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

