export default function FormField({ label, ...inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:border-primary"
      />
    </div>
  );
}