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
    // ⭐ GET ONLY NON-DELETED SALES
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("is_deleted", false);

    if (!sales) return;

    const map = {};

    for (const r of sales) {
      const month = r.sale_date.slice(0, 7); // YYYY-MM

      if (!map[month]) {
        map[month] = {
          month,
          totalSale: 0,
          totalProfit: 0,
        };
      }

      // Add sale amount
      map[month].totalSale += Number(r.amount);

      // Get item purchase price
      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discount = Number(r.discount || 0);

      // Net sale after discount
      const netSale = saleRate - saleRate * (discount / 100);

      // Add profit
      map[month].totalProfit += (netSale - purchase) * qty;
    }

    const arr = Object.values(map).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    setData(arr);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Monthly Sales & Profit Chart</h2>

      <div style={{ height: 350, marginTop: 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="totalSale" fill="#4CAF50" name="Total Sale" />
            <Bar dataKey="totalProfit" fill="#2196F3" name="Total Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ marginTop: 40 }}>📈 Profit Line Chart</h3>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="totalSale"
              stroke="#4CAF50"
              name="Total Sale"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="totalProfit"
              stroke="#FF5722"
              name="Total Profit"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
