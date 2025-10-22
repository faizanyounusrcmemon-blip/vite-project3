import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import SaleEntry from './pages/SaleEntry'
import SaleReturn from './pages/SaleReturn'
import SaleDetail from './pages/SaleDetail'
import SaleItemDetail from './pages/SaleItemDetail'
import PurchaseEntry from './pages/PurchaseEntry'
import PurchaseReturn from './pages/PurchaseReturn'
import PurchaseDetail from './pages/PurchaseDetail'
import PurchaseItemDetail from './pages/PurchaseItemDetail'
import ItemProfile from './pages/ItemProfile'
import CustomerProfile from './pages/CustomerProfile'
import ManageUsers from './pages/ManageUsers'
import StockReport from './pages/StockReport'

export default function App(){
  const [page, setPage] = useState('dashboard')

  const renderPage = () => {
    switch(page){
      case 'dashboard': return <Dashboard />
      case 'sale-entry': return <SaleEntry />
      case 'sale-return': return <SaleReturn />
      case 'sale-detail': return <SaleDetail />
      case 'sale-item-detail': return <SaleItemDetail />
      case 'purchase-entry': return <PurchaseEntry />
      case 'purchase-return': return <PurchaseReturn />
      case 'purchase-detail': return <PurchaseDetail />
      case 'purchase-item-detail': return <PurchaseItemDetail />
      case 'item-profile': return <ItemProfile />
      case 'customer-profile': return <CustomerProfile />
      case 'manage-users': return <ManageUsers />
      case 'stock-report': return <StockReport />
      default: return <Dashboard />
    }
  }

  return (
    <div className="app-root">
      <Navbar onNavigate={setPage} />
      <div className="content-area">{renderPage()}</div>
    </div>
  )
}
