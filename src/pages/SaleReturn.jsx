import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReturn({ onNavigate }) {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [fullReturn, setFullReturn] = useState(false);

  const loadInvoice = async () => {
    if (!invoiceNo) return alert("Invoice No required!");

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("invoice_no", invoiceNo);

    if (error || !data?.length) {
      return alert("Invoice not found!");
    }

    setSaleData(data);

    const prepared = data.map((d) => ({
      itemName: d.item_name,
      barcode: d.barcode,
      rate: d.sale_rate,
      soldQty: d.qty,
      returnQty: 0,
      amount: 0,
    }));

    setReturnItems(prepared);
  };

  const applyFullReturn = (checked) => {
    setFullReturn(checked);

    const updated = returnItems.map((i) => ({
      ...i,
      returnQty: checked ? i.soldQty : 0,
      amount: checked ? i.soldQty * i.rate : 0,
    }));

    setReturnItems(updated);
  };

  const updateQty = (index, value) => {
    const updated = [...returnItems];
    const qty = Number(value);

    if (qty > updated[index].soldQty) {
      alert("Return qty cannot exceed sold qty");
      return;
    }

    updated[index].returnQty = qty;
    updated[index].amount = qty * updated[index].rate;

    setReturnItems(updated);
  };

  const saveReturn = async () => {
    const filtered = returnItems.filter((i) => i.returnQty > 0);
    if (!filtered.length) return alert("No return qty entered!");

    const total = filtered.reduce((s, i) => s + i.amount, 0);

    const rows = filtered.map((i) => ({
      invoice_no: invoiceNo,
      item_name: i.itemName,
      barcode: i.barcode,
      return_qty: i.returnQty,
      rate: i.rate,
      amount: i.amount,
      total_amount: total,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("sale_returns").insert(rows);
    if (error) return alert("Error saving return: " + error.message);

    for (const r of filtered) {
      await supabase.rpc("increase_stock", {
        p_barcode: r.barcode,
        p_qty: r.returnQty,
      });
    }

    alert("Return processed!");
    window.location.reload();
  };

  const cancelReturn = () => {
    if (window.confirm("Cancel Return?")) {
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔙 EXIT ALWAYS VISIBLE */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: "6px 10px",
          marginBottom: "15px",
          background: "#444",
          color: "white",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        ⬅ Exit
      </button>

      <h2 style={{ textAlign: "center" }}>Sale Return</h2>

      {/* Invoice Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Enter Invoice No"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          style={{ padding: 6, border: "1px solid #ccc" }}
        />
        <button onClick={loadInvoice} style={{ padding: "6px 12px" }}>
          Load Invoice
        </button>
      </div>

      {saleData && (
        <>
          {/* Full Return */}
          <div style={{ marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={fullReturn}
              onChange={(e) => applyFullReturn(e.target.checked)}
            />
            <label style={{ marginLeft: 6 }}>Full Bill Return</label>
          </div>

          <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>#</th>
                <th>Item</th>
                <th>Rate</th>
                <th>Sold Qty</th>
                <th>Return Qty</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {returnItems.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.itemName}</td>
                  <td>{it.rate}</td>
                  <td>{it.soldQty}</td>

                  <td>
                    <input
                      type="number"
                      value={it.returnQty}
                      onChange={(e) => updateQty(i, e.target.value)}
                      disabled={fullReturn}
                      style={{ width: "70px" }}
                    />
                  </td>

                  <td>{it.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Save + Cancel */}
          <div style={{ textAlign: "right", marginTop: 12 }}>
            <button
              onClick={saveReturn}
              style={{
                padding: "6px 14px",
                background: "green",
                color: "white",
                marginRight: "10px",
              }}
            >
              Save Return
            </button>

            <button
              onClick={cancelReturn}
              style={{
                padding: "6px 14px",
                background: "red",
                color: "white",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
