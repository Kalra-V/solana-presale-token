"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
  link?: string;
  signature?: string;
}

function truncateSignature(signature: string, maxLength: number = 8): string {
  if (signature.length <= maxLength * 2) return signature;
  return `${signature.slice(0, maxLength)}...${signature.slice(-maxLength)}`;
}

export function Toast({ message, type, onClose, duration = 5000, link, signature }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in max-w-md`}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <span>{message}</span>
          {link && signature && (
            <div className="mt-1">
              <span className="text-sm opacity-90">{truncateSignature(signature)}</span>
              {" "}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:opacity-80 transition-opacity"
              >
                View on Explorer
              </a>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-80 flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}

