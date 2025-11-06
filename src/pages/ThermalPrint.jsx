// src/pages/ThermalPrint.jsx
import React, { useEffect } from "react";

export default function ThermalPrint({ data, onClose }) {
  useEffect(() => {
    setTimeout(() => {
      window.print();
      onClose();
    }, 1000);
  }, [onClose]);

  if (!data) return null;

  const { invoiceNo, saleDate, customerName, customerPhone, entries, total } = data;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff", // white background only
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          width: "80mm",
          background: "#fff",
          padding: "10px",
          border: "1px dashed #000",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "5px" }}>
          <h2 style={{ margin: 0, fontSize: "16px" }}>💎 Khadija Jewelry 💎</h2>
          <p style={{ margin: 0, fontSize: "11px" }}>Central Plaza Ground Floor</p>
          <p style={{ margin: 0, fontSize: "11px" }}>
            Contact: Fahim Younus – 03212040509
          </p>
        </div>

        <hr />
        <div style={{ textAlign: "center" }}>
          <h4 style={{ margin: "5px 0" }}>🧾 SALES RECEIPT</h4>
          <p style={{ margin: 0 }}>Invoice No: {invoiceNo}</p>
          <p style={{ margin: 0 }}>Date: {saleDate}</p>
        </div>

        <hr />
        <p style={{ margin: 0 }}>
          Customer: <strong>{customerName || "Walk-in Customer"}</strong>
        </p>
        <p style={{ margin: 0 }}>Phone: {customerPhone || "-"}</p>
        <hr />

        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #000" }}>
              <th align="left">Item</th>
              <th align="right">Qty</th>
              <th align="right">Rate</th>
              <th align="right">Disc%</th>
              <th align="right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td>{e.itemName}</td>
                <td align="right">{e.qty}</td>
                <td align="right">{Number(e.saleRate).toFixed(2)}</td>
                <td align="right">{e.discount || 0}</td>
                <td align="right">{Number(e.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "2px 0" }}>
            <strong>Total:</strong> Rs. {Number(total).toFixed(2)}
          </p>
        </div>

        <hr />
        <div style={{ textAlign: "center", fontSize: "11px" }}>
          <p style={{ margin: "5px 0" }}>Thank you for shopping with us!</p>
        </div>
      </div>
    </div>
  );
}
