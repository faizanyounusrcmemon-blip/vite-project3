import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function DayWiseSaleReport({ onNavigate }) {
  const [allSales, setAllSales] = useState([]);
  const [months, setMonths] = useState([]);     // list for dropdown
  const [selectedMonth, setSelectedMonth] = useState(""); // "YYYY-MM"
  const [days, setDays] = useState([]);         // date wise totals
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  // ✅ load all non-deleted sales once
  async function loadSales() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sales")
      .select("sale_date, amount, is_deleted")
      .eq("is_deleted", false); // <--- sirf not deleted

    if (error) {
      console.error(error);
      setAllSales([]);
      setMonths([]);
      setLoading(false);
      return;
    }

    const list = data || [];
    setAllSales(list);

    // build unique month list
    const mMap = {};
    list.forEach((r) => {
      if (!r.sale_date) return;
      const monthKey = r.sale_date.slice(0, 7); // YYYY-MM
      if (!mMap[monthKey]) {
        const [year, month] = monthKey.split("-");
        mMap[monthKey] = {
          key: monthKey,
          year,
          month,
        };
      }
    });

    const monthArr = Object.values(mMap).sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    setMonths(monthArr);

    // default: first month selected
    if (monthArr.length > 0) {
      setSelectedMonth(monthArr[0].key);
      buildDayWise(list, monthArr[0].key);
    }

    setLoading(false);
  }

  // build date wise totals for selected month
  function buildDayWise(sourceSales, monthKey) {
    const map = {};

    sourceSales.forEach((r) => {
      if (!r.sale_date) return;
      if (!r.sale_date.startsWith(monthKey)) return; // only that month

      const day = r.sale_date; // full date
      if (!map[day]) {
        map[day] = {
          sale_date: day,
          totalAmount: 0,
        };
      }
      map[day].totalAmount += Number(r.amount || 0);
    });

    const arr = Object.values(map).sort((a, b) =>
      a.sale_date.localeCompare(b.sale_date)
    );

    setDays(arr);
  }

  function handleMonthChange(e) {
    const m = e.target.value;
    setSelectedMonth(m);
    buildDayWise(allSales, m);
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

  const totalMonthSale = days.reduce(
    (s, r) => s + (Number(r.totalAmount) || 0),
    0
  );

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

      <h2 style={{ color: "#f3c46b" }}>📅 Day Wise Sale Report</h2>

      {/* Month selector */}
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Select Month:</label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{ padding: 6, minWidth: 160 }}
        >
          {months.length === 0 && <option value="">No data</option>}
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {monthName(m.month)} {m.year}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : days.length === 0 ? (
        <p>No sale data for this month.</p>
      ) : (
        <div style={{ background: "#111", padding: 10, borderRadius: 6 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "#333", color: "#f3c46b" }}>
                <th style={{ padding: 6 }}>Date</th>
                <th style={{ padding: 6, textAlign: "right" }}>Total Sale</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.sale_date} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 6 }}>{d.sale_date}</td>
                  <td style={{ padding: 6, textAlign: "right" }}>
                    Rs {Number(d.totalAmount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 10, textAlign: "right" }}>
            <b>
              Month Total: Rs {totalMonthSale.toFixed(2)}
            </b>
          </div>
        </div>
      )}
    </div>
  );
}
