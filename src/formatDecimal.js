/**
 * Format a number with up to 9 decimal places, removing trailing zeros
 * (e.g. 0.5 not 0.500000000, 1.23 not 1.230000000).
 */
export function formatDecimal(num, maxDecimals = 9) {
  if (num === null || num === undefined || !Number.isFinite(num)) return '—'
  const fixed = num.toFixed(maxDecimals)
  const trimmed = fixed.replace(/\.?0+$/, '')
  return trimmed
}

/** Format as USD with up to 9 decimals, no trailing zeros. */
export function formatUsd(num) {
  if (num === null || num === undefined || !Number.isFinite(num)) return '—'
  const trimmed = formatDecimal(num, 9)
  return `$${trimmed}`
}
