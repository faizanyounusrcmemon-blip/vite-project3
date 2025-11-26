// ---- RateDifferenceReport.jsx ----

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function RateDifferenceReport({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // 🔹 Get all sales
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("is_deleted", false);

    // 🔹 Get all items (to compare sale price)
    const { data: items } = await supabase
      .from("items")
      .select("id, item_name, sale_price");

    const itemMap = {};
    items?.forEach((i) => {
      itemMap[i.id] = {
        name: i.item_name,
        masterRate: Number(i.sale_price),
      };
    });

    const diffList = [];

    sales?.forEach((s) => {
      const item = itemMap[s.item_code];
      if (!item) return;

      const masterRate = item.masterRate;
      const invoiceRate = Number(s.sale_rate);

      // Only show difference rows
      if (masterRate !== invoiceRate) {
        diffList.push({
          invoice_no: s.invoice_no,
          date: s.sale_date,
          item_name: item.name,
          master_rate: masterRate,
          sold_rate: invoiceRate,
          diff: invoiceRate - masterRate,
          qty: s.qty,
        });
      }
    });

    setRows(diffList);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20, color: "#fff", fontFamily: "Inter" }}>
      
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          padding: "6px 12px",
          borderRadius: 6,
          color: "#fff",
          marginBottom: 15,
        }}
      >
        ⬅ Exit
      </button>

      <h2 style={{ color: "#f3c46b" }}>📊 Rate Difference Report</h2>

      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p style={{ marginTop: 20 }}>No rate difference found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            marginTop: 20,
            borderCollapse: "collapse",
            background: "#111",
            color: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#333" }}>
              <th style={{ padding: 8 }}>Invoice</th>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Item</th>
              <th style={{ padding: 8 }}>Master Rate</th>
              <th style={{ padding: 8 }}>Sold Rate</th>
              <th style={{ padding: 8 }}>Difference</th>
              <th style={{ padding: 8 }}>Qty</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid #333", fontSize: 14 }}
              >
                <td style={{ padding: 8 }}>{r.invoice_no}</td>
                <td style={{ padding: 8 }}>{r.date}</td>
                <td style={{ padding: 8 }}>{r.item_name}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {r.master_rate}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {r.sold_rate}
                </td>
                <td
                  style={{
                    padding: 8,
                    textAlign: "right",
                    color: r.diff > 0 ? "lightgreen" : "red",
                  }}
                >
                  {r.diff}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>{r.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
