"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import OrderStatus from "@/components/OrderStatus";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/orders/${orderId}`
        );

        const orderData =
          response.data?.order || response.data;

        const orderItems =
          response.data?.items ||
          orderData?.items ||
          orderData?.order_items ||
          orderData?.orderItems ||
          [];

        setOrder(orderData);
        setItems(orderItems);
      } catch (err) {
        console.error(
          "Failed to load order:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getAddress = () => {
    if (!order) return {};

    return (
      order.shipping_address ||
      order.shippingAddress ||
      order.address ||
      {}
    );
  };

  const getProductName = (item) => {
    return (
      item.product_name ||
      item.name ||
      item.product?.name ||
      "Product"
    );
  };

  const getProductImage = (item) => {
    return (
      item.product_image ||
      item.image ||
      item.product?.image ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
    );
  };

  const getQuantity = (item) => {
    return Number(item.quantity || 1);
  };

  const getItemPrice = (item) => {
    return Number(
      item.price ||
        item.product_price ||
        item.product?.price ||
        0
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <section className="container-page py-10">
          <Loading />
        </section>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <section className="container-page py-10">
          <div className="card p-10 text-center">
            <div className="text-5xl">⚠️</div>

            <h1 className="mt-4 text-2xl font-bold">
              Order Not Found
            </h1>

            <p className="mt-2 text-slate-600">
              {error ||
                "This order could not be found."}
            </p>

            <Link
              href="/orders"
              className="btn btn-primary mt-6"
            >
              Back to Orders
            </Link>
          </div>
        </section>
      </ProtectedRoute>
    );
  }

  const address = getAddress();

  const subtotal = items.reduce(
    (total, item) =>
      total +
      getItemPrice(item) * getQuantity(item),
    0
  );

  const total =
    Number(
      order.total_amount ||
        order.total ||
        order.grand_total ||
        0
    ) || subtotal;

  const shippingAmount = Number(
    order.shipping_amount ??
      order.shipping_cost ??
      order.shipping ??
      0
  );

  const addressText = [
    address.fullName ||
      address.full_name ||
      address.name,

    address.line1 ||
      address.address ||
      address.street,

    address.city,
    address.state,

    address.pincode ||
      address.postalCode ||
      address.postal_code ||
      address.zip,

    address.phone,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ProtectedRoute>
      <section className="container-page py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/orders"
              className="text-sm font-semibold text-blue-600"
            >
              ← Back to Orders
            </Link>

            <h1 className="mt-3 text-3xl font-bold">
              Order #{order.id}
            </h1>

            <p className="mt-2 text-slate-600">
              Placed on{" "}
              {formatDate(
                order.created_at ||
                  order.createdAt
              )}
            </p>
          </div>

          <OrderStatus
            status={
              order.status ||
              order.order_status ||
              "pending"
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-bold">
                  Order Items
                </h2>
              </div>

              <div className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No items found for this order.
                  </div>
                ) : (
                  items.map((item, index) => {
                    const quantity =
                      getQuantity(item);

                    const price =
                      getItemPrice(item);

                    return (
                      <div
                        key={
                          item.id ||
                          item.product_id ||
                          index
                        }
                        className="flex gap-4 p-5"
                      >
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                          className="h-20 w-20 rounded-xl object-cover"
                        />

                        <div className="flex-1">
                          <h3 className="font-bold">
                            {getProductName(item)}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Quantity: {quantity}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Price:{" "}
                            {formatCurrency(price)}
                          </p>
                        </div>

                        <div className="font-bold">
                          {formatCurrency(
                            price * quantity
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold">
                Shipping Address
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {addressText ||
                  "Address unavailable"}
              </p>
            </div>
          </div>

          <div>
            <div className="card p-6">
              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Items
                  </span>

                  <span>
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Shipping
                  </span>

                  <span>
                    {shippingAmount === 0
                      ? "Free"
                      : formatCurrency(
                          shippingAmount
                        )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Payment
                  </span>

                  <span className="uppercase">
                    {order.payment_method ||
                      order.paymentMethod ||
                      "COD"}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>

                  <span>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}