import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function InvoiceFilters({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onSearch
}) {
  // Safe parse helper
  const safeDate = (value) => {
    if (!value) return null
    if (value instanceof Date) return value
    try {
      return new Date(value)
    } catch {
      return null
    }
  }

  return (
    <div
      className="filters"
      style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        marginBottom: '10px'
      }}
    >
      <div>
        <label>From: </label>
        <DatePicker
          selected={safeDate(startDate)}
          onChange={(date) => onStartChange(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select start date"
        />
      </div>

      <div>
        <label>To: </label>
        <DatePicker
          selected={safeDate(endDate)}
          onChange={(date) => onEndChange(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select end date"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="🔍 Search by invoice or customer name"
          onChange={(e) => onSearch(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />
      </div>
    </div>
  )
}
