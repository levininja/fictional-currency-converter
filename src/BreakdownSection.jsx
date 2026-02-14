import styles from './BreakdownSection.module.scss'
import { formatUsd } from './formatDecimal'

export function BreakdownSection({ convertedAmount, usdAmount, exchangeRate, breakdown, remainder, lowestUsedDenom, currencySymbol }) {
  const remainderUsd = Number(exchangeRate) > 0 ? remainder / Number(exchangeRate) : null

  const formatInLowest = (value, roundToWhole = false) => {
    if (!lowestUsedDenom || lowestUsedDenom.value <= 0) return `${currencySymbol}${value}`
    const amount = value / lowestUsedDenom.value
    const label = roundToWhole
      ? Math.round(amount).toLocaleString()
      : (Number.isInteger(amount) ? amount : amount.toLocaleString(undefined, { maximumFractionDigits: 4 }))
    return `${label} ${lowestUsedDenom.name}s`
  }

  return (
    <section className={styles.section} aria-labelledby="breakdown-heading">
      <h2 id="breakdown-heading">Bill breakdown</h2>
      <p className={styles.description}>
        For the converted amount of <strong>{formatUsd(Number(usdAmount))}</strong> ({formatInLowest(convertedAmount, true)}), pay with:
      </p>

      {breakdown.length === 0 ? (
        <p className={styles.empty}>
          {convertedAmount <= 0
            ? 'Enter a positive USD amount and exchange rate to see a conversion.'
            : 'Add at least one denomination marked "Used in tx" to see the bill breakdown.'}
        </p>
      ) : (
        <>
          <ul className={styles.list}>
            {breakdown.map(({ name, value, count }, i) => (
              <li key={`${name}-${value}-${i}`} className={styles.item}>
                <span className={styles.count}>{count}</span>
                <span className={styles.times}>×</span>
                <span className={styles.name}>{name}</span>
                <span className={styles.value}>({formatInLowest(value)} each = {formatInLowest(count * value)})</span>
              </li>
            ))}
          </ul>
          {remainder > 0 && (
            <p className={styles.remainder}>
              Remainder: {currencySymbol}{remainder.toLocaleString()}
              {remainderUsd != null && Number.isFinite(remainderUsd) && ` (${formatUsd(remainderUsd)} in 2026 USD)`}
            </p>
          )}
        </>
      )}
    </section>
  )
}
