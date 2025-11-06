import React, { useEffect, useState } from 'react'
import supabase from '../utils/supabaseClient'

export default function ItemProfile({ onNavigate }) {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    barcode: '',
    item_name: '',
    category: '',
    purchase_price: '',
    sale_price: '',
    description: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  function handleSearchChange(e) {
    setQ(e.target.value)
  }

  function filteredItems() {
    if (!q) return items
    const s = q.toLowerCase()
    return items.filter(it =>
      (it.barcode && String(it.barcode).toLowerCase().includes(s)) ||
      (it.item_name && it.item_name.toLowerCase().includes(s)) ||
      (it.category && it.category.toLowerCase().includes(s)) ||
      (it.description && it.description.toLowerCase().includes(s))
    )
  }

  async function generateBarcode() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('barcode')
        .order('barcode', { ascending: false })
        .limit(1)
      if (error) throw error
      if (!data || data.length === 0) return 10001
      const max = Number(data[0].barcode) || 10000
      return max + 1
    } catch (err) {
      console.warn('Barcode gen error', err)
      return Date.now() % 100000 + 10001
    }
  }

  async function onAddClick() {
    setEditing(null)
    setForm({ barcode: '', item_name: '', category: '', purchase_price: '', sale_price: '', description: '' })
    setShowForm(true)
  }

  async function onEditClick(item) {
    setEditing(item)
    setForm({
      barcode: item.barcode,
      item_name: item.item_name || '',
      category: item.category || '',
      purchase_price: item.purchase_price || '',
      sale_price: item.sale_price || '',
      description: item.description || ''
    })
    setShowForm(true)
  }

  async function onDelete(item) {
    if (!confirm(`Delete item ${item.item_name || item.barcode}?`)) return
    setLoading(true)
    try {
      const { error } = await supabase.from('items').delete().eq('id', item.id)
      if (error) throw error
      await loadItems()
      alert('Deleted')
    } catch (err) {
      alert(err.message || 'Delete failed')
    } finally { setLoading(false) }
  }

  async function onSave(e) {
    e && e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        const { error } = await supabase.from('items').update({
          item_name: form.item_name,
          category: form.category,
          purchase_price: form.purchase_price || null,
          sale_price: form.sale_price || null,
          description: form.description || ''
        }).eq('id', editing.id)
        if (error) throw error
        alert('Updated')
      } else {
        let bc = form.barcode
        if (!bc) {
          bc = await generateBarcode()
        }
        const { error } = await supabase.from('items').insert([{
          barcode: Number(bc),
          item_name: form.item_name,
          category: form.category,
          purchase_price: form.purchase_price || null,
          sale_price: form.sale_price || null,
          description: form.description || ''
        }])
        if (error) throw error
        alert('Saved')
      }
      setShowForm(false)
      await loadItems()
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally { setLoading(false) }
  }

  function onExitAll() {
    setShowForm(false)
    setEditing(null)
    if (onNavigate) onNavigate('dashboard') // dashboard par return
  }

  return (
    <div>
      <h2 className="header-title">Item Profile</h2>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
        <input
          placeholder="Search by id, name, category..."
          value={q}
          onChange={handleSearchChange}
          style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', width: 360 }}
        />
        <button className="logout-btn" onClick={onAddClick}>➕ Add</button>
        <button className="menu-btn" onClick={loadItems}>🔄 Refresh</button>
        <button className="menu-btn" onClick={onExitAll}>🚪 Exit</button>
      </div>

      <div className="card">
        {loading ? <div>Loading...</div> : (
          <>
            {error && <div style={{ color: '#f88' }}>{error}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Barcode</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>P.Price</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>S.Price</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems().map(item => (
                  <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: 8 }}>{item.barcode}</td>
                    <td style={{ padding: 8 }}>{item.item_name}</td>
                    <td style={{ padding: 8 }}>{item.category}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{item.purchase_price || '-'}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{item.sale_price || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <button className="menu-btn" onClick={() => onEditClick(item)}>✏️</button>
                      <button className="menu-btn" onClick={() => onDelete(item)}>❌</button>
                    </td>
                  </tr>
                ))}
                {filteredItems().length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 10 }} className="small">No items found</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
          <form onSubmit={onSave} style={{ width: 720, background: '#0b0b0b', padding: 18, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ marginTop: 0 }}>{editing ? 'Edit Item' : 'Add Item'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

              <div>
                <label className="small">Barcode (auto)</label>
                <input
                  value={form.barcode}
                  readOnly
                  placeholder="Auto-generated"
                  style={{ width: '100%', padding: 8, borderRadius: 6, background: '#222', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label className="small">Category</label>
                <input
                  id="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('item_name').focus() } }}
                  style={{ width: '100%', padding: 8, borderRadius: 6 }}
                />
              </div>

              <div>
                <label className="small">Item Name</label>
                <input
                  id="item_name"
                  value={form.item_name}
                  onChange={e => setForm({ ...form, item_name: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('purchase_price').focus() } }}
                  style={{ width: '100%', padding: 8, borderRadius: 6 }}
                />
              </div>

              <div>
                <label className="small">Purchase Price</label>
                <input
                  id="purchase_price"
                  type="number"
                  value={form.purchase_price}
                  onChange={e => setForm({ ...form, purchase_price: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('sale_price').focus() } }}
                  style={{ width: '100%', padding: 8, borderRadius: 6 }}
                />
              </div>

              <div>
                <label className="small">Sale Price</label>
                <input
                  id="sale_price"
                  type="number"
                  value={form.sale_price}
                  onChange={e => setForm({ ...form, sale_price: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('description').focus() } }}
                  style={{ width: '100%', padding: 8, borderRadius: 6 }}
                />
              </div>

              <div>
                <label className="small">Description</label>
                <input
                  id="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('category').focus() } }}
                  style={{ width: '100%', padding: 8, borderRadius: 6 }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" className="menu-btn" onClick={onExitAll}>Exit</button>
              <button type="submit" className="logout-btn">{loading ? 'Saving...' : (editing ? 'Update' : 'Save')}</button>
            </div>

          </form>
        </div>
      )}
    </div>
  )
}
