import { useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  return { toast, showToast, clearToast: () => setToast(null) };
}