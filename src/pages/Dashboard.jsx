import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)
  const [lastBackup, setLastBackup] = useState("")   // ⭐ Add this
  const containerRef = useRef(null)

  // ================================
  // LOAD LAST BACKUP TIME
  // ================================
  useEffect(() => {
    loadLastBackup()
  }, [])

  async function loadLastBackup() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/list-backups`)
      const data = await res.json()

      if (data.success && data.files.length > 0) {
        setLastBackup(data.files[0].date)   // newest backup
      }
    } catch (err) {
      console.error("Backup load error:", err)
    }
  }

  
  // ================================
  // LOAD ITEMS
  // ================================
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError('Supabase client not initialized — check .env')
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase.from('items').select('*').limit(10)
        if (error) throw error
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>❌ {error}</p>

  return (
    <div style={{ padding: 20 }} ref={containerRef}>
      <h2>Dashboard</h2>
      <p>✅ Supabase Connected</p>

      
      {/* ⭐ Last Backup Time */}
      <p style={{ marginTop: -5, marginBottom: 15, color: "yellow", fontWeight: "bold" }}>
        Last Backup: {lastBackup || "No backup found"}
      </p>

      <button onClick={() => setShowList(!showList)} style={{ marginBottom: 10 }}>
        Toggle Items List
      </button>

      {showList && (
        <table border="1" cellPadding="6">
          <thead>
            <tr><th>Code</th><th>Name</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
