import { useState } from 'react'
import styles from './DenominationsSection.module.scss'
import { formatUsd, formatDecimal } from './formatDecimal'

export function DenominationsSection({ denominations, exchangeRate, currencySymbol, onAdd, onUpdate, onRemove, onToggleUsedInTransactions }) {
  const [newName, setNewName] = useState('')
  const [newGovName, setNewGovName] = useState('')
  const [newValue, setNewValue] = useState('')
  const isAddingBase = denominations.length === 0
  const lastValue = denominations.length > 0 ? denominations[denominations.length - 1].value : null

  const handleAdd = (e) => {
    e.preventDefault()
    if (isAddingBase) {
      onAdd(newName, newGovName, 1)
    } else {
      const mult = Number(newValue)
      if (Number.isNaN(mult) || mult <= 0) return
      const valueToAdd = Math.round(lastValue * mult)
      if (valueToAdd < 1) return
      onAdd(newName, newGovName, valueToAdd)
    }
    setNewName('')
    setNewGovName('')
    setNewValue('')
  }

  return (
    <section className={styles.section} aria-labelledby="denominations-heading">
      <h2 id="denominations-heading">Denominations</h2>
      <p className={styles.description}>
        The first denomination is the base unit (value 1). Add more with a value relative to the <em>last</em> denomination in the chain. Used for the bill breakdown.
      </p>

      <form onSubmit={handleAdd} className={styles.form}>
        <label className={styles.label}>
          Street Name
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={isAddingBase ? 'e.g. Credit' : 'e.g. Twenty'}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Gov Name
          <input
            type="text"
            value={newGovName}
            onChange={(e) => setNewGovName(e.target.value)}
            placeholder="e.g. One Credit"
            className={styles.input}
          />
        </label>
        {!isAddingBase && (
          <label className={styles.label}>
            Value (× last in chain)
            <input
              type="number"
              min="0.000001"
              step="any"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. 5"
              className={styles.input}
            />
          </label>
        )}
        <button type="submit" className={styles.button}>
          {isAddingBase ? 'Add base unit' : 'Add denomination'}
        </button>
      </form>

      {denominations.length > 0 && (
        <div className={styles.listWrap}>
          <div className={styles.listHeader}>
            <span className={styles.itemUsed}>Used in tx</span>
            <span className={styles.itemName}>Street Name</span>
            <span className={styles.itemGovName}>Gov Name</span>
            <span className={styles.itemValue}>Value (FC)</span>
            <span className={styles.itemRatio}>× previous denom</span>
            <span className={styles.itemRatio2}>× 2 back</span>
            <span className={styles.itemRatio3}>× 3 back</span>
            <span className={styles.itemUsd}>Value (USD)</span>
            <span className={styles.itemActions} aria-hidden="true" />
          </div>
          <ul className={styles.list}>
            {denominations.map((d, index) => (
              <DenominationRow
                key={d.id}
                id={d.id}
                name={d.name}
                govName={d.govName ?? ''}
                value={d.value}
                usedInTransactions={d.usedInTransactions !== false}
                previousValue={index > 0 ? denominations[index - 1].value : null}
                previousDenomName={index > 0 ? denominations[index - 1].name : null}
                previousPreviousValue={index >= 2 ? denominations[index - 2].value : null}
                previousPreviousDenomName={index >= 2 ? denominations[index - 2].name : null}
                previousThreeBackValue={index >= 3 ? denominations[index - 3].value : null}
                previousThreeBackDenomName={index >= 3 ? denominations[index - 3].name : null}
                exchangeRate={exchangeRate}
                currencySymbol={currencySymbol}
                isBase={index === 0}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onToggleUsedInTransactions={onToggleUsedInTransactions}
                formatUsd={formatUsd}
              />
            ))}
          </ul>
        </div>
      )}

      {denominations.length > 0 && (
        <InWorldTable
          denominations={denominations}
          exchangeRate={exchangeRate}
          formatUsd={formatUsd}
          formatDecimal={formatDecimal}
        />
      )}
    </section>
  )
}

