"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import { categories } from "@/data/categories";

export default function Home() {
  const [products, setProducts] =
    useState([]);

  useEffect(() => {
    api
      .get("/products?limit=8")
      .then((response) => {
        setProducts(
          response.data.products ||
            response.data ||
            []
        );
      })
      .catch(() => {
        setProducts([]);
      });
  }, []);

  return (
    <div>
      <section className="bg-slate-900 py-20 text-white">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-bold text-blue-400">
              WELCOME TO SHOPSPHERE
            </p>

            <h1 className="mt-3 text-5xl font-black leading-tight">
              Everything you need,
              all in one place.
            </h1>

            <p className="mt-5 max-w-xl text-slate-300">
              Discover quality products,
              simple checkout and a modern
              shopping experience.
            </p>

            <Link
              href="/products"
              className="btn btn-primary mt-7"
            >
              Shop Now
            </Link>
          </div>

          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            alt="ShopSphere store"
            width={1000}
            height={700}
            className="rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="container-page py-14">
        <p className="font-bold text-blue-600">
          EXPLORE
        </p>

        <h2 className="text-3xl font-black">
          Categories
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="card p-6 text-lg font-bold hover:border-blue-500"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-14">
        <p className="font-bold text-blue-600">
          FEATURED
        </p>

        <h2 className="text-3xl font-black">
          Featured Products
        </h2>

        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}