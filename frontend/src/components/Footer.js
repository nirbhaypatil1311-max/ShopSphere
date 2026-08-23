import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 py-10 text-slate-300">
      <div className="container-page grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-black text-white">
            ShopSphere
          </h2>

          <p className="mt-3">
            A modern full-stack e-commerce
            platform.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white">
            Quick Links
          </h3>

          <div className="mt-3 flex flex-col gap-2">
            <Link href="/products">
              Products
            </Link>

            <Link href="/about">
              About
            </Link>

            <Link href="/contact">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">
            Account
          </h3>

          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login">
              Login
            </Link>

            <Link href="/register">
              Register
            </Link>

            <Link href="/orders">
              Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page mt-8 border-t border-slate-800 pt-5 text-sm">
        © {new Date().getFullYear()} ShopSphere.
        All rights reserved.
      </div>
    </footer>
  );
}