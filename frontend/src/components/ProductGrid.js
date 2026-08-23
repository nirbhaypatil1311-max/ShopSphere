import ProductCard from "./ProductCard";

export default function ProductGrid({
  products
}) {
  if (!products.length) {
    return (
      <div className="card p-10 text-center text-slate-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}