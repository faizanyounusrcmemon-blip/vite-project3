import React from 'react'

export default function Navbar({ onNavigate=()=>{} }){
  return (
    <div className="topbar">
      <div className="nav-left">
        <div className="brand">KHADIJA JEWELLERY</div>
        <div className="menu">
          <button className="menu-btn">🛒 Sales</button>
          <div className="menu-list">
            <button onClick={()=>onNavigate('sale-entry')}>Sale Entry</button>
            <button onClick={()=>onNavigate('sale-return')}>Sale Return</button>
            <button onClick={()=>onNavigate('sale-detail')}>Sale Detail</button>
            <button onClick={()=>onNavigate('sale-item-detail')}>Sale Item Detail</button>
          </div>
        </div>
        <div className="menu">
          <button className="menu-btn">📦 Purchase</button>
          <div className="menu-list">
            <button onClick={()=>onNavigate('purchase-entry')}>Purchase Entry</button>
            <button onClick={()=>onNavigate('purchase-return')}>Purchase Return</button>
            <button onClick={()=>onNavigate('purchase-detail')}>Purchase Detail</button>
            <button onClick={()=>onNavigate('purchase-item-detail')}>Purchase Item Detail</button>
          </div>
        </div>
        <div className="menu">
          <button className="menu-btn">📇 Master</button>
          <div className="menu-list">
            <button onClick={()=>onNavigate('item-profile')}>Item Profile</button>
            <button onClick={()=>onNavigate('customer-profile')}>Customer Profile</button>
            <button onClick={()=>onNavigate('manage-users')}>Manage Users</button>
          </div>
        </div>
        <div className="menu">
          <button className="menu-btn">📊 Reports</button>
          <div className="menu-list">
            <button onClick={()=>onNavigate('stock-report')}>Stock Report</button>
          </div>
        </div>
      </div>
      <div className="right-actions">
        <div className="small">Online</div>
        <button className="logout-btn" onClick={()=>alert('Logged out')}>Logout</button>
      </div>
    </div>
  )
}
