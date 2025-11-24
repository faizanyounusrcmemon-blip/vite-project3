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

    // ✅ SALES (only not deleted)
    const { data: sales, error: salesErr } = await supabase
      .from("sales")
      .select("sale_date, amount, is_deleted")
      .eq("is_deleted", false); // <--- yahan filter

    if (salesErr) {
      console.error(salesErr);
      setRows([]);
      setLoading(false);
      return;
    }

    // ✅ PURCHASES (only not deleted)
    const { data: purchases, error: purchErr } = await supabase
      .from("purchases")
      .select("purchase_date, amount, is_deleted")
      .eq("is_deleted", false); // <--- yahan filter

    if (purchErr) {
      console.error(purchErr);
      setRows([]);
      setLoading(false);
      return;
    }

    const map = {};

    // group sales by YYYY-MM
    sales.forEach((s) => {
      if (!s.sale_date) return;
      const monthKey = s.sale_date.slice(0, 7); // YYYY-MM

      if (!map[monthKey]) {
        const [year, month] = monthKey.split("-");
        map[monthKey] = {
          key: monthKey,
          year,
          month,
          totalSale: 0,
          totalPurchase: 0,
        };
      }

      map[monthKey].totalSale += Number(s.amount || 0);
    });

    // group purchases by YYYY-MM
    purchases.forEach((p) => {
      if (!p.purchase_date) return;
      const monthKey = p.purchase_date.slice(0, 7); // YYYY-MM

      if (!map[monthKey]) {
        const [year, month] = monthKey.split("-");
        map[monthKey] = {
          key: monthKey,
          year,
          month,
          totalSale: 0,
          totalPurchase: 0,
        };
      }

      map[monthKey].totalPurchase += Number(p.amount || 0);
    });

    const final = Object.values(map).sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    setRows(final);
    setLoading(false);
  }

  const monthName = (m) => {
    const n = Number(m);
    const names = [
      "",
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return names[n] || m;
  };

  return (
    <div style={{ padding: 16, color: "#fff", fontFamily: "Inter" }}>
      {/* Exit Button */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 5,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        ⬅ Exit
      </button>

      <h2 style={{ color: "#f3c46b" }}>📦 Month Wise Purchase / Sale Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 16,
          }}
        >
          {rows.map((r) => (
            <div
              key={r.key}
              style={{
                background: "#111",
                borderRadius: 8,
                padding: 12,
                minWidth: 180,
                border: "1px solid #333",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 8,
                  fontSize: 16,
                  color: "#f3c46b",
                }}
              >
                {monthName(r.month)} {r.year}
              </div>
              <div>Purchase: <b>Rs {r.totalPurchase.toFixed(2)}</b></div>
              <div>Sale: <b>Rs {r.totalSale.toFixed(2)}</b></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
