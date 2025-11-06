import React from "react";

export default function SalePrint({ saleData, onClose }) {
  if (!saleData) return null;

  const fmt = (n) => Number(n || 0).toFixed(2);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "380px",
          background: "#fff",
          color: "#000",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
          padding: "16px",
          fontFamily: "monospace",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#b8860b" }}>
            KHADIJA JEWELLERY
          </div>
          <div style={{ fontSize: "12px" }}>Central Plaza Ground Floor</div>
          <div style={{ fontSize: "12px" }}>
            Sales Contact: Fahim Younus — 03212040509
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

        <div style={{ fontSize: "12px", marginBottom: "6px" }}>
          <div>Invoice: <strong>{saleData.invoice_no}</strong></div>
          <div>Date: {saleData.date}</div>
          <div>Customer: {saleData.customer_name || "-"}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #000" }}>
              <th style={{ textAlign: "left" }}>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Disc%</th>
              <th>Amt</th>
            </tr>
          </thead>
          <tbody>
            {saleData.items?.map((it, i) => (
              <tr key={i}>
                <td>{(it.item_name || it.item_code || "").slice(0, 18)}</td>
                <td style={{ textAlign: "center" }}>{it.qty}</td>
                <td style={{ textAlign: "right" }}>{fmt(it.sale_rate)}</td>
                <td style={{ textAlign: "center" }}>{fmt(it.discount_pct)}</td>
                <td style={{ textAlign: "right" }}>{fmt(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

        <div style={{ textAlign: "right", fontWeight: "bold" }}>
          Total: Rs. {fmt(saleData.total)}
        </div>

        <div style={{ textAlign: "center", fontSize: "12px", marginTop: "8px" }}>
          Thank you for your purchase!
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button
            onClick={() => window.print()}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              marginRight: "8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🖨️ Print
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#999",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  );
}
