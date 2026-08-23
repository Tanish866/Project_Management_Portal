import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {message}
    </div>
  );
}