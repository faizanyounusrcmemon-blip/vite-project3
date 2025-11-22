// src/pages/PurchaseEdit.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseEdit({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inv = sessionStorage.getItem("purchaseEditInvoice");
    if (!inv) {
      alert("No invoice selected");
      onNavigate("purchase-detail");
      return;
    }
    setInvoiceNo(inv);
    loadItems(inv);
  }, []);

  // ⭐ Load Purchase Items
  async function loadItems(inv) {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("invoice_no", inv)
      .eq("is_deleted", false);   // Only active rows

    if (error) {
      alert("Error loading data: " + error.message);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  // ⭐ Update a single row
  async function updateRow(row) {
    const { error } = await supabase
      .from("purchases")
      .update({
        qty: row.qty,
        purchase_rate: row.purchase_rate,
        amount: row.qty * row.purchase_rate,
      })
      .eq("id", row.id);

    if (error) alert("Error: " + error.message);
    else alert("Updated!");

    loadItems(invoiceNo);
  }

  // ⭐ Soft Delete Row (with password)
  async function softDelete(row) {
    const pass = prompt("Enter delete password:");
    if (!pass) return;

    if (pass !== "8515") return alert("❌ Wrong password!");

    await supabase
      .from("purchases")
      .update({ is_deleted: true })
      .eq("id", row.id);

    alert("🗑 Deleted!");

    loadItems(invoiceNo);
  }

  // ⭐ Save All
  async function saveAll() {
    for (let row of rows) {
      await supabase
        .from("purchases")
        .update({
          qty: row.qty,
          purchase_rate: row.purchase_rate,
          amount: row.qty * row.purchase_rate,
        })
        .eq("id", row.id);
    }

    alert("All changes saved!");
    loadItems(invoiceNo);
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <h2>✏ Edit Purchase: {invoiceNo}</h2>

      <button
        onClick={() => onNavigate("purchase-detail")}
        style={{
          background: "#c33",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          marginBottom: 15,
        }}
      >
        ⬅ Back
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#333", color: "#fff" }}>
              <th>Item Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.item_code}</td>

                <td>
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => {
                      const copy = [...rows];
                      const r = copy.find((x) => x.id === row.id);
                      r.qty = Number(e.target.value);
                      setRows(copy);
                    }}
                    style={{ width: "80px" }}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={row.purchase_rate}
                    onChange={(e) => {
                      const copy = [...rows];
                      const r = copy.find((x) => x.id === row.id);
                      r.purchase_rate = Number(e.target.value);
                      setRows(copy);
                    }}
                    style={{ width: "80px" }}
                  />
                </td>

                <td>{(row.qty * row.purchase_rate).toFixed(2)}</td>

                {/* Update Button */}
                <td>
                  <button
                    onClick={() => updateRow(row)}
                    style={{
                      background: "blue",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Update
                  </button>
                </td>

                {/* Delete Button */}
                <td>
                  <button
                    onClick={() => softDelete(row)}
                    style={{
                      background: "red",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Save All */}
      <button
        onClick={saveAll}
        style={{
          background: "green",
          color: "white",
          padding: "8px 12px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        💾 Save All
      </button>
    </div>
  );
}
