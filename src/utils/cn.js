import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para mesclar classes Tailwind condicionalmente e resolver conflitos.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
