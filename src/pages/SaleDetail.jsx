// --- FINAL SaleDetail.jsx (RETURN + NET + EXIT BUTTON) ---

import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleDetail({ onNavigate }) {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🔹 Load sales + return amounts
  useEffect(() => {
    const loadAll = async () => {
      // 1️⃣ Load Sales
      const { data: salesData } = await supabase
        .from("sales")
        .select("*")
        .eq("is_deleted", false);

      // 2️⃣ Load Returns
      const { data: returnData } = await supabase
        .from("sale_returns")
        .select("invoice_no, amount");

      // Group return amount per invoice
      const returnMap = {};
      returnData?.forEach((r) => {
        returnMap[r.invoice_no] = (returnMap[r.invoice_no] || 0) + Number(r.amount || 0);
      });

      // Merge into sales
      const merged = salesData?.map((s) => ({
        ...s,
        return_amount: returnMap[s.invoice_no] || 0,
      }));

      setSales(merged || []);
      setFiltered(merged || []);
    };

    loadAll();
  }, []);

  // 🔹 Filter Logic
  useEffect(() => {
    let result = [...sales];

    if (search)
      result = result.filter((r) =>
        r.customer_name?.toLowerCase().includes(search.toLowerCase())
      );

    if (invoiceSearch)
      result = result.filter((r) =>
        r.invoice_no?.toLowerCase().includes(invoiceSearch.toLowerCase())
      );

    if (fromDate && toDate) {
      const f = new Date(fromDate);
      const t = new Date(toDate);
      result = result.filter((r) => {
        const d = new Date(r.sale_date);
        return d >= f && d <= t;
      });
    }

    setFiltered(result);
  }, [search, invoiceSearch, fromDate, toDate, sales]);

  // 🔹 Group rows by invoice
  const groupedInvoices = Object.values(
    filtered.reduce((acc, s) => {
      if (!acc[s.invoice_no]) {
        acc[s.invoice_no] = {
          ...s,
          total_amount: 0,
          return_amount: s.return_amount || 0,
        };
      }
      acc[s.invoice_no].total_amount += Number(s.amount || 0);
      return acc;
    }, {})
  );

  // 🔹 Edit Invoice
  const handleEdit = (invoiceNo) => {
    localStorage.setItem("edit_invoice", invoiceNo);
    onNavigate("invoice-edit");
  };

  // 🔹 Delete Invoice
  const handleDelete = async (invoiceNo) => {
    if (!confirm("Delete invoice?")) return;

    await supabase
      .from("sales")
      .update({ is_deleted: true })
      .eq("invoice_no", invoiceNo);

    alert("Invoice deleted");
    window.location.reload();
  };

  // 🔹 EXIT Button
  const handleExit = () => {
    if (typeof onNavigate === "function") onNavigate("dashboard");
    else window.history.back();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Sales Detail</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Search Customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          placeholder="Search Invoice"
          value={invoiceSearch}
          onChange={(e) => setInvoiceSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total Sale</th>
            <th>Return</th>
            <th>Net Amount</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {groupedInvoices.map((inv) => (
            <tr key={inv.invoice_no}>
              <td>{inv.invoice_no}</td>
              <td>{inv.sale_date}</td>
              <td>{inv.customer_name}</td>

              <td>{inv.total_amount.toFixed(2)}</td>

              <td style={{ color: "red" }}>
                {inv.return_amount.toFixed(2)}
              </td>

              <td style={{ color: "green", fontWeight: "bold" }}>
                {(inv.total_amount - inv.return_amount).toFixed(2)}
              </td>

              <td className="flex gap-1">
                <button
                  onClick={() => handleEdit(inv.invoice_no)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(inv.invoice_no)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleExit}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Exit
      </button>
    </div>
  );
}
