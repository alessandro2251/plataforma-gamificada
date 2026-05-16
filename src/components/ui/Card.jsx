// src/components/ui/Card.jsx
import { cn } from "../../utils/cn";

export function Card({ children, className, glow = "none" }) {
  const glows = {
    none: "",
    blue: "shadow-neon-blue",
    purple: "shadow-neon-purple",
    pink: "shadow-neon-pink",
  };

  return (
    <div
      className={cn(
        "bg-vapor-surface border border-vapor-border rounded-2xl p-6 transition-shadow duration-300",
        glows[glow],
        className,
      )}>
      {children}
    </div>
  );
}
