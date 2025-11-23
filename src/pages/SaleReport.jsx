import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReport() {
  const [todaySale, setTodaySale] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [todayDiscount, setTodayDiscount] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [records, setRecords] = useState([]);
  const [filteredSale, setFilteredSale] = useState(0);
  const [filteredProfit, setFilteredProfit] = useState(0);
  const [filteredDiscount, setFilteredDiscount] = useState(0);

  useEffect(() => {
    loadTodaySale();
  }, []);

  // ✅ TODAY SUMMARY
  const loadTodaySale = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_date", today)
      .eq("is_deleted", false); // ⭐ FILTER ADDED

    if (!data || data.length === 0) return;

    const invoiceMap = {};

    for (const r of data) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
        };
      }

      // Add sale amount
      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      // Discount amount
      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discountPercent = Number(r.discount || 0);
      const discountAmount = (saleRate * qty * discountPercent) / 100;

      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      // Get item purchase price
      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);

      // Net sale after discount
      const netSale = saleRate - (saleRate * discountPercent) / 100;

      // Profit
      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    let saleSum = 0;
    let profitSum = 0;
    let discountSum = 0;

    Object.values(invoiceMap).forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
    });

    setTodaySale(saleSum);
    setTodayProfit(profitSum);
    setTodayDiscount(discountSum);
  };

  // ✅ DATE FILTER
  const handleFilter = async () => {
    if (!fromDate || !toDate) return alert("Select both dates");

    const { data } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", fromDate)
      .lte("sale_date", toDate)
      .eq("is_deleted", false); // ⭐ FILTER ADDED

    if (!data || data.length === 0) {
      setRecords([]);
      setFilteredSale(0);
      setFilteredProfit(0);
      setFilteredDiscount(0);
      return;
    }

    const invoiceMap = {};

    for (const r of data) {
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
      const netSale = saleRate - saleRate * (discountPercent / 100);

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    const arr = Object.values(invoiceMap);
    setRecords(arr);

    let saleSum = 0;
    let profitSum = 0;
    let discountSum = 0;

    arr.forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
    });

    setFilteredSale(saleSum);
    setFilteredProfit(profitSum);
    setFilteredDiscount(discountSum);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Sales Profit Report</h2>

      {/* TODAY SUMMARY */}
      <div
        style={{
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <h3>Today's Sale: Rs {todaySale.toFixed(2)}</h3>
        <h3 style={{ color: "green" }}>
          Today's Discount: Rs {todayDiscount.toFixed(2)}
        </h3>
        <h3 style={{ color: todayProfit >= 0 ? "blue" : "red" }}>
          Today's Profit: Rs {todayProfit.toFixed(2)}
        </h3>
      </div>

      {/* DATE FILTER */}
      <div
        style={{
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <h3>Date to Date Report</h3>

        <div style={{ display: "flex", gap: 15 }}>
          <div>
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleFilter}
            style={{ background: "blue", color: "white", padding: "6px 12px" }}
          >
            Search
          </button>
        </div>

        <h3>Total Sale: Rs {filteredSale.toFixed(2)}</h3>
        <h3 style={{ color: "green" }}>
          Total Discount: Rs {filteredDiscount.toFixed(2)}
        </h3>
        <h3 style={{ color: filteredProfit >= 0 ? "blue" : "red" }}>
          Total Profit: Rs {filteredProfit.toFixed(2)}
        </h3>
      </div>

      {/* TABLE */}
      {records.length > 0 && (
        <table width="100%" border="1" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Total Amount</th>
              <th>Total Discount</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.sale_date}</td>
                <td>{r.invoice_no}</td>
                <td>Rs {r.totalAmount.toFixed(2)}</td>
                <td style={{ color: "green" }}>
                  Rs {r.totalDiscount.toFixed(2)}
                </td>
                <td style={{ color: r.totalProfit >= 0 ? "blue" : "red" }}>
                  Rs {r.totalProfit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
