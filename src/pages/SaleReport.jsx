// --- FINAL SaleReport.jsx (TODAY SALE - RETURN + DATE RANGE RETURN) ---

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReport() {
  const [todaySale, setTodaySale] = useState(0);
  const [todayReturn, setTodayReturn] = useState(0);
  const [todayNet, setTodayNet] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [records, setRecords] = useState([]);
  const [filteredSale, setFilteredSale] = useState(0);
  const [filteredReturn, setFilteredReturn] = useState(0);
  const [filteredNet, setFilteredNet] = useState(0);

  useEffect(() => {
    loadToday();
  }, []);

  // TODAY REPORT
  const loadToday = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_date", today)
      .eq("is_deleted", false);

    const { data: returns } = await supabase
      .from("sale_returns")
      .select("amount, created_at");

    let saleSum = 0;
    let returnSum = 0;

    sales?.forEach((s) => (saleSum += Number(s.amount)));
    returns
      ?.filter((r) => r.created_at.slice(0, 10) === today)
      .forEach((r) => (returnSum += Number(r.amount)));

    setTodaySale(saleSum);
    setTodayReturn(returnSum);
    setTodayNet(saleSum - returnSum);
  };

  // DATE FILTER REPORT
  const handleFilter = async () => {
    if (!fromDate || !toDate) return alert("Select dates");

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", fromDate)
      .lte("sale_date", toDate)
      .eq("is_deleted", false);

    const { data: returns } = await supabase
      .from("sale_returns")
      .select("amount, created_at");

    let saleSum = 0;
    let returnSum = 0;

    sales?.forEach((s) => (saleSum += Number(s.amount)));

    returns
      ?.filter(
        (r) =>
          r.created_at.slice(0, 10) >= fromDate &&
          r.created_at.slice(0, 10) <= toDate
      )
      .forEach((r) => (returnSum += Number(r.amount)));

    setFilteredSale(saleSum);
    setFilteredReturn(returnSum);
    setFilteredNet(saleSum - returnSum);

    setRecords(sales);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Sales - Return Report</h2>

      {/* TODAY SUMMARY */}
      <div style={{ padding: 15, border: "1px solid #ccc", borderRadius: 6 }}>
        <h3>Today's Sale: Rs {todaySale.toFixed(2)}</h3>
        <h3 style={{ color: "red" }}>Today's Return: Rs {todayReturn.toFixed(2)}</h3>
        <h3 style={{ color: "green" }}>Net Sale: Rs {todayNet.toFixed(2)}</h3>
      </div>

      {/* DATE FILTER */}
      <div
        style={{
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 6,
          marginTop: 20,
        }}
      >
        <h3>Date-to-Date Report</h3>

        <div style={{ display: "flex", gap: 15 }}>
          <div>
            <label>From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div>
            <label>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <button
            onClick={handleFilter}
            style={{ background: "blue", color: "white", padding: "6px 12px" }}
          >
            Search
          </button>
        </div>

        <h3>Total Sale: Rs {filteredSale.toFixed(2)}</h3>
        <h3 style={{ color: "red" }}>Total Return: Rs {filteredReturn.toFixed(2)}</h3>
        <h3 style={{ color: "green" }}>Net Sale: Rs {filteredNet.toFixed(2)}</h3>
      </div>

      {/* TABLE */}
      {records.length > 0 && (
        <table width="100%" border="1" style={{ marginTop: 20 }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.sale_date}</td>
                <td>{r.invoice_no}</td>
                <td>Rs {Number(r.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
