// src/pages/PurchaseDeleteReport.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseDeleteReport({ onNavigate }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadDeletedPurchases();
  }, []);

  // ⭐ Load ONLY deleted purchases and group them by invoice_no
  const loadDeletedPurchases = async () => {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("is_deleted", true); // deleted only

    if (!purchases || purchases.length === 0) {
      setRecords([]);
      return;
    }

    const invoiceMap = {};

    // ⭐ Group purchase rows by invoice number
    for (const r of purchases) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          invoice_no: r.invoice_no,
          purchase_date: r.purchase_date,
          company_name: r.company_name,
          totalAmount: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount || 0);
    }

    setRecords(Object.values(invoiceMap));
  };

  // ⭐ Restore Purchase
  const restorePurchase = async (invoiceNo) => {
    const ok = confirm("Do you want to restore this purchase?");
    if (!ok) return;

    await supabase
      .from("purchases")
      .update({ is_deleted: false })
      .eq("invoice_no", invoiceNo);

    alert("Purchase Restored!");
    loadDeletedPurchases();
  };

  // ⭐ Permanent Delete
  const permanentDelete = async (invoiceNo) => {
    const pass = prompt("Enter delete password:");
    if (!pass) return alert("❌ Password required");

    if (pass !== "5050") {
      return alert("❌ Wrong password!");
    }

    const ok = confirm("⚠ This will permanently delete the purchase invoice. Continue?");
    if (!ok) return;

    await supabase.from("purchases").delete().eq("invoice_no", invoiceNo);

    alert("🗑 Purchase permanently deleted!");
    loadDeletedPurchases();
  };

  return (
    <div style={{ padding: 20 }}>

      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          marginBottom: 15,
        }}
      >
        ⬅ Exit
      </button>

      <h2>🗑 Deleted Purchase Report</h2>

      {records.length === 0 ? (
        <p>No deleted purchase invoices found.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", marginTop: 20, background: "#fff" }}
        >
          <thead>
            <tr style={{ background: "#f3f3f3" }}>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Company</th>
              <th>Total Amount</th>
              <th>Restore</th>
              <th>Delete Forever</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.purchase_date}</td>
                <td>{r.invoice_no}</td>
                <td>{r.company_name}</td>
                <td>Rs {r.totalAmount.toFixed(2)}</td>

                {/* Restore */}
                <td>
                  <button
                    onClick={() => restorePurchase(r.invoice_no)}
                    style={{
                      background: "green",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Restore
                  </button>
                </td>

                {/* Delete Forever */}
                <td>
                  <button
                    onClick={() => permanentDelete(r.invoice_no)}
                    style={{
                      background: "red",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
