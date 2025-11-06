// src/pages/PurchaseItemDetail.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseItemDetail() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [itemQuery, setItemQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const t = new Date();
    const f = new Date(); f.setDate(t.getDate() - 30);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (from && to) load();
  }, [from, to, itemQuery]);

  async function load() {
    const { data } = await supabase
      .from("purchases")
      .select("id, invoice_no, company_name, purchase_date, item_code, item_name, sale_price, qty, barcode")
      .gte("purchase_date", from)
      .lte("purchase_date", to)
      .order("purchase_date", { ascending: false });

    let list = data || [];

    if (itemQuery.trim()) {
      const q = itemQuery.toLowerCase();
      list = list.filter(r =>
        (r.item_name || "").toLowerCase().includes(q) ||
        (r.item_code || "").toLowerCase().includes(q)
      );
    }

    setRows(list);
  }

  async function loadSuggestions(q) {
    setItemQuery(q);
    const { data } = await supabase.from("items")
      .select("item_name, item_code")
      .ilike("item_name", `%${q}%`)
      .limit(10);
    setSuggestions(data || []);
  }

  function printBarcodes(r) {
    localStorage.setItem("print_invoice", r.invoice_no);
    localStorage.setItem("print_barcode", r.barcode);
    localStorage.setItem("print_name", r.item_name);
    localStorage.setItem("print_price", r.sale_price || 0);
    localStorage.setItem("print_qty", r.qty);
    window.open("#/barcode-print", "_blank");
  }

  return (
    <div style={{ padding: 12, color: "#fff" }}>
      <h2 style={{ color: "#f3c46b" }}>Purchase Item Detail</h2>

      <input value={itemQuery} onChange={(e) => loadSuggestions(e.target.value)}
        placeholder="Search item…" style={{ padding: 6, width: 250 }} />

      {suggestions.length > 0 && (
        <div style={{ background: "#222", padding: 6 }}>
          {suggestions.map(s => (
            <div key={s.item_code} onClick={() => { setItemQuery(s.item_name); setSuggestions([]); }}
              style={{ padding: 6, cursor: "pointer" }}>{s.item_name}</div>
          ))}
        </div>
      )}

      <table border="1" style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>Inv</th><th>Item</th><th>Qty</th><th>Barcode</th><th>Print</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.invoice_no}</td>
              <td>{r.item_name}</td>
              <td>{r.qty}</td>
              <td>{r.barcode}</td>
              <td><button onClick={() => printBarcodes(r)}>Print</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
