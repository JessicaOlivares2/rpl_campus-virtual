import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
    return text
        .toLowerCase() // 1. Convertir a minúsculas
        .trim() // 2. Eliminar espacios al inicio y final
        .replace(/[^\w\s-]/g, '') // 3. Eliminar caracteres que no sean letras, números, espacios o guiones (incluye acentos, etc.)
        .replace(/[\s_-]+/g, '-') // 4. Reemplazar espacios o guiones múltiples con un solo guion
        .replace(/^-+|-+$/g, ''); // 5. Eliminar guiones al inicio y al final
}