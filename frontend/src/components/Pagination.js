export default function Pagination({
  page,
  totalPages,
  onChange
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex justify-center gap-2">
      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((number) => (
        <button
          key={number}
          onClick={() =>
            onChange(number)
          }
          className={`rounded-lg px-4 py-2 ${
            page === number
              ? "bg-blue-600 text-white"
              : "border bg-white"
          }`}
        >
          {number}
        </button>
      ))}
    </div>
  );
}