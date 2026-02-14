/**
 * Greedy change-making: for a total amount and a list of denominations
 * (each { name, value }), returns list of { name, value, count } for
 * how many of each denomination to use. Uses whole numbers only.
 * Denominations should have positive values; we sort by value descending.
 */
export function greedyBreakdown(totalAmount, denominations) {
  if (!Number.isInteger(totalAmount) || totalAmount <= 0) return []
  if (!Array.isArray(denominations) || denominations.length === 0) return []

  const sorted = [...denominations]
    .filter((d) => Number.isInteger(d.value) && d.value > 0)
    .sort((a, b) => b.value - a.value)

  const result = []
  let remaining = totalAmount

  for (const { name, value } of sorted) {
    const count = Math.floor(remaining / value)
    if (count > 0) {
      result.push({ name, value, count })
      remaining -= count * value
    }
    if (remaining <= 0) break
  }

  return result
}
