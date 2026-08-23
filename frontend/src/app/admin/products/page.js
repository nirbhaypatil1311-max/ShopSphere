"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiEdit,
  FiTrash2,
  FiPlus
} from "react-icons/fi";

import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";
import Loading from "@/components/Loading";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/products?limit=100"
      );

      setProducts(
        response.data.products ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(`/products/${id}`);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(Number(value || 0));
  };

  return (
    <AdminRoute>
      <section className="container-page py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Manage Products
            </h1>

            <p className="mt-2 text-slate-600">
              Add, edit and delete store products.
            </p>
          </div>

          <Link
            href="/admin/products/add"
            className="btn btn-primary"
          >
            <FiPlus className="mr-2" />
            Add Product
          </Link>
        </div>

        {loading && <Loading />}

        {!loading && error && (
          <div className="card p-6">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchProducts}
              className="btn btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="card p-10 text-center">
              <h2 className="text-xl font-bold">
                No products found
              </h2>

              <Link
                href="/admin/products/add"
                className="btn btn-primary mt-5"
              >
                Add First Product
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4 text-left">
                        Product
                      </th>

                      <th className="p-4 text-left">
                        Category
                      </th>

                      <th className="p-4 text-left">
                        Price
                      </th>

                      <th className="p-4 text-left">
                        Stock
                      </th>

                      <th className="p-4 text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                product.image ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"
                              }
                              alt={product.name}
                              className="h-14 w-14 rounded-lg object-cover"
                            />

                            <div>
                              <p className="font-semibold">
                                {product.name}
                              </p>

                              <p className="text-sm text-slate-500">
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {product.category || "General"}
                        </td>

                        <td className="p-4 font-semibold">
                          {formatCurrency(product.price)}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              Number(product.stock) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {product.stock ?? 0}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                              title="Edit"
                            >
                              <FiEdit />
                            </Link>

                            <button
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                              disabled={
                                deletingId ===
                                product.id
                              }
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>
    </AdminRoute>
  );
}