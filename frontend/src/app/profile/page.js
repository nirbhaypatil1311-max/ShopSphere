"use client";

import Link from "next/link";
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiShoppingCart,
  FiLogOut,
  FiEdit
} from "react-icons/fi";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

function Profile() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  return (
    <section className="container-page py-12">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-4xl font-black">
          My Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your ShopSphere account
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">

        {/* LEFT SIDEBAR */}
        <div className="card p-4">

          {/* USER INFO */}
          <div className="flex items-center gap-4 border-b p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FiUser size={26} />
            </div>

            <div className="min-w-0">
              <p className="truncate font-bold">
                {user?.name || "User"}
              </p>

              <p className="truncate text-sm text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* MENU */}
          <nav className="mt-3 space-y-1">

            {/* PROFILE */}
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-600"
            >
              <FiUser size={19} />
              Profile
            </Link>

            {/* ORDERS */}
            <Link
              href="/orders"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
            >
              <FiPackage size={19} />
              My Orders
            </Link>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <FiHeart size={19} />
                Wishlist
              </span>

              {wishlist.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <FiShoppingCart size={19} />
                My Cart
              </span>

              {totalItems > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-600">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
            >
              <FiLogOut size={19} />
              Logout
            </button>

          </nav>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-2">

          <div className="card p-6">

            {/* TITLE */}
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Account Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your ShopSphere account details
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary gap-2"
              >
                <FiEdit size={18} />
                Edit Profile
              </button>
            </div>

            {/* NAME */}
            <div className="border-b py-5">
              <p className="text-sm font-medium text-slate-500">
                Full Name
              </p>

              <p className="mt-1 text-lg font-bold">
                {user?.name || "Not available"}
              </p>
            </div>

            {/* EMAIL */}
            <div className="border-b py-5">
              <p className="text-sm font-medium text-slate-500">
                Email Address
              </p>

              <p className="mt-1 text-lg font-bold">
                {user?.email || "Not available"}
              </p>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="border-b py-5">
              <p className="text-sm font-medium text-slate-500">
                Account Type
              </p>

              <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-bold capitalize text-blue-700">
                {user?.role || "user"}
              </span>
            </div>

            {/* QUICK LINKS */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              {/* ORDERS */}
              <Link
                href="/orders"
                className="rounded-xl border p-5 transition hover:border-blue-500 hover:bg-blue-50"
              >
                <FiPackage
                  size={24}
                  className="text-blue-600"
                />

                <h3 className="mt-3 font-bold">
                  My Orders
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View your order history
                </p>
              </Link>

              {/* WISHLIST */}
              <Link
                href="/wishlist"
                className="rounded-xl border p-5 transition hover:border-red-500 hover:bg-red-50"
              >
                <FiHeart
                  size={24}
                  className="text-red-500"
                />

                <h3 className="mt-3 font-bold">
                  Wishlist
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {wishlist.length} saved{" "}
                  {wishlist.length === 1
                    ? "item"
                    : "items"}
                </p>
              </Link>

              {/* CART */}
              <Link
                href="/cart"
                className="rounded-xl border p-5 transition hover:border-blue-500 hover:bg-blue-50"
              >
                <FiShoppingCart
                  size={24}
                  className="text-blue-600"
                />

                <h3 className="mt-3 font-bold">
                  My Cart
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </p>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}