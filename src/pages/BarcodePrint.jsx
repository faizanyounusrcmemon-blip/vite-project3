// src/pages/BarcodePrint.jsx
import React, { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodePrint() {
  const barcode = localStorage.getItem("print_barcode");
  const name = localStorage.getItem("print_name");
  const price = localStorage.getItem("print_price");
  const qty = Number(localStorage.getItem("print_qty") || 1);

  const labels = Array.from({ length: qty });

  const canvasRefs = useRef([]);

  useEffect(() => {
    labels.forEach((_, i) => {
      if (canvasRefs.current[i]) {
        JsBarcode(canvasRefs.current[i], barcode, {
          format: "CODE39",
          width: 2,
          height: 60,
          displayValue: false,
        });
      }
    });

    setTimeout(() => window.print(), 600);
  }, []);

  return (
    <div
      style={{
        background: "white",
        width: "80mm",
        padding: 0,
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <style>
        {`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { width: 80mm; margin: 0; padding: 0; }
          button { display: none; }
        }
      `}
      </style>

      <div id="print-area">
        {labels.map((_, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              marginBottom: "4px",
              padding: "2px 0",
              borderBottom: "1px dashed black"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>{name}</div>

            <canvas
              ref={(el) => (canvasRefs.current[i] = el)}
              style={{ width: "100%" }}
            />

            <div style={{ fontSize: "10px" }}>{barcode}</div>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>
              Rs {price}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.close()}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
          background: "#e6c34d",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
}
