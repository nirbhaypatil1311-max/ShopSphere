"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <section className="py-20 text-center">
        <h1 className="text-3xl font-bold">
          Access Denied
        </h1>

        <p className="mt-2 text-gray-500">
          Admin access is required.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-gray-500">
        Manage your ShopSphere store.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* PRODUCTS */}
        <Link
          href="/admin/products"
          className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">
            Products
          </h2>

          <p className="mt-2 text-gray-500">
            Add, edit and delete products.
          </p>
        </Link>

        {/* ORDERS */}
        <Link
          href="/admin/orders"
          className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">
            Orders
          </h2>

          <p className="mt-2 text-gray-500">
            View and manage customer orders.
          </p>
        </Link>

        {/* CONTACT MESSAGES */}
        <Link
          href="/admin/contacts"
          className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">
            Contact Messages
          </h2>

          <p className="mt-2 text-gray-500">
            View customer questions and messages.
          </p>
        </Link>

        {/* STORE */}
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">
            Store
          </h2>

          <p className="mt-2 text-gray-500">
            ShopSphere administration panel.
          </p>
        </div>

      </div>
    </section>
  );
}