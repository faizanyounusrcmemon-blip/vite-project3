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
  const containerRef = useRef(null)

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

  // ✅ Close list only when click outside container
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
