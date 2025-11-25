// --- FINAL DayWiseSaleReport.jsx (SALE - RETURN = NET SALE) ---

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function DayWiseSaleReport({ onNavigate }) {
  const [allSales, setAllSales] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalesAndReturns();
  }, []);

  // 🔥 LOAD SALES + RETURNS BOTH
  async function loadSalesAndReturns() {
    setLoading(true);

    // SALES
    const { data: sales } = await supabase
      .from("sales")
      .select("sale_date, amount, is_deleted")
      .eq("is_deleted", false);

    // RETURNS
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("invoice_no, amount, created_at");

    const saleList = sales || [];
    const returnList = returns || [];

    setAllSales(saleList);
    setAllReturns(returnList);

    // month dropdown build
    const mMap = {};
    saleList.forEach((s) => {
      if (!s.sale_date) return;
      const monthKey = s.sale_date.slice(0, 7);
      if (!mMap[monthKey]) {
        const [year, month] = monthKey.split("-");
        mMap[monthKey] = { key: monthKey, year, month };
      }
    });

    const monthArr = Object.values(mMap).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
    setMonths(monthArr);

    if (monthArr.length > 0) {
      setSelectedMonth(monthArr[0].key);
      buildDayWise(saleList, returnList, monthArr[0].key);
    }

    setLoading(false);
  }

  // 🔥 Build Day-wise (SALE, RETURN, NET)
  function buildDayWise(sales, returns, monthKey) {
    const map = {};

    // Collect Sales
    sales.forEach((s) => {
      if (!s.sale_date) return;
      if (!s.sale_date.startsWith(monthKey)) return;

      const day = s.sale_date;

      if (!map[day]) {
        map[day] = {
          sale_date: day,
          totalSale: 0,
          totalReturn: 0,
        };
      }

      map[day].totalSale += Number(s.amount || 0);
    });

    // Collect Returns
    returns.forEach((r) => {
      if (!r.created_at) return;

      const day = r.created_at.slice(0, 10); // YYYY-MM-DD

      if (!day.startsWith(monthKey)) return;

      if (!map[day]) {
        map[day] = {
          sale_date: day,
          totalSale: 0,
          totalReturn: 0,
        };
      }

      map[day].totalReturn += Number(r.amount || 0);
    });

    const arr = Object.values(map).sort((a, b) =>
      a.sale_date.localeCompare(b.sale_date)
    );

    setDays(arr);
  }

  function handleMonthChange(e) {
    const m = e.target.value;
    setSelectedMonth(m);
    buildDayWise(allSales, allReturns, m);
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

  const monthTotalSale = days.reduce((s, d) => s + d.totalSale, 0);
  const monthTotalReturn = days.reduce((s, d) => s + d.totalReturn, 0);
  const monthNet = monthTotalSale - monthTotalReturn;

  return (
    <div style={{ padding: 16, color: "#fff", fontFamily: "Inter" }}>
      
      {/* Exit */}
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

      <h2 style={{ color: "#f3c46b" }}>📅 Day Wise Sale Report</h2>

      {/* Month dropdown */}
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Select Month:</label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{ padding: 6, minWidth: 160 }}
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {monthName(m.month)} {m.year}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ background: "#111", padding: 10, borderRadius: 6 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "#333", color: "#f3c46b" }}>
                <th style={{ padding: 6 }}>Date</th>
                <th style={{ padding: 6, textAlign: "right" }}>Sale Amount</th>
                <th style={{ padding: 6, textAlign: "right" }}>Return Amount</th>
                <th style={{ padding: 6, textAlign: "right" }}>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.sale_date} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 6 }}>{d.sale_date}</td>
                  <td style={{ padding: 6, textAlign: "right" }}>
                    Rs {d.totalSale.toFixed(2)}
                  </td>
                  <td style={{ padding: 6, textAlign: "right", color: "red" }}>
                    Rs {d.totalReturn.toFixed(2)}
                  </td>
                  <td style={{ padding: 6, textAlign: "right", color: "green" }}>
                    Rs {(d.totalSale - d.totalReturn).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer totals */}
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <b>Total Sale: Rs {monthTotalSale.toFixed(2)}</b><br />
            <b style={{ color: "red" }}>Total Return: Rs {monthTotalReturn.toFixed(2)}</b><br />
            <b style={{ color: "lightgreen" }}>Net Sale: Rs {monthNet.toFixed(2)}</b>
          </div>
        </div>
      )}
    </div>
  );
}
