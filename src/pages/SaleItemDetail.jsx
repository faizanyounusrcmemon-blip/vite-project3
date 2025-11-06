// src/pages/SaleItemDetail.jsx
import React, { useEffect, useState } from 'react'
import supabase from '../utils/supabaseClient'

export default function SaleItemDetail({ onNavigate }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [customerList, setCustomerList] = useState([])
  const [itemList, setItemList] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [filteredSales, setFilteredSales] = useState([])
  const [customerDetail, setCustomerDetail] = useState(null)

  // ✅ Load customers and items for search dropdowns
  useEffect(() => {
    const loadLists = async () => {
      const { data: customers } = await supabase
        .from('sales')
        .select('customer_name')
      const { data: items } = await supabase
        .from('sales')
        .select('item_name')

      const uniqueCustomers = [
        ...new Set(customers.map((c) => c.customer_name)),
      ]
      const uniqueItems = [...new Set(items.map((i) => i.item_name))]

      setCustomerList(uniqueCustomers)
      setItemList(uniqueItems)
    }
    loadLists()
  }, [])

  // ✅ Filter sales data based on selections
  const handleSearch = async () => {
    let query = supabase.from('sales').select('*')

    if (fromDate && toDate) {
      query = query.gte('sale_date', fromDate).lte('sale_date', toDate)
    }

    if (selectedCustomer) {
      query = query.eq('customer_name', selectedCustomer)
    }

    if (selectedItem) {
      query = query.eq('item_name', selectedItem)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
    } else {
      setFilteredSales(data || [])
      if (data && data.length > 0) {
        setCustomerDetail(data[0])
      } else {
        setCustomerDetail(null)
      }
    }
  }

  const totalAmount = filteredSales.reduce((sum, i) => sum + (i.amount || 0), 0)
  const discount = customerDetail?.discount || 0
  const netAmount = totalAmount - discount

  return (
    <div className="p-4">
      {/* Exit Button */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">🧾 Sales Detail</h2>
        <button
          onClick={() => onNavigate('sale-detail')}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Exit
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Date From */}
        <div>
          <label className="font-semibold">From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="font-semibold">To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Customer Search */}
        <div>
          <label className="font-semibold">Customer:</label>
          <input
            list="customerList"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            placeholder="Search customer..."
            className="w-full border p-2 rounded"
          />
          <datalist id="customerList">
            {customerList.map((c, idx) => (
              <option key={idx} value={c} />
            ))}
          </datalist>
        </div>

        {/* Item Search */}
        <div>
          <label className="font-semibold">Item:</label>
          <input
            list="itemList"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            placeholder="Search item..."
            className="w-full border p-2 rounded"
          />
          <datalist id="itemList">
            {itemList.map((i, idx) => (
              <option key={idx} value={i} />
            ))}
          </datalist>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🔍 Search
      </button>

      {/* Customer Detail */}
      {customerDetail && (
        <div className="mb-4 border p-3 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">📋 Customer Detail</h3>
          <p><strong>Name:</strong> {customerDetail.customer_name}</p>
          <p><strong>Phone:</strong> {customerDetail.customer_phone}</p>
          <p><strong>Address:</strong> {customerDetail.customer_address}</p>
        </div>
      )}

      {/* Sales Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Invoice No</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Rate</th>
            <th className="p-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map((it) => (
              <tr key={it.id}>
                <td className="p-2 border">{it.invoice_no}</td>
                <td className="p-2 border">{it.sale_date}</td>
                <td className="p-2 border">{it.item_name}</td>
                <td className="p-2 border">{it.qty}</td>
                <td className="p-2 border">{it.sale_rate}</td>
                <td className="p-2 border">{it.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
                کوئی ریکارڈ نہیں ملا۔
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      {filteredSales.length > 0 && (
        <div className="mt-4 font-bold text-right">
          کل رقم: {totalAmount}
          <br />
          رعایت: {discount}
          <br />
          نیٹ رقم: {netAmount}
        </div>
      )}
    </div>
  )
}
