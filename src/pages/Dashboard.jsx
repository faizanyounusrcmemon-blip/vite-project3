import React, {useEffect, useState} from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function Dashboard(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true); setError('')
      try{
        const { data, error } = await supabase.from('items').select('*').limit(10)
        if(error) {
          setError(error.message || 'No table or permission error — but connection ok.')
        } else {
          setItems(data || [])
        }
      }catch(err){
        setError(err.message || 'Error contacting Supabase')
      }finally{ setLoading(false) }
    }
    load()
  },[])

  return (
    <div>
      <h2 className="header-title">Dashboard</h2>
      <div className="card">
        <p className="small">Welcome to Khadija Jewellery dashboard — Black & Gold theme.</p>
        <div style={{marginTop:12}}>
          <strong>Supabase connectivity test:</strong>
          {loading ? <div>Checking...</div> : (
            <div>
              {error ? <div style={{color:'#f88',marginTop:8}}>{error}</div> : (
                <div>
                  <div style={{marginTop:8,color:'#9f9'}}>Connected — sample rows (if any):</div>
                  <div style={{marginTop:8}}>
                    {items.length===0 ? <div className="small">No rows found in 'items' table.</div> : (
                      <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
                        <thead><tr><th style={{textAlign:'left',padding:6}}>Code</th><th style={{textAlign:'left',padding:6}}>Name</th></tr></thead>
                        <tbody>
                          {items.map(it=> <tr key={it.id}><td style={{padding:6}}>{it.code||'-'}</td><td style={{padding:6}}>{it.name||'-'}</td></tr>)}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
