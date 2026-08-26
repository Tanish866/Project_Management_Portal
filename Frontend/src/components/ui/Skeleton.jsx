export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="h-4 w-2/3 animate-pulse rounded bg-base-200" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-base-200" />
      <div className="mt-1.5 h-3 w-4/5 animate-pulse rounded bg-base-200" />
      <div className="mt-4 h-5 w-20 animate-pulse rounded-full bg-base-200" />
      <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-base-200" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-base-300 last:border-0">
      <td colSpan={100} className="px-5 py-4">
        <div className="h-4 w-full animate-pulse rounded bg-base-200" />
      </td>
    </tr>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-base-200" />
      ))}
    </div>
  );
}