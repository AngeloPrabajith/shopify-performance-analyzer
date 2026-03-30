"use client";

import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  function show() {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(true);
  }

  function hide() {
    timeout.current = setTimeout(() => setVisible(false), 120);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className="absolute z-50 px-3 py-2 text-xs leading-relaxed rounded-lg pointer-events-none"
          style={{
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1E293B",
            color: "#CBD5E1",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            width: "max-content",
            maxWidth: 260,
          }}
        >
          {text}
          <span
            style={{
              position: "absolute",
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: "#1E293B",
              borderRight: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </span>
      )}
    </span>
  );
}
