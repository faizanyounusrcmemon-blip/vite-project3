import React from 'react'

export default function InvoiceSummaryCard({ totalSales }) {
  return (
    <div style={{
      background: '#222',
      color: '#fff',
      padding: '15px',
      borderRadius: '10px',
      textAlign: 'center',
      marginBottom: '15px'
    }}>
      <h3>💰 Total Sales</h3>
      <h2>{totalSales.toFixed(2)} PKR</h2>
    </div>
  )
}
