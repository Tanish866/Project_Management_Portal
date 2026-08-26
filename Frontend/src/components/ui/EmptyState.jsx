export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-base-200 text-base-content/40">
          {icon}
        </div>
      )}
      <p className="font-semibold text-base-content">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-base-content/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}