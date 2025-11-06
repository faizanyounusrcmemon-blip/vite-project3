import React from 'react'

export default function InvoiceTable({ invoices, onEdit, onDelete, onReprint }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
      <thead>
        <tr style={{ background: '#f8f8f8' }}>
          <th>Invoice #</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Discount</th>
          <th>Net</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length === 0 ? (
          <tr><td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>No invoices found</td></tr>
        ) : (
          invoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.invoice_no}</td>
              <td>{inv.sale_date}</td>
              <td>{inv.customer_name}</td>
              <td>{inv.total_amount}</td>
              <td>{inv.discount}</td>
              <td>{(inv.total_amount - inv.discount).toFixed(2)}</td>
              <td>
                <button onClick={() => onEdit(inv)}>✏️ Edit</button>
                <button onClick={() => onDelete(inv.id)}>🗑 Delete</button>
                <button onClick={() => onReprint(inv)}>🖨 Reprint</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
