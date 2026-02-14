import { useState } from 'react'
import styles from './ExchangeSection.module.scss'

export function ExchangeSection({
  exchangeRate,
  onExchangeRateChange,
  usdAmount,
  onUsdAmountChange,
  convertedAmount,
  currencySymbol,
}) {
  const [rateInput, setRateInput] = useState(String(exchangeRate))
  const [usdInput, setUsdInput] = useState(String(usdAmount))

  const handleRateChange = (e) => {
    const s = e.target.value
    setRateInput(s)
    const n = Number(s)
    if (!Number.isNaN(n) && n >= 0) onExchangeRateChange(n)
    else if (s === '' || s === '.') onExchangeRateChange(0)
  }

  const handleUsdChange = (e) => {
    const s = e.target.value
    setUsdInput(s)
    const n = Number(s)
    if (!Number.isNaN(n) && n >= 0) onUsdAmountChange(n)
    else if (s === '') onUsdAmountChange(0)
  }

  const handleRateBlur = () => {
    const n = Number(rateInput)
    if (Number.isNaN(n) || n < 0) setRateInput(exchangeRate >= 0 ? String(exchangeRate) : '')
  }

  const handleUsdBlur = () => {
    const n = Number(usdInput)
    if (Number.isNaN(n) || n < 0) setUsdInput(String(usdAmount))
  }

  return (
    <section className={styles.section} aria-labelledby="exchange-heading">
      <h2 id="exchange-heading">Exchange &amp; conversion</h2>

      <div className={styles.row}>
        <label className={styles.label}>
          Exchange rate (1 USD = this many units of the fictional currency)
          <input
            type="number"
            min="0"
            step="any"
            value={rateInput}
            onChange={handleRateChange}
            onBlur={handleRateBlur}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Amount in 2026 US dollars
          <input
            type="number"
            min="0"
            step="1"
            value={usdInput}
            onChange={handleUsdChange}
            onBlur={handleUsdBlur}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.result} role="status">
        <span className={styles.resultLabel}>Converted amount (fictional currency):</span>
        <span className={styles.resultValue}>{currencySymbol}{convertedAmount.toLocaleString()}</span>
      </div>
    </section>
  )
}
