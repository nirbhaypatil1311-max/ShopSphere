"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";
import Loading from "@/components/Loading";
import OrderStatus from "@/components/OrderStatus";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/admin"
      );

      setOrders(
        response.data.orders ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      await api.put(
        `/orders/admin/${orderId}`,
        { status }
      );

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status
              }
            : order
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update order."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  return (
    <AdminRoute>
      <section className="container-page py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Manage Orders
          </h1>

          <p className="mt-2 text-slate-600">
            View customer orders and update order status.
          </p>
        </div>

        {loading && <Loading />}

        {!loading && error && (
          <div className="card p-6">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchOrders}
              className="btn btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-5xl">📦</div>

              <h2 className="mt-4 text-xl font-bold">
                No orders found
              </h2>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4 text-left">
                        Order
                      </th>

                      <th className="p-4 text-left">
                        Customer
                      </th>

                      <th className="p-4 text-left">
                        Date
                      </th>

                      <th className="p-4 text-left">
                        Total
                      </th>

                      <th className="p-4 text-left">
                        Status
                      </th>

                      <th className="p-4 text-left">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const status =
                        order.status ||
                        order.order_status ||
                        "pending";

                      const customer =
                        order.user?.name ||
                        order.user_name ||
                        order.customer_name ||
                        order.email ||
                        "Customer";

                      return (
                        <tr
                          key={order.id}
                          className="border-t border-slate-200"
                        >
                          <td className="p-4">
                            <Link
                              href={`/orders/${order.id}`}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              #{order.id}
                            </Link>
                          </td>

                          <td className="p-4">
                            {customer}
                          </td>

                          <td className="p-4">
                            {formatDate(
                              order.created_at ||
                                order.createdAt
                            )}
                          </td>

                          <td className="p-4 font-semibold">
                            {formatCurrency(
                              order.total_amount ||
                                order.total
                            )}
                          </td>

                          <td className="p-4">
                            <OrderStatus
                              status={status}
                            />
                          </td>

                          <td className="p-4">
                            <select
                              value={status}
                              disabled={
                                updatingId ===
                                order.id
                              }
                              onChange={(event) =>
                                updateStatus(
                                  order.id,
                                  event.target.value
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            >
                              <option value="pending">
                                Pending
                              </option>

                              <option value="processing">
                                Processing
                              </option>

                              <option value="shipped">
                                Shipped
                              </option>

                              <option value="delivered">
                                Delivered
                              </option>

                              <option value="cancelled">
                                Cancelled
                              </option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>
    </AdminRoute>
  );
}