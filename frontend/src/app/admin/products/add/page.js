"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: ""
};

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.price ||
      !form.category ||
      !form.stock
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    try {
      setLoading(true);

      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
        stock: Number(form.stock)
      });

      router.push("/admin/products");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <section className="container-page max-w-4xl py-10">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-blue-600"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Add Product
          </h1>

          <p className="mt-2 text-slate-600">
            Create a new product for your store.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card space-y-6 p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block font-semibold">
              Product Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input min-h-32"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Price *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input"
                placeholder="999"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="input"
                placeholder="50"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Category *
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">
                Select category
              </option>

              <option value="Electronics">
                Electronics
              </option>

              <option value="Fashion">
                Fashion
              </option>

              <option value="Shoes">
                Shoes
              </option>

              <option value="Accessories">
                Accessories
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Image URL
            </label>

            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />

            <p className="mt-2 text-sm text-slate-500">
              Enter an image URL. File upload can be added
              later with cloud storage.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Product"}
            </button>

            <Link
              href="/admin/products"
              className="btn btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </AdminRoute>
  );
}