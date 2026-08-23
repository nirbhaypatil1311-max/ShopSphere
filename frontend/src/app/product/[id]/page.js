"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import api from "@/lib/api";
import Loading from "@/components/Loading";
import WishlistButton from "@/components/WishlistButton";
import { useCart } from "@/context/CartContext";

export default function ProductDetailsPage() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/products/${id}`)
      .then((response) => {
        setProduct(
          response.data.product ||
            response.data
        );
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <div className="container-page py-16 text-center">
        Product not found.
      </div>
    );
  }

  const image =
    product.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  return (
    <section className="container-page py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <Image
          src={image}
          alt={product.name}
          width={1000}
          height={800}
          className="max-h-[550px] w-full rounded-2xl object-cover"
        />

        <div>
          <p className="font-bold text-blue-600">
            {product.category_name}
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-black">
            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}
          </p>

          <p className="mt-5 leading-7 text-slate-600">
            {product.description}
          </p>

          <p className="mt-4 font-semibold">
            Stock: {product.stock}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              className="rounded border px-4 py-2"
              onClick={() =>
                setQuantity(
                  Math.max(
                    1,
                    quantity - 1
                  )
                )
              }
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              className="rounded border px-4 py-2"
              onClick={() =>
                setQuantity(
                  Math.min(
                    product.stock,
                    quantity + 1
                  )
                )
              }
            >
              +
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={product.stock < 1}
              onClick={() =>
                addToCart(
                  product,
                  quantity
                )
              }
              className="btn btn-primary"
            >
              Add to Cart
            </button>

            <WishlistButton
              product={product}
            />
          </div>
        </div>
      </div>
    </section>
  );
}