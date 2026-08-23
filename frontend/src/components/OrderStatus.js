export default function OrderStatus({ status }) {
  const normalized =
    String(status || "pending").toLowerCase();

  const styles = {
    pending:
      "bg-yellow-100 text-yellow-800",
    processing:
      "bg-blue-100 text-blue-800",
    shipped:
      "bg-purple-100 text-purple-800",
    delivered:
      "bg-green-100 text-green-800",
    cancelled:
      "bg-red-100 text-red-800"
  };

  const label =
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[normalized] ||
        "bg-slate-100 text-slate-800"
      }`}
    >
      {label}
    </span>
  );
}