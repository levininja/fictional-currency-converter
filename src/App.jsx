import { useState, useMemo, useCallback } from 'react'
import './App.scss'
import { ExchangeSection } from './ExchangeSection'
import { DenominationsSection } from './DenominationsSection'
import { BreakdownSection } from './BreakdownSection'
import { greedyBreakdown } from './greedy'
import { CURRENCY_SYMBOL_OPTIONS } from './currencySymbols'

const defaultRate = 1
const defaultUsd = 0
const defaultSymbol = CURRENCY_SYMBOL_OPTIONS[0].value

function App() {
  const [exchangeRate, setExchangeRate] = useState(defaultRate)
  const [usdAmount, setUsdAmount] = useState(defaultUsd)
  const [denominations, setDenominations] = useState([])
  const [currencySymbol, setCurrencySymbol] = useState(defaultSymbol)

  const convertedAmount = useMemo(() => {
    const rate = Number(exchangeRate)
    const usd = Number(usdAmount)
    if (Number.isNaN(rate) || Number.isNaN(usd) || rate < 0) return 0
    return Math.trunc(usd * rate)
  }, [exchangeRate, usdAmount])

  const { breakdown, remainder, lowestUsedDenom } = useMemo(() => {
    const transactionDenoms = denominations.filter((d) => d.usedInTransactions !== false)
    const bd = greedyBreakdown(convertedAmount, transactionDenoms)
    const sum = bd.reduce((s, { value, count }) => s + value * count, 0)
    const lowest = transactionDenoms.length > 0
      ? transactionDenoms.reduce((min, d) => (d.value < min.value ? d : min))
      : null
    return {
      breakdown: bd,
      remainder: Math.max(0, convertedAmount - sum),
      lowestUsedDenom: lowest ? { name: lowest.name, value: lowest.value } : null,
    }
  }, [convertedAmount, denominations])

  const addDenomination = useCallback((name, govName, value) => {
    if (!name.trim()) return
    setDenominations((prev) => {
      const isFirst = prev.length === 0
      const valueNum = isFirst ? 1 : Number(value)
      if (!isFirst && (Number.isNaN(valueNum) || valueNum <= 0)) return prev
      return [
        ...prev,
        { id: crypto.randomUUID(), name: name.trim(), govName: (govName ?? '').trim(), value: isFirst ? 1 : Math.trunc(valueNum), usedInTransactions: true },
      ]
    })
  }, [])

  const updateDenomination = useCallback((id, name, govName, value) => {
    setDenominations((prev) => {
      const first = prev[0]
      const isFirstDenom = first?.id === id
      if (isFirstDenom) {
        return prev.map((d) =>
          d.id === id ? { ...d, name: (name ?? d.name).trim(), govName: (govName ?? d.govName ?? '').trim(), value: 1 } : d
        )
      }
      const valueNum = Number(value)
      if (Number.isNaN(valueNum) || valueNum <= 0) return prev
      return prev.map((d) =>
        d.id === id
          ? { ...d, name: (name ?? d.name).trim(), govName: (govName ?? d.govName ?? '').trim(), value: Math.trunc(valueNum) }
          : d
      )
    })
  }, [])

  const removeDenomination = useCallback((id) => {
    setDenominations((prev) => {
      const first = prev[0]
      if (first?.id === id) return prev
      return prev.filter((d) => d.id !== id)
    })
  }, [])

  const toggleUsedInTransactions = useCallback((id) => {
    setDenominations((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, usedInTransactions: !(d.usedInTransactions !== false) } : d
      )
    )
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fictional Currency Converter</h1>
        <p className="subtitle">
          Define your currency, set the exchange rate to 2026 USD, then convert and see the bill breakdown.
        </p>
        <label className="app-symbol-label">
          Currency symbol
          <select
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            className="app-symbol-select"
            aria-label="Fictional currency symbol"
          >
            {CURRENCY_SYMBOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <ExchangeSection
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
        usdAmount={usdAmount}
        onUsdAmountChange={setUsdAmount}
        convertedAmount={convertedAmount}
        currencySymbol={currencySymbol}
      />

      <DenominationsSection
        denominations={denominations}
        exchangeRate={exchangeRate}
        currencySymbol={currencySymbol}
        onAdd={addDenomination}
        onUpdate={updateDenomination}
        onRemove={removeDenomination}
        onToggleUsedInTransactions={toggleUsedInTransactions}
      />

      <BreakdownSection
        convertedAmount={convertedAmount}
        usdAmount={usdAmount}
        exchangeRate={exchangeRate}
        breakdown={breakdown}
        remainder={remainder}
        lowestUsedDenom={lowestUsedDenom}
        currencySymbol={currencySymbol}
      />
    </div>
  )
}

export default App
