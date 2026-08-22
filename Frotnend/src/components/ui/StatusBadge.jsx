export default function StatusBadge({ isActive }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}