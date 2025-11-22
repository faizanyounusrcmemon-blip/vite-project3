import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function DeletedInvoiceReport({ onNavigate }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadDeletedInvoices();
  }, []);

  const loadDeletedInvoices = async () => {
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("is_deleted", true); // Only deleted invoices

    if (!sales || sales.length === 0) {
      setRecords([]);
      return;
    }

    const invoiceMap = {};

    for (const r of sales) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          invoice_no: r.invoice_no,
          sale_date: r.sale_date,
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discountPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discountPercent) / 100;
      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSale = saleRate - (saleRate * discountPercent) / 100;

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    setRecords(Object.values(invoiceMap));
  };

  // ⭐ Restore deleted invoice
  const restoreInvoice = async (invoiceNo) => {
    const ok = confirm("Do you want to restore this invoice?");
    if (!ok) return;

    await supabase
      .from("sales")
      .update({ is_deleted: false })
      .eq("invoice_no", invoiceNo);

    alert("Invoice restored!");
    loadDeletedInvoices();
  };

  // ⭐ Permanent delete with password
  const permanentDelete = async (invoiceNo) => {
    const pass = prompt("Enter delete password:");
    if (!pass) return alert("❌ Password required");

    // YOUR DELETE PASSWORD
    if (pass !== "5050") {
      return alert("❌ Incorrect password!");
    }

    const ok = confirm("⚠ This will permanently delete the invoice. Continue?");
    if (!ok) return;

    await supabase.from("sales").delete().eq("invoice_no", invoiceNo);

    alert("🗑 Invoice permanently deleted!");
    loadDeletedInvoices();
  };

  return (
    <div style={{ padding: 20 }}>
      {/* ⭐ EXIT BUTTON */}
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

      <h2>🗑 Deleted Invoice Report</h2>

      {records.length === 0 ? (
        <p>No deleted invoices found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr style={{ background: "#f3f3f3" }}>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Total Amount</th>
              <th>Total Discount</th>
              <th>Total Profit</th>
              <th>Restore</th>
              <th>Delete Forever</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.sale_date}</td>
                <td>{r.invoice_no}</td>
                <td>Rs {r.totalAmount.toFixed(2)}</td>
                <td style={{ color: "green" }}>Rs {r.totalDiscount.toFixed(2)}</td>
                <td style={{ color: r.totalProfit >= 0 ? "blue" : "red" }}>
                  Rs {r.totalProfit.toFixed(2)}
                </td>

                {/* Restore */}
                <td>
                  <button
                    onClick={() => restoreInvoice(r.invoice_no)}
                    style={{ background: "green", color: "white", padding: "4px 8px" }}
                  >
                    Restore
                  </button>
                </td>

                {/* Delete Forever with Password */}
                <td>
                  <button
                    onClick={() => permanentDelete(r.invoice_no)}
                    style={{ background: "red", color: "white", padding: "4px 8px" }}
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
