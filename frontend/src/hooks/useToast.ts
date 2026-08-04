import { useCallback, useEffect, useState } from "react";

import type { ToastVariant } from "../components/Toast";

interface ToastState {
  message: string;
  variant: ToastVariant;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info"
    ) => {
      setToast({
        message,
        variant,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  return {
    toast,
    showToast,
    hideToast,
  };
};