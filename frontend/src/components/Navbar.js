"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiHeart,
  FiMenu,
  FiShoppingCart,
  FiUser,
  FiX
} from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const links = [
    {
      href: "/",
      label: "Home"
    },
    {
      href: "/products",
      label: "Products"
    },
    {
      href: "/about",
      label: "About"
    },
    {
      href: "/contact",
      label: "Contact"
    }
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <nav className="container-page flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-2xl font-black text-blue-600"
        >
          ShopSphere
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/wishlist"
            className="relative"
          >
            <FiHeart size={21} />

            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative"
          >
            <FiShoppingCart size={21} />

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-1.5 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/profile">
                <FiUser size={20} />
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="font-semibold text-blue-600"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden font-semibold md:block"
            >
              Login
            </Link>
          )}

          <button
            className="md:hidden"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >
            {mobileMenu ? (
              <FiX size={23} />
            ) : (
              <FiMenu size={23} />
            )}
          </button>
        </div>
      </nav>

      {mobileMenu && (
        <div className="border-t bg-white p-4 md:hidden">
          <div className="container-page flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/profile">
                  Profile
                </Link>

                <Link href="/orders">
                  Orders
                </Link>

                <button
                  onClick={logout}
                  className="text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}