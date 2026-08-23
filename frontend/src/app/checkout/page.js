"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  );
}

function Checkout() {
  const router = useRouter();

  const {
    cart,
    totalPrice
  } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "cod"
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const shipping = totalPrice >= 1000 ? 0 : 80;
  const tax = Number((totalPrice * 0.18).toFixed(2));
  const total = Number(
    (totalPrice + shipping + tax).toFixed(2)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!cart || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim()
    ) {
      setError("Please complete all shipping fields.");
      return;
    }

    setSubmitting(true);

    const orderData = {
      shippingAddress: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.line1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.postalCode.trim()
      },
      paymentMethod: form.paymentMethod
    };

    console.log("Sending order:", orderData);

    try {
      const response = await api.post(
        "/orders",
        orderData
      );

      console.log("Order response:", response.data);

      const orderId = response.data?.order?.id;

      if (!orderId) {
        throw new Error(
          "Order was created but no order ID was returned."
        );
      }

      router.push(
        `/checkout/confirmation?orderId=${orderId}`
      );
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Could not place order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-black">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_350px]"
      >
        <div className="card p-6">
          <h2 className="text-xl font-black">
            Shipping Address
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="fullName"
              required
              className="input"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
            />

            <input
              name="phone"
              required
              className="input"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              name="line1"
              required
              className="input md:col-span-2"
              placeholder="Address"
              value={form.line1}
              onChange={handleChange}
            />

            <input
              name="city"
              required
              className="input"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <input
              name="state"
              required
              className="input"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />

            <input
              name="postalCode"
              required
              className="input"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleChange}
            />
          </div>

          <h2 className="mt-8 text-xl font-black">
            Payment
          </h2>

          <select
            name="paymentMethod"
            className="input mt-4"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="cod">
              Cash on Delivery
            </option>

            <option value="card">
              Card - Demo
            </option>

            <option value="upi">
              UPI - Demo
            </option>
          </select>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary mt-6"
          >
            {submitting
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-xl font-black">
            Order Summary
          </h2>

          <p className="mt-4 flex justify-between">
            <span>Subtotal</span>
            <span>
              ₹{Number(totalPrice).toFixed(2)}
            </span>
          </p>

          <p className="mt-3 flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping === 0
                ? "Free"
                : `₹${shipping.toFixed(2)}`}
            </span>
          </p>

          <p className="mt-3 flex justify-between">
            <span>Tax (18%)</span>
            <span>
              ₹{tax.toFixed(2)}
            </span>
          </p>

          <p className="mt-3 flex justify-between border-t pt-3 font-black">
            <span>Total</span>
            <span>
              ₹{total.toFixed(2)}
            </span>
          </p>
        </div>
      </form>
    </section>
  );
}