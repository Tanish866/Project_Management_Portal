import { X } from "lucide-react";

export default function Modal({ title, onClose, children, maxWidth = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className={`w-full ${maxWidth} rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-base-content">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}