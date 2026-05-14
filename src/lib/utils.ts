import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencyFullName(code: string, showName: boolean): string {
  if (!showName) return code;
  try {
    const name = new Intl.DisplayNames(['es-ES'], { type: 'currency' }).of(code);
    return name ? `${code} - ${name.charAt(0).toUpperCase() + name.slice(1)}` : code;
  } catch {
    return code;
  }
}

export function triggerHaptic(enabled: boolean) {
  if (enabled && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(10); // vibración sutil
    } catch {
      // Ignorar errores
    }
  }
}
