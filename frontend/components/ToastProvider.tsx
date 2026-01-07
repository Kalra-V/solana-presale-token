"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast } from "./Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  link?: string;
  signature?: string;
}

interface ToastContextType {
  showToast: (
    message: string,
    type: "success" | "error" | "info",
    options?: { link?: string; signature?: string }
  ) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info",
    options?: { link?: string; signature?: string }
  ) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, link: options?.link, signature: options?.signature }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            link={toast.link}
            signature={toast.signature}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

