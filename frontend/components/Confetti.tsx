"use client";

import { useEffect, useState } from "react";

export function Confetti({ trigger }: { trigger: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const colors = [
          "bg-purple-500",
          "bg-blue-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-pink-500",
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className={`absolute ${color} w-2 h-2 rounded-full`}
            style={{
              left: `${left}%`,
              top: "-10px",
              animation: `fall ${duration}s linear ${delay}s forwards`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

