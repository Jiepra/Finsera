import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke format mata uang Rupiah Indonesia
 * @param amount - Jumlah yang akan diformat
 * @param options - Opsi tambahan
 * @returns String dalam format Rupiah (contoh: "Rp 1.500.000")
 */
export function formatRupiah(
  amount: number,
  options?: {
    showSymbol?: boolean;      // Default: true
    compact?: boolean;         // Tampilkan dalam format compact (1.5 Jt, 2 M)
    showDecimal?: boolean;     // Tampilkan desimal
  }
): string {
  const { showSymbol = true, compact = false, showDecimal = false } = options || {};

  // Handle NaN or undefined
  if (isNaN(amount) || amount === undefined || amount === null) {
    return showSymbol ? 'Rp 0' : '0';
  }

  // Compact format for large numbers
  if (compact) {
    const absAmount = Math.abs(amount);
    let formatted: string;

    if (absAmount >= 1_000_000_000_000) {
      formatted = (amount / 1_000_000_000_000).toFixed(1).replace('.0', '') + ' T'; // Triliun
    } else if (absAmount >= 1_000_000_000) {
      formatted = (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' M'; // Miliar
    } else if (absAmount >= 1_000_000) {
      formatted = (amount / 1_000_000).toFixed(1).replace('.0', '') + ' Jt'; // Juta
    } else if (absAmount >= 1_000) {
      formatted = (amount / 1_000).toFixed(1).replace('.0', '') + ' Rb'; // Ribu
    } else {
      formatted = amount.toString();
    }

    return showSymbol ? `Rp ${formatted}` : formatted;
  }

  // Standard format with Indonesian locale
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  }).format(amount);

  return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Parse string Rupiah kembali ke number
 * @param value - String dalam format Rupiah
 * @returns Number
 */
export function parseRupiah(value: string): number {
  // Remove "Rp", spaces, and dots (thousand separators)
  const cleaned = value
    .replace(/Rp\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format tanggal ke format Indonesia
 * @param date - Date object atau string tanggal
 * @param options - Opsi format
 * @returns String tanggal dalam format Indonesia
 */
export function formatTanggal(
  date: Date | string,
  options?: {
    showTime?: boolean;
    showDay?: boolean;
  }
): string {
  const { showTime = false, showDay = false } = options || {};

  const d = typeof date === 'string' ? new Date(date) : date;

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  if (showDay) {
    formatOptions.weekday = 'long';
  }

  if (showTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return d.toLocaleDateString('id-ID', formatOptions);
}
