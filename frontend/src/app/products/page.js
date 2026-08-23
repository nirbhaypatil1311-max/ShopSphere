"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import Loading from "@/components/Loading";
import { categories } from "@/data/categories";

export default function ProductsPage() {
  const params = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(
    params.get("search") || ""
  );

  const [category, setCategory] = useState(
    params.get("category") || ""
  );

  const [sort, setSort] = useState(
    params.get("sort") || "newest"
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams();

        if (search.trim()) {
          query.set("search", search);
        }

        if (category) {
          query.set("category", category);
        }

        if (sort) {
          query.set("sort", sort);
        }

        const response = await api.get(
          `/products?${query.toString()}`
        );

        console.log(
          "PRODUCTS FROM API:",
          response.data
        );

        setProducts(
          response.data?.products || []
        );
      } catch (error) {
        console.error(
          "GET PRODUCTS ERROR:",
          error.response?.data || error.message
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-black">
        Products
      </h1>

      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search products..."
        />

        <select
          className="input"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
          }}
        >
          <option value="">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
          }}
        >
          <option value="newest">
            Newest
          </option>

          <option value="price_asc">
            Price: Low to High
          </option>

          <option value="price_desc">
            Price: High to Low
          </option>

          <option value="name_asc">
            Name: A-Z
          </option>

          <option value="name_desc">
            Name: Z-A
          </option>
        </select>
      </div>

      <div className="mt-8">
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing your search or category.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-gray-500">
              Showing {products.length} products
            </p>

            <ProductGrid products={products} />
          </>
        )}
      </div>
    </section>
  );
}