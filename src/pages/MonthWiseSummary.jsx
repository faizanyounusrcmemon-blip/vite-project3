// --- FINAL MonthWiseSummary.jsx (BOX LAYOUT + SALE-RETURN + PURCHASE + NET SALE) ---

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function MonthWiseSummary({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // SALES
    const { data: sales } = await supabase
      .from("sales")
      .select("sale_date, amount, is_deleted")
      .eq("is_deleted", false);

    // PURCHASES
    const { data: purchases } = await supabase
      .from("purchases")
      .select("purchase_date, amount, is_deleted")
      .eq("is_deleted", false);

    // RETURNS
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("amount, created_at");

    const returnMap = {};
    returns?.forEach((r) => {
      const m = r.created_at.slice(0, 7);
      returnMap[m] = (returnMap[m] || 0) + Number(r.amount);
    });

    const map = {};

    // group sales
    sales?.forEach((s) => {
      const m = s.sale_date.slice(0, 7);
      if (!map[m]) {
        const [year, month] = m.split("-");
        map[m] = {
          key: m,
          year,
          month,
          totalSale: 0,
          totalPurchase: 0,
          totalReturn: 0,
        };
      }
      map[m].totalSale += Number(s.amount);
    });

    // group purchases
    purchases?.forEach((p) => {
      const m = p.purchase_date.slice(0, 7);
      if (!map[m]) {
        const [year, month] = m.split("-");
        map[m] = {
          key: m,
          year,
          month,
          totalSale: 0,
          totalPurchase: 0,
          totalReturn: 0,
        };
      }
      map[m].totalPurchase += Number(p.amount);
    });

    // add returns
    Object.keys(returnMap).forEach((m) => {
      if (!map[m]) {
        const [year, month] = m.split("-");
        map[m] = {
          key: m,
          year,
          month,
          totalSale: 0,
          totalPurchase: 0,
          totalReturn: 0,
        };
      }
      map[m].totalReturn = returnMap[m];
    });

    setRows(Object.values(map).sort((a, b) => a.key.localeCompare(b.key)));
    setLoading(false);
  }

  const monthName = (m) => {
    const n = Number(m);
    const names = [
      "",
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];
    return names[n] || m;
  };

  return (
    <div style={{ padding: 16, color: "#fff", fontFamily: "Inter" }}>
      {/* EXIT */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 5,
          marginBottom: 12,
        }}
      >
        ⬅ Exit
      </button>

      <h2 style={{ color: "#f3c46b" }}>📦 Month Wise Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 16,
          }}
        >
          {rows.map((r) => {
            const netSale = r.totalSale - r.totalReturn;

            return (
              <div
                key={r.key}
                style={{
                  background: "#111",
                  borderRadius: 8,
                  padding: 16,
                  minWidth: 200,
                  border: "1px solid #333",
                  boxShadow: "0 0 8px rgba(0,0,0,0.4)",
                }}
              >
                {/* MONTH TITLE */}
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 10,
                    fontSize: 18,
                    color: "#f3c46b",
                  }}
                >
                  {monthName(r.month)} {r.year}
                </div>

                {/* PURCHASE */}
                <div style={{ marginBottom: 6 }}>
                  Purchase:
                  <b style={{ float: "right" }}>
                    Rs {r.totalPurchase.toFixed(2)}
                  </b>
                </div>

                {/* SALE */}
                <div style={{ marginBottom: 6 }}>
                  Sale:
                  <b style={{ float: "right" }}>
                    Rs {r.totalSale.toFixed(2)}
                  </b>
                </div>

                {/* RETURN */}
                <div style={{ marginBottom: 6, color: "red" }}>
                  Return:
                  <b style={{ float: "right" }}>
                    Rs {r.totalReturn.toFixed(2)}
                  </b>
                </div>

                {/* NET SALE */}
                <div style={{ marginTop: 10, color: "lightgreen" }}>
                  Net Sale:
                  <b style={{ float: "right" }}>
                    Rs {netSale.toFixed(2)}
                  </b>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
