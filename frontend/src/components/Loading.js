export default function Loading({
  text = "Loading..."
}) {
  return (
    <div className="flex min-h-48 items-center justify-center text-slate-500">
      {text}
    </div>
  );
}