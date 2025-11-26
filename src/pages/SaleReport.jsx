// --- FINAL SaleReport.jsx (SALE + DISCOUNT + PROFIT + RETURN ALL FIXED) ---

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReport() {
  const [todaySale, setTodaySale] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [todayDiscount, setTodayDiscount] = useState(0);
  const [todayReturn, setTodayReturn] = useState(0);
  const [todayNet, setTodayNet] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [records, setRecords] = useState([]);
  const [filteredSale, setFilteredSale] = useState(0);
  const [filteredProfit, setFilteredProfit] = useState(0);
  const [filteredDiscount, setFilteredDiscount] = useState(0);
  const [filteredReturn, setFilteredReturn] = useState(0);
  const [filteredNet, setFilteredNet] = useState(0);

  useEffect(() => {
    loadToday();
  }, []);

  // ⭐ TODAY REPORT
  const loadToday = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_date", today)
      .eq("is_deleted", false);

    const { data: returns } = await supabase
      .from("sale_returns")
      .select("*");

    if (!sales || sales.length === 0) return;

    const invoiceMap = {};

    for (const r of sales) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discPercent) / 100;
      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSale = saleRate - (saleRate * discPercent) / 100;

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    let saleSum = 0,
      profitSum = 0,
      discountSum = 0,
      returnSum = 0;

    Object.values(invoiceMap).forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
    });

    // TODAY RETURN SUM
    returns
      ?.filter((r) => r.created_at.slice(0, 10) === today)
      .forEach((r) => (returnSum += Number(r.amount)));

    setTodaySale(saleSum);
    setTodayProfit(profitSum);
    setTodayDiscount(discountSum);
    setTodayReturn(returnSum);
    setTodayNet(saleSum - discountSum - returnSum + profitSum);
  };

  // ⭐ DATE RANGE REPORT
  const handleFilter = async () => {
    if (!fromDate || !toDate) return alert("Please select dates");

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", fromDate)
      .lte("sale_date", toDate)
      .eq("is_deleted", false);

    const { data: returns } = await supabase
      .from("sale_returns")
      .select("*");

    if (!sales || sales.length === 0) {
      setRecords([]);
      return;
    }

    const invoiceMap = {};

    for (const r of sales) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          invoice_no: r.invoice_no,
          sale_date: r.sale_date,
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
          totalReturn: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discPercent) / 100;
      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSale = saleRate - (saleRate * discPercent) / 100;

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    // ⭐ RETURN ADD
    returns
      ?.filter(
        (r) =>
          r.created_at.slice(0, 10) >= fromDate &&
          r.created_at.slice(0, 10) <= toDate
      )
      .forEach((r) => {
        if (invoiceMap[r.invoice_no]) {
          invoiceMap[r.invoice_no].totalReturn += Number(r.amount);
        }
      });

    const arr = Object.values(invoiceMap);
    setRecords(arr);

    let saleSum = 0,
      profitSum = 0,
      discountSum = 0,
      returnSum = 0;

    arr.forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
      returnSum += v.totalReturn;
    });

    setFilteredSale(saleSum);
    setFilteredProfit(profitSum);
    setFilteredDiscount(discountSum);
    setFilteredReturn(returnSum);
    setFilteredNet(saleSum - discountSum - returnSum + profitSum);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Sales / Discount / Profit / Return Report</h2>

      {/* TODAY SUMMARY */}
      <div style={{ padding: 15, border: "1px solid #ccc", borderRadius: 6 }}>
        <h3>Today's Sale: Rs {todaySale.toFixed(2)}</h3>
        <h3 style={{ color: "green" }}>
          Today's Discount: Rs {todayDiscount.toFixed(2)}
        </h3>
        <h3 style={{ color: "blue" }}>
          Today's Profit: Rs {todayProfit.toFixed(2)}
        </h3>
        <h3 style={{ color: "red" }}>
          Today's Return: Rs {todayReturn.toFixed(2)}
        </h3>

        <h3 style={{ color: "purple" }}>
          Net Sale: Rs {todayNet.toFixed(2)}
        </h3>
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
        <h3 style={{ color: "blue" }}>
          Total Profit: Rs {filteredProfit.toFixed(2)}
        </h3>
        <h3 style={{ color: "red" }}>
          Total Return: Rs {filteredReturn.toFixed(2)}
        </h3>

        <h3 style={{ color: "purple" }}>
          Net Sale: Rs {filteredNet.toFixed(2)}
        </h3>
      </div>

      {/* TABLE */}
      {records.length > 0 && (
        <table width="100%" border="1" style={{ marginTop: 20 }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Date</th>
              <th>Invoice</th>
              <th>Sale</th>
              <th>Discount</th>
              <th>Profit</th>
              <th>Return</th>
              <th>Net</th>
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
                <td style={{ color: "blue" }}>
                  Rs {r.totalProfit.toFixed(2)}
                </td>
                <td style={{ color: "red" }}>
                  Rs {r.totalReturn.toFixed(2)}
                </td>
                <td style={{ color: "purple" }}>
                  Rs {(r.totalAmount - r.totalDiscount - r.totalReturn + r.totalProfit).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
