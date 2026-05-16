// src/components/ui/Button.jsx
import { cn } from "../../utils/cn";

export function Button({
  children,
  variant = "primary",
  className,
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // Dicionário de variantes facilita a escalabilidade futura
  const variants = {
    primary: "bg-neon-blue text-vapor-dark hover:shadow-neon-blue px-6 py-3",
    secondary:
      "bg-transparent border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white hover:shadow-neon-purple px-6 py-3",
    ghost: "bg-transparent text-gray-400 hover:text-neon-pink px-4 py-2",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}
