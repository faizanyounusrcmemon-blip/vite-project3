import React, { useEffect, useState } from 'react'
import supabase from '../utils/supabaseClient'

export default function CustomerProfile({ onNavigate }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ customer_code:'', customer_name:'', address:'', phone:'', note:'' })
  const [error, setError] = useState('')

  useEffect(()=>{ load() }, [])

  async function load(){
    setLoading(true); setError('')
    try{
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
      if(error) throw error
      setRows(data || [])
    }catch(err){ setError(err.message || 'Load failed') }
    finally{ setLoading(false) }
  }

  function filtered(){
    if(!q) return rows
    const s = q.toLowerCase()
    return rows.filter(r =>
      (r.customer_code && String(r.customer_code).toLowerCase().includes(s)) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(s)) ||
      (r.phone && r.phone.toLowerCase().includes(s)) ||
      (r.address && r.address.toLowerCase().includes(s))
    )
  }

  async function genCustomerCode(){
    try{
      const { data, error } = await supabase.from('customers').select('customer_code').order('customer_code',{ascending:false}).limit(1)
      if(error) throw error
      if(!data || data.length === 0) return 10001
      const max = Number(data[0].customer_code) || 10000
      return max + 1
    }catch(err){
      return Date.now() % 100000 + 10001
    }
  }

  function onAdd(){ 
    setEditing(null); 
    setForm({ customer_code:'', customer_name:'', address:'', phone:'', note:'' }); 
    setShowForm(true) 
  }
  function onEdit(row){ 
    setEditing(row); 
    setForm({
      customer_code: row.customer_code, 
      customer_name: row.customer_name || '', 
      address: row.address||'', 
      phone: row.phone||'', 
      note: row.note||''
    }); 
    setShowForm(true) 
  }

  async function onDelete(row){
    if(!confirm(`Delete ${row.customer_name || row.customer_code}?`)) return
    setLoading(true)
    try{
      const { error } = await supabase.from('customers').delete().eq('id', row.id)
      if(error) throw error
      await load()
      alert('Deleted')
    }catch(err){ alert(err.message || 'Delete failed') }finally{ setLoading(false) }
  }

  async function onSave(e){
    e && e.preventDefault()
    setLoading(true)
    try{
      if(editing){
        const { error } = await supabase.from('customers').update({
          customer_name: form.customer_name,
          address: form.address,
          phone: form.phone,
          note: form.note
        }).eq('id', editing.id)
        if(error) throw error
        alert('Updated')
      } else {
        let code = form.customer_code
        if(!code) code = await genCustomerCode()
        const { error } = await supabase.from('customers').insert([{
          customer_code: Number(code),
          customer_name: form.customer_name,
          address: form.address,
          phone: form.phone,
          note: form.note
        }])
        if(error) throw error
        alert('Saved')
      }
      setShowForm(false)
      await load()
    }catch(err){ alert(err.message || 'Save failed') }finally{ setLoading(false) }
  }

  function onExitAll() {
    setShowForm(false)
    setEditing(null)
    if(onNavigate) onNavigate('dashboard')
  }

  return (
    <div>
      <h2 className="header-title">Customer Profile</h2>

      <div style={{display:'flex', gap:10, alignItems:'center', marginTop:12, marginBottom:12}}>
        <input placeholder="Search by id, name, phone..." value={q} onChange={e=>setQ(e.target.value)}
          style={{padding:8, borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', width:360}} />
        <button className="logout-btn" onClick={onAdd}>➕ Add</button>
        <button className="menu-btn" onClick={load}>🔄 Refresh</button>
        <button className="menu-btn" onClick={onExitAll}>🚪 Exit</button>
      </div>

      <div className="card">
        {loading ? <div>Loading...</div> : (
          <>
            {error && <div style={{color:'#f88'}}>{error}</div>}
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left',padding:8}}>Code</th>
                  <th style={{textAlign:'left',padding:8}}>Name</th>
                  <th style={{textAlign:'left',padding:8}}>Phone</th>
                  <th style={{textAlign:'left',padding:8}}>Address</th>
                  <th style={{padding:8}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered().map(r => (
                  <tr key={r.id} style={{borderTop:'1px solid rgba(255,255,255,0.03)'}}>
                    <td style={{padding:8}}>{r.customer_code}</td>
                    <td style={{padding:8}}>{r.customer_name}</td>
                    <td style={{padding:8}}>{r.phone}</td>
                    <td style={{padding:8}}>{r.address}</td>
                    <td style={{padding:8}}>
                      <button className="menu-btn" onClick={()=>onEdit(r)}>✏️</button>
                      <button className="menu-btn" onClick={()=>onDelete(r)}>❌</button>
                    </td>
                  </tr>
                ))}
                {filtered().length === 0 && (<tr><td colSpan={5} className="small" style={{padding:8}}>No customers</td></tr>)}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showForm && (
        <div style={{
          position:'fixed', left:0, top:0, right:0, bottom:0,
          background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200
        }}>
          <form onSubmit={onSave} style={{width:600, background:'#0b0b0b', padding:18, borderRadius:8, border:'1px solid rgba(255,255,255,0.06)'}}>
            <h3 style={{marginTop:0}}>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div>
                <label className="small">Customer Code (auto)</label>
                <input 
                  value={form.customer_code} 
                  readOnly 
                  placeholder="Auto-generated" 
                  style={{width:'100%', padding:8, borderRadius:6, background:'#222', cursor:'not-allowed'}} 
                />
              </div>
              <div>
                <label className="small">Phone</label>
                <input 
                  id="phone"
                  value={form.phone} 
                  onChange={e=>setForm({...form, phone:e.target.value})} 
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('customer_name').focus() } }}
                  style={{width:'100%', padding:8, borderRadius:6}} 
                />
              </div>
              <div>
                <label className="small">Customer Name</label>
                <input 
                  id="customer_name"
                  value={form.customer_name} 
                  onChange={e=>setForm({...form, customer_name:e.target.value})} 
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('address').focus() } }}
                  style={{width:'100%', padding:8, borderRadius:6}} 
                />
              </div>
              <div>
                <label className="small">Address</label>
                <input 
                  id="address"
                  value={form.address} 
                  onChange={e=>setForm({...form, address:e.target.value})} 
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('note').focus() } }}
                  style={{width:'100%', padding:8, borderRadius:6}} 
                />
              </div>
              <div style={{gridColumn:'1 / -1'}}>
                <label className="small">Note</label>
                <input 
                  id="note"
                  value={form.note} 
                  onChange={e=>setForm({...form, note:e.target.value})} 
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('phone').focus() } }}
                  style={{width:'100%', padding:8, borderRadius:6}} 
                />
              </div>
            </div>

            <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:12}}>
              <button type="button" className="menu-btn" onClick={onExitAll}>Exit</button>
              <button type="submit" className="logout-btn">{loading ? 'Saving...' : (editing ? 'Update' : 'Save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
