"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";
import Loading from "@/components/Loading";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get(
          `/products/${productId}`
        );

        const product =
          response.data.product ||
          response.data;

        setForm({
          name: product.name || "",
          description:
            product.description || "",
          price: product.price ?? "",
          category:
            product.category || "",
          image: product.image || "",
          stock: product.stock ?? ""
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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

    try {
      setSaving(true);

      await api.put(`/products/${productId}`, {
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
          "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <section className="container-page py-10">
          <Loading />
        </section>
      </AdminRoute>
    );
  }

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
            Edit Product
          </h1>

          <p className="mt-2 text-slate-600">
            Update product information.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="card space-y-6 p-6"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Product Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
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
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
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