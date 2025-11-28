// src/pages/PurchaseDetail.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseDetail({ onNavigate }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = new Date();
    const f = new Date();
    f.setDate(t.getDate() - 365);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (from && to) load();
  }, [from, to, search]);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, invoice_no, company_name, purchase_date, amount")
        .eq("is_deleted", false)           // ⭐ Only non-deleted entries
        .gte("purchase_date", from)
        .lte("purchase_date", to)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      const grouped = Object.values(
        data.reduce((acc, row) => {
          if (!acc[row.invoice_no]) {
            acc[row.invoice_no] = {
              id: row.id,
              invoice_no: row.invoice_no,
              company_name: row.company_name,
              purchase_date: row.purchase_date,
              total: 0
            };
          }
          acc[row.invoice_no].total += Number(row.amount || 0);
          return acc;
        }, {})
      );

      const q = search.toLowerCase();
      const filtered = grouped.filter(
        r =>
          (r.invoice_no || "").toLowerCase().includes(q) ||
          (r.company_name || "").toLowerCase().includes(q)
      );

      setRows(filtered);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error loading purchases");
    } finally {
      setLoading(false);
    }
  }

  const totalAll = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);

  const handleExit = () => onNavigate("dashboard");

  // ⭐ EDIT FUNCTION
  const editInvoice = (invoice) => {
    sessionStorage.setItem("purchaseEditInvoice", invoice);
    onNavigate("purchase-edit");
  };

  // ⭐ SOFT DELETE FUNCTION (with password)
  const softDelete = async (invoiceNo) => {
    const p = prompt("Enter delete password:");
    if (!p) return;
    if (p !== "5050") return alert("❌ Incorrect Password!");

    const ok = confirm("Soft delete this purchase?");
    if (!ok) return;

    await supabase
      .from("purchases")
      .update({ is_deleted: true })
      .eq("invoice_no", invoiceNo);

    alert("🗑 Soft Deleted!");
    load();
  };

  return (
    <div style={{ padding: 16, fontFamily: "Inter, system-ui, sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, marginBottom: 12, color: "#f3c46b" }}>Purchase Detail</h2>
        <button
          onClick={handleExit}
          style={{
            background: "#c33",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            border: "none"
          }}
        >
          Exit
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <label>From</label><br />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label>To</label><br />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Search Invoice / Company</label><br />
          <input
            style={{ width: "100%" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or company..."
          />
        </div>
        <button
          onClick={load}
          style={{ background: "#f3c46b", padding: "8px 12px", borderRadius: 8 }}
        >
          Refresh
        </button>
      </div>

      {/* List */}
      <div style={{ background: "#111", padding: 12, borderRadius: 8 }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #333" }}>
                  <th>Invoice</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th>Copy</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.invoice_no} style={{ borderBottom: "1px solid #222" }}>
                    <td>{r.invoice_no}</td>
                    <td>{r.company_name}</td>
                    <td>{r.purchase_date}</td>
                    <td style={{ textAlign: "right" }}>{Number(r.total).toFixed(2)}</td>

                    {/* Copy Button */}
                    <td>
                      <button
                        onClick={() => navigator.clipboard.writeText(r.invoice_no)}
                        style={{
                          background: "#444",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          border: "none"
                        }}
                      >
                        Copy
                      </button>
                    </td>

                    {/* ⭐ EDIT BUTTON */}
                    <td>
                      <button
                        onClick={() => editInvoice(r.invoice_no)}
                        style={{
                          background: "#0d6efd",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          border: "none"
                        }}
                      >
                        Edit
                      </button>
                    </td>

                    {/* ⭐ SOFT DELETE BUTTON */}
                    <td>
                      <button
                        onClick={() => softDelete(r.invoice_no)}
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          border: "none"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 8 }}>
                      No purchases found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
              <strong>Total Purchases: Rs. {totalAll.toFixed(2)}</strong>
              <button
                onClick={() => window.print()}
                style={{ background: "#333", padding: "6px 10px", borderRadius: 6 }}
              >
                Print
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
