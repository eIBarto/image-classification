import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind class strings safely
 * - Prefer `cn()` when composing conditional class names
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
