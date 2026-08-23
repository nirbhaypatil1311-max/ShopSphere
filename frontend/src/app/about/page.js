export default function AboutPage() {
  return (
    <section className="container-page py-16">
      <div className="max-w-3xl">
        <p className="font-bold text-blue-600">
          ABOUT SHOPSPHERE
        </p>

        <h1 className="mt-2 text-5xl font-black">
          Built for a better online shopping
          experience.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          ShopSphere is a modern e-commerce
          platform built as a full-stack
          portfolio project. It demonstrates
          product management, authentication,
          shopping cart functionality,
          wishlist management, checkout,
          orders and administration.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          "Fast Shopping",
          "Secure Accounts",
          "Powerful Admin"
        ].map((item) => (
          <div
            key={item}
            className="card p-6"
          >
            <h2 className="font-black">
              {item}
            </h2>

            <p className="mt-2 text-slate-600">
              Designed to demonstrate a
              realistic e-commerce feature.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}