// ---- FINAL SaleReturnDetail.jsx ----

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReturnDetail({ onNavigate }) {
  const [returns, setReturns] = useState([]);
  const [grouped, setGrouped] = useState([]);

  useEffect(() => {
    loadReturns();
  }, []);

  // 🔹 Load all sale returns
  async function loadReturns() {
    const { data } = await supabase
      .from("sale_returns")
      .select("*")
      .order("created_at", { ascending: false });

    setReturns(data || []);

    // Group by Invoice Number
    const map = {};
    (data || []).forEach((r) => {
      if (!map[r.invoice_no]) {
        map[r.invoice_no] = {
          invoice_no: r.invoice_no,
          date: r.created_at?.slice(0, 10),
          items: [],
          total: 0,
        };
      }

      map[r.invoice_no].items.push(r);
      map[r.invoice_no].total += Number(r.amount || 0);
    });

    setGrouped(Object.values(map));
  }

  // 🔥 Delete Return Row
  async function handleDelete(id) {
    if (!confirm("Return entry delete کرنا چاہتے ہیں؟")) return;

    const { error } = await supabase
      .from("sale_returns")
      .delete()
      .eq("id", id);

    if (error) return alert(error.message);

    loadReturns();
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

      <h2 style={{ color: "#f3c46b" }}>↩️ Sale Return Detail</h2>

      {grouped.length === 0 ? (
        <p style={{ marginTop: 20 }}>No return records found.</p>
      ) : (
        <div style={{ marginTop: 16 }}>
          {grouped.map((g) => (
            <div
              key={g.invoice_no}
              style={{
                background: "#111",
                marginBottom: 15,
                padding: 15,
                borderRadius: 8,
                border: "1px solid #333",
              }}
            >
              {/* HEADER ROW */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <b>Invoice:</b> {g.invoice_no}
                  <br />
                  <b>Date:</b> {g.date}
                </div>

                <div style={{ textAlign: "right", color: "red" }}>
                  <b>Total Return:</b> Rs {g.total.toFixed(2)}
                </div>
              </div>

              {/* ITEMS TABLE */}
              <table
                style={{
                  width: "100%",
                  fontSize: 13,
                  borderCollapse: "collapse",
                  marginTop: 10,
                }}
              >
                <thead>
                  <tr style={{ background: "#222" }}>
                    <th style={{ padding: 6 }}>Item</th>
                    <th style={{ padding: 6 }}>Qty</th>
                    <th style={{ padding: 6 }}>Rate</th>
                    <th style={{ padding: 6 }}>Amount</th>
                    <th style={{ padding: 6 }}>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {g.items.map((r) => (
                    <tr
                      key={r.id}
                      style={{ borderBottom: "1px solid #333" }}
                    >
                      <td style={{ padding: 6 }}>{r.item_name}</td>
                      <td style={{ padding: 6, textAlign: "center" }}>
                        {r.return_qty}
                      </td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        {r.rate}
                      </td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        {r.amount}
                      </td>

                      <td style={{ padding: 6, textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(r.id)}
                          style={{
                            background: "#c62828",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
