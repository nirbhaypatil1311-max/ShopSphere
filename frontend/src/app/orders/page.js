"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import OrderCard from "@/components/OrderCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data.orders || response.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <ProtectedRoute>
      <section className="container-page py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="mt-2 text-slate-600">
            View and track all your orders.
          </p>
        </div>

        {loading && <Loading />}

        {!loading && error && (
          <div className="card p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="card p-10 text-center">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-xl font-bold">
              No orders yet
            </h2>

            <p className="mt-2 text-slate-600">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/products"
              className="btn btn-primary mt-6"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id || order._id}
                order={order}
              />
            ))}
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}