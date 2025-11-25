// --- FINAL MonthlyReport.jsx (SALE - RETURN + PROFIT ADJUSTED) ---

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    // SALES
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("is_deleted", false);

    // RETURNS
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("amount, created_at");

    const returnMap = {};
    returns?.forEach((r) => {
      const m = r.created_at.slice(0, 7);
      returnMap[m] = (returnMap[m] || 0) + Number(r.amount || 0);
    });

    // Combined month data
    const map = {};

    for (const r of sales) {
      const month = r.sale_date.slice(0, 7);
      if (!map[month]) {
        map[month] = {
          month,
          totalSale: 0,
          totalReturn: 0,
          totalNet: 0,
          totalProfit: 0,
        };
      }

      map[month].totalSale += Number(r.amount || 0);
    }

    // Add Returns
    Object.keys(returnMap).forEach((m) => {
      if (!map[m]) {
        map[m] = {
          month: m,
          totalSale: 0,
          totalReturn: 0,
          totalNet: 0,
          totalProfit: 0,
        };
      }

      map[m].totalReturn = returnMap[m];
    });

    // PROFIT Calculation
    for (const r of sales) {
      const m = r.sale_date.slice(0, 7);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discountPercent = Number(r.discount || 0);
      const discountAmount = (saleRate * qty * discountPercent) / 100;

      // Purchase Rate
      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSaleRate = saleRate - discountAmount / qty;

      map[m].totalProfit += (netSaleRate - purchase) * qty;
    }

    // NET = SALE - RETURN
    Object.values(map).forEach((m) => {
      m.totalNet = m.totalSale - m.totalReturn;
    });

    setData(Object.values(map).sort((a, b) => a.month.localeCompare(b.month)));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Monthly Sales, Return & Profit Chart</h2>

      {/* BAR CHART */}
      <div style={{ height: 350, marginTop: 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="totalSale" fill="#4CAF50" name="Sale" />
            <Bar dataKey="totalReturn" fill="#E53935" name="Return" />
            <Bar dataKey="totalNet" fill="#FFC107" name="Net Sale" />
            <Bar dataKey="totalProfit" fill="#2196F3" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PROFIT LINE CHART */}
      <h3 style={{ marginTop: 40 }}>📈 Profit Line Chart</h3>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="totalNet" stroke="#FFC107" name="Net Sale" />
            <Line type="monotone" dataKey="totalProfit" stroke="#FF5722" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