function InWorldTable({ denominations, exchangeRate, formatUsd, formatDecimal }) {
  const transactionDenoms = denominations
    .map((d, index) => ({ d, index }))
    .filter(({ d }) => d.usedInTransactions !== false)

  const ratioWithName = (numDisplay, denomName) =>
    denomName ? <>{numDisplay} <span className={styles.ratioDenomName}>{denomName}s</span></> : numDisplay

  if (transactionDenoms.length === 0) return null

  const rate = Number(exchangeRate)

  return (
    <div className={styles.inWorldWrap}>
      <h3 id="denominations-in-world-heading" className={styles.inWorldHeading}>
        Denominations (In-World)
      </h3>
      <div className={styles.inWorldListWrap}>
        <div className={styles.inWorldHeader}>
          <span className={styles.inWorldName}>Street Name</span>
          <span className={styles.inWorldRatio}>× previous denom</span>
          <span className={styles.inWorldRatio2}>× 2 back</span>
          <span className={styles.inWorldUsd}>Value (USD)</span>
        </div>
        <ul className={styles.inWorldList}>
          {transactionDenoms.map(({ d, index }, rowIndex) => {
            const previousValue = index > 0 ? denominations[index - 1].value : null
            const previousDenomName = index > 0 ? denominations[index - 1].name : null
            const previousPreviousValue = index >= 2 ? denominations[index - 2].value : null
            const previousPreviousDenomName = index >= 2 ? denominations[index - 2].name : null
            const ratioToPrevious = previousValue != null && previousValue > 0 ? d.value / previousValue : null
            const ratioToTwoBack = previousPreviousValue != null && previousPreviousValue > 0 ? d.value / previousPreviousValue : null
            const ratioDisplay = ratioToPrevious != null ? formatDecimal(ratioToPrevious) : '—'
            const ratioTwoBackDisplay = ratioToTwoBack != null ? formatDecimal(ratioToTwoBack) : '—'
            const usdValue = rate > 0 && Number.isFinite(rate) ? d.value / rate : null
            const showPrevious = rowIndex > 0 ? ratioWithName(ratioDisplay, previousDenomName) : '—'
            const showTwoBack = rowIndex >= 2 ? ratioWithName(ratioTwoBackDisplay, previousPreviousDenomName) : '—'
            return (
              <li key={d.id} className={styles.inWorldItem}>
                <span className={styles.inWorldName}>{d.name}</span>
                <span className={styles.inWorldRatio}>{showPrevious}</span>
                <span className={styles.inWorldRatio2}>{showTwoBack}</span>
                <span className={styles.inWorldUsd}>{formatUsd(usdValue)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function DenominationRow({
  id,
  name,
  govName,
  value,
  usedInTransactions,
  previousValue,
  previousDenomName,
  previousPreviousValue,
  previousPreviousDenomName,
  previousThreeBackValue,
  previousThreeBackDenomName,
  exchangeRate,
  currencySymbol,
  isBase,
  onUpdate,
  onRemove,
  onToggleUsedInTransactions,
  formatUsd,
}) {
  const rate = Number(exchangeRate)
  const usdValue = rate > 0 && Number.isFinite(rate) ? value / rate : null
  const ratioToPrevious = previousValue != null && previousValue > 0 ? value / previousValue : null
  const ratioToTwoBack = previousPreviousValue != null && previousPreviousValue > 0 ? value / previousPreviousValue : null
  const ratioToThreeBack = previousThreeBackValue != null && previousThreeBackValue > 0 ? value / previousThreeBackValue : null

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editGovName, setEditGovName] = useState(govName)
  const [editValue, setEditValue] = useState('')

  const handleSave = () => {
    if (isBase) {
      onUpdate(id, editName, editGovName, 1)
      setEditing(false)
      return
    }
    const mult = Number(editValue)
    if (Number.isNaN(mult) || mult <= 0 || previousValue == null) return
    const newAbsolute = Math.round(previousValue * mult)
    if (newAbsolute < 1) return
    onUpdate(id, editName, editGovName, newAbsolute)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditName(name)
    setEditGovName(govName)
    setEditValue(String(isBase ? 1 : (previousValue > 0 ? value / previousValue : value)))
    setEditing(false)
  }

  const ratioDisplay = ratioToPrevious != null ? formatDecimal(ratioToPrevious) : '—'
  const ratioTwoBackDisplay = ratioToTwoBack != null ? formatDecimal(ratioToTwoBack) : '—'
  const ratioThreeBackDisplay = ratioToThreeBack != null ? formatDecimal(ratioToThreeBack) : '—'
  const ratioWithName = (numDisplay, denomName) =>
    denomName ? <>{numDisplay} <span className={styles.ratioDenomName}>{denomName}s</span></> : numDisplay

  if (editing) {
    return (
      <li className={styles.item}>
        <span className={styles.itemUsed}>
          <input
            type="checkbox"
            checked={usedInTransactions}
            onChange={() => onToggleUsedInTransactions(id)}
            aria-label="Used in transactions"
          />
        </span>
        <span className={styles.itemName}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={styles.inputSmall}
            aria-label="Street name"
          />
        </span>
        <span className={styles.itemGovName}>
          <input
            type="text"
            value={editGovName}
            onChange={(e) => setEditGovName(e.target.value)}
            className={styles.inputSmall}
            aria-label="Gov name"
          />
        </span>
        {isBase ? (
          <span className={styles.itemValue}>{currencySymbol}1 (base)</span>
        ) : (
          <input
            type="number"
            min="0.000001"
            step="any"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={styles.inputSmall}
            aria-label="Value × previous"
          />
        )}
        <span className={styles.itemRatio}>{ratioWithName(ratioDisplay, previousDenomName)}</span>
        <span className={styles.itemRatio2}>{ratioWithName(ratioTwoBackDisplay, previousPreviousDenomName)}</span>
        <span className={styles.itemRatio3}>{ratioWithName(ratioThreeBackDisplay, previousThreeBackDenomName)}</span>
        <span className={styles.itemUsd}>{formatUsd(usdValue)}</span>
        <div className={styles.itemActions}>
          <button type="button" onClick={handleSave} className={styles.btnSmall}>
            Save
          </button>
          <button type="button" onClick={handleCancel} className={styles.btnSmall}>
            Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className={styles.item}>
      <span className={styles.itemUsed}>
        <input
          type="checkbox"
          checked={usedInTransactions}
          onChange={() => onToggleUsedInTransactions(id)}
          aria-label="Used in transactions"
        />
      </span>
      <span className={styles.itemName}>{name}</span>
      <span className={styles.itemGovName}>{govName}</span>
      <span className={styles.itemValue}>{currencySymbol}{value}{isBase ? ' (base)' : ''}</span>
      <span className={styles.itemRatio}>{ratioWithName(ratioDisplay, previousDenomName)}</span>
      <span className={styles.itemRatio2}>{ratioWithName(ratioTwoBackDisplay, previousPreviousDenomName)}</span>
      <span className={styles.itemRatio3}>{ratioWithName(ratioThreeBackDisplay, previousThreeBackDenomName)}</span>
      <span className={styles.itemUsd}>{formatUsd(usdValue)}</span>
      <div className={styles.itemActions}>
        <button
          type="button"
          onClick={() => {
            setEditName(name)
            setEditGovName(govName)
            setEditValue(isBase ? '1' : String(previousValue > 0 ? value / previousValue : value))
            setEditing(true)
          }}
          className={styles.btnSmall}
        >
          Edit
        </button>
        {!isBase && (
          <button type="button" onClick={() => onRemove(id)} className={styles.btnSmallDanger}>
            Remove
          </button>
        )}
      </div>
    </li>
  )
}
