// src/pages/EditInvoice.jsx
import React, { useEffect, useState } from 'react'
import supabase from '../utils/supabaseClient'

export default function EditInvoice({ onNavigate }) {
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ item_name: '', qty: '', price: '' })

  // invoice object کو localStorage سے لاؤ
  useEffect(() => {
    const savedInvoice = JSON.parse(localStorage.getItem('edit_invoice'))
    if (!savedInvoice) {
      alert('کوئی انوائس منتخب نہیں کی گئی!')
      onNavigate('sale-detail')
      return
    }
    setInvoice(savedInvoice)
    setItems(savedInvoice.items || [])
    setLoading(false)
  }, [])

  // Item Add
  function addItem() {
    if (!newItem.item_name || !newItem.qty || !newItem.price) return alert('تمام فیلڈ بھریں')
    setItems([...items, { ...newItem, qty: Number(newItem.qty), price: Number(newItem.price) }])
    setNewItem({ item_name: '', qty: '', price: '' })
  }

  // Item Remove
  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  // Qty / Price Update
  function updateItem(index, field, value) {
    const updated = [...items]
    updated[index][field] = field === 'qty' || field === 'price' ? Number(value) : value
    setItems(updated)
  }

  // Invoice Save
  async function saveInvoice() {
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0)
    const updated = { ...invoice, items, total_amount: total }

    const { error } = await supabase
      .from('sales')
      .update(updated)
      .eq('id', invoice.id)

    if (error) {
      alert('Error updating invoice: ' + error.message)
    } else {
      alert('Invoice updated successfully!')
      localStorage.removeItem('edit_invoice')
      onNavigate('sale-detail')
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Edit Invoice #{invoice.invoice_no}</h2>

      <div className="border p-3 mb-4 rounded bg-gray-50">
        <p><strong>Customer:</strong> {invoice.customer_name}</p>
        <p><strong>Date:</strong> {invoice.date}</p>
        <p><strong>Phone:</strong> {invoice.phone}</p>
      </div>

      <table className="w-full border mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              <td>
                <input
                  className="border p-1 w-full"
                  value={item.item_name}
                  onChange={e => updateItem(i, 'item_name', e.target.value)}
                />
              </td>
              <td>
                <input
                  className="border p-1 w-20"
                  type="number"
                  value={item.qty}
                  onChange={e => updateItem(i, 'qty', e.target.value)}
                />
              </td>
              <td>
                <input
                  className="border p-1 w-24"
                  type="number"
                  value={item.price}
                  onChange={e => updateItem(i, 'price', e.target.value)}
                />
              </td>
              <td>Rs. {item.qty * item.price}</td>
              <td>
                <button onClick={() => removeItem(i)} className="bg-red-600 text-white px-2 rounded">X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Item Name"
          className="border p-1 flex-1"
          value={newItem.item_name}
          onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
        />
        <input
          placeholder="Qty"
          type="number"
          className="border p-1 w-20"
          value={newItem.qty}
          onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          className="border p-1 w-24"
          value={newItem.price}
          onChange={e => setNewItem({ ...newItem, price: e.target.value })}
        />
        <button onClick={addItem} className="bg-green-600 text-white px-3 rounded">Add</button>
      </div>

      <div className="text-right font-bold text-lg mb-3">
        Total: Rs. {items.reduce((sum, i) => sum + i.qty * i.price, 0)}
      </div>

      <div className="flex gap-3">
        <button onClick={saveInvoice} className="bg-blue-600 text-white px-4 py-2 rounded">💾 Save</button>
        <button onClick={() => onNavigate('sale-detail')} className="bg-gray-500 text-white px-4 py-2 rounded">🔙 Back</button>
      </div>
    </div>
  )
}
