// src/pages/PurchaseItemDetail.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseItemDetail({ onNavigate }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [itemQuery, setItemQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default last 30 days
  useEffect(() => {
    const t = new Date();
    const f = new Date();
    f.setDate(t.getDate() - 365);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (from && to) load();
  }, [from, to, itemQuery]);

  // ⭐ Load Table (Soft delete hidden)
  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("purchases")
      .select(
        "id, invoice_no, company_name, purchase_date, item_code, item_name, sale_price, qty, barcode, is_deleted"
      )
      .eq("is_deleted", false) // ⭐⭐ SOFT DELETE HIDE DONE ⭐⭐
      .gte("purchase_date", from)
      .lte("purchase_date", to)
      .order("purchase_date", { ascending: false });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      let list = data || [];

      if (itemQuery.trim()) {
        const q = itemQuery.toLowerCase();
        list = list.filter(
          (r) =>
            (r.item_name || "").toLowerCase().includes(q) ||
            (r.item_code || "").toLowerCase().includes(q)
        );
      }

      setRows(list);
    }
    setLoading(false);
  }

  // Search suggestions
  async function loadSuggestions(q) {
    setItemQuery(q);
    if (!q.trim()) return setSuggestions([]);

    const { data } = await supabase
      .from("items")
      .select("item_name, item_code")
      .ilike("item_name", `%${q}%`)
      .limit(10);

    setSuggestions(data || []);
  }

  // Single Item Thermal Print
  function printBarcodes(r) {
    localStorage.setItem("print_invoice", r.invoice_no);
    localStorage.setItem("print_barcode", r.barcode);
    localStorage.setItem("print_name", r.item_name);
    localStorage.setItem("print_price", r.sale_price || 0);
    localStorage.setItem("print_qty", r.qty);
    window.open("/print.html", "_blank");
  }

  // Exit Button
  function handleExit() {
    if (typeof onNavigate === "function") onNavigate("dashboard");
  }

  return (
    <div style={{ padding: 12, color: "#fff", minHeight: "100vh" }}>

      {/* Header + Exit */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ color: "#f3c46b" }}>Purchase Item Detail</h2>
        <button
          onClick={handleExit}
          style={{
            background: "#c33",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            border: "none",
          }}
        >
          Exit
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 12 }}>
        <label>From: </label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ padding: 4, marginRight: 8 }}
        />

        <label>To: </label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ padding: 4, marginRight: 12 }}
        />

        <input
          value={itemQuery}
          onChange={(e) => loadSuggestions(e.target.value)}
          placeholder="🔍 Search item…"
          style={{
            padding: 6,
            width: 250,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            background: "#222",
            padding: 6,
            borderRadius: 4,
            width: 250,
            marginBottom: 10,
            position: "absolute",
            zIndex: 100,
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.item_code}
              onClick={() => {
                setItemQuery(s.item_name);
                setSuggestions([]);
              }}
              style={{
                padding: 6,
                cursor: "pointer",
                borderBottom: "1px solid #333",
              }}
            >
              {s.item_name}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : rows.length > 0 ? (
        <table
          border="1"
          style={{
            width: "100%",
            marginTop: 20,
            borderCollapse: "collapse",
            background: "#1c1c1c",
          }}
        >
          <thead>
            <tr style={{ background: "#333", color: "#f3c46b" }}>
              <th>Inv</th>
              <th>Date</th>
              <th>Company</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Barcode</th>
              <th>Print</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #555" }}>
                <td>{r.invoice_no}</td>
                <td>{r.purchase_date}</td>
                <td>{r.company_name}</td>
                <td>{r.item_name}</td>
                <td>{r.qty}</td>
                <td>{r.barcode}</td>
                <td>
                  <button
                    onClick={() => printBarcodes(r)}
                    style={{
                      background: "#f3c46b",
                      color: "#000",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#ccc", marginTop: 20 }}>No records found.</p>
      )}
    </div>
  );
}
