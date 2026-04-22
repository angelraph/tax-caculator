export function formatNaira(value: number, compact = false): string {
  if (compact && value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(2)}M`;
  }
  if (compact && value >= 1_000) {
    return `₦${(value / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('NGN', '₦')
    .replace(/\s/g, '');
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function parseNairaInput(value: string): number {
  const cleaned = value.replace(/[₦,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function encodeShareable(inputs: Record<string, unknown>): string {
  return btoa(JSON.stringify(inputs));
}

export function decodeShareable(encoded: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}
