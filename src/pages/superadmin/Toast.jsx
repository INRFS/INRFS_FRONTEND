import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function useToast() {
  const [toast, setToast] = useState("");
  const timerRef = useRef(null);

  const showToast = useCallback((message, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = setTimeout(() => setToast(""), duration);
  }, []);

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast("");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showToast, clearToast };
}

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="sa-toast" role="status">
      <CheckCircle2 size={16} />
      <span>{message}</span>
    </div>
  );
}