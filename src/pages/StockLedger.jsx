// ---- FINAL StockLedger.jsx (WITH OPENING BALANCE + AUTO FROM-DATE + DROPDOWN + SEARCH) ----

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function StockLedger({ onNavigate }) {
  const [items, setItems] = useState([]);

  const [itemName, setItemName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [itemId, setItemId] = useState("");

  const [showItemList, setShowItemList] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("2000-01-01");
  const [toDate, setToDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    loadItems();
    loadStartDate();   // ⭐ earliest date from database
  }, []);

  // --------------------------
  // LOAD ALL ITEMS
  // --------------------------
  async function loadItems() {
    const { data } = await supabase.from("items").select("*");
    setItems(data || []);
  }

  // --------------------------
  // LOAD EARLIEST DATE
  // --------------------------
  async function loadStartDate() {
    let dates = [];

    // Earliest Purchase
    const { data: p } = await supabase
      .from("purchases")
      .select("purchase_date")
      .order("purchase_date", { ascending: true })
      .limit(1);
    if (p?.length) dates.push(p[0].purchase_date);

    // Earliest Sale
    const { data: s } = await supabase
      .from("sales")
      .select("sale_date")
      .order("sale_date", { ascending: true })
      .limit(1);
    if (s?.length) dates.push(s[0].sale_date);

    // Earliest Sale Return
    const { data: r } = await supabase
      .from("sale_returns")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1);
    if (r?.length) dates.push(r[0].created_at.slice(0, 10));

    if (dates.length > 0) {
      const earliest = dates.sort()[0];
      setFromDate(earliest);
    }
  }

  // --------------------------
  // MAIN SEARCH FUNCTION
  // --------------------------
  async function handleSearch() {
    let item = null;

    if (itemId) item = items.find((i) => String(i.id) === String(itemId));
    else if (barcode)
      item = items.find((i) => String(i.barcode) === String(barcode));
    else if (itemName)
      item = items.find((i) =>
        i.item_name.toLowerCase().includes(itemName.toLowerCase())
      );

    if (!item) return alert("Item not found!");

    loadLedger(item.id);
  }

  // --------------------------
  // LOAD LEDGER + OPENING BALANCE
  // --------------------------
  async function loadLedger(id) {
    setLoading(true);

    const item = items.find((i) => i.id == id);
    setSelectedItem(item);

    const ledgerRows = [];

    // ----------- OPENING BALANCE CALCULATION -----------
    let opening = 0;

    // Purchase before fromDate
    const { data: prePurch } = await supabase
      .from("purchases")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false)
      .lt("purchase_date", fromDate);

    prePurch?.forEach((p) => {
      opening += Number(p.qty);
    });

    // Sales before fromDate
    const { data: preSales } = await supabase
      .from("sales")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false)
      .lt("sale_date", fromDate);

    preSales?.forEach((s) => {
      opening -= Number(s.qty);
    });

    // Returns before fromDate
    const { data: preReturns } = await supabase
      .from("sale_returns")
      .select("*")
      .eq("barcode", item?.barcode);

    preReturns
      ?.filter((r) => r.created_at.slice(0, 10) < fromDate)
      .forEach((r) => {
        opening += Number(r.return_qty);
      });

    setOpeningBalance(opening);

    // ----------- LOAD MOVEMENT (DATE RANGE) -----------

    // Purchase
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false)
      .gte("purchase_date", fromDate)
      .lte("purchase_date", toDate);

    purchases?.forEach((p) =>
      ledgerRows.push({
        date: p.purchase_date,
        type: "Purchase",
        qty_in: Number(p.qty),
        qty_out: 0,
        invoice: p.invoice_no,
      })
    );

    // Sale
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false)
      .gte("sale_date", fromDate)
      .lte("sale_date", toDate);

    sales?.forEach((s) =>
      ledgerRows.push({
        date: s.sale_date,
        type: "Sale",
        qty_in: 0,
        qty_out: Number(s.qty),
        invoice: s.invoice_no,
      })
    );

    // Sale Return
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("*")
      .eq("barcode", item?.barcode);

    returns
      ?.filter(
        (r) =>
          r.created_at.slice(0, 10) >= fromDate &&
          r.created_at.slice(0, 10) <= toDate
      )
      .forEach((r) =>
        ledgerRows.push({
          date: r.created_at.slice(0, 10),
          type: "Sale Return",
          qty_in: Number(r.return_qty),
          qty_out: 0,
          invoice: r.invoice_no,
        })
      );

    // SORT DATEWISE
    ledgerRows.sort((a, b) => a.date.localeCompare(b.date));

    // FINAL BALANCE
    let balance = opening;
    const finalRows = ledgerRows.map((row) => {
      balance += row.qty_in - row.qty_out;
      return { ...row, balance };
    });

    setLedger(finalRows);
    setLoading(false);
  }

  const filteredItems = items.filter((i) =>
    i.item_name.toLowerCase().includes(itemName.toLowerCase())
  );

  // -------------------------------------------
  // UI START
  // -------------------------------------------

  return (
    <div style={{ padding: 20, color: "#fff", fontFamily: "Inter" }}>
      
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          padding: "6px 12px",
          borderRadius: 6,
          color: "#fff",
          marginBottom: 15,
        }}
      >
        ⬅ Exit
      </button>

      <h2 style={{ color: "#f3c46b" }}>📦 Stock Ledger Report</h2>

      {/* SEARCH FIELDS */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        
        {/* ITEM NAME */}
        <div style={{ position: "relative" }}>
          <label>Item Name</label>
          <br />
          <input
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setShowItemList(true);
            }}
            placeholder="Search name"
            style={{ padding: 6, width: 180 }}
          />

          {showItemList && itemName && (
            <div
              style={{
                background: "#111",
                border: "1px solid #333",
                width: 180,
                maxHeight: 200,
                overflowY: "auto",
                position: "absolute",
                zIndex: 100,
              }}
            >
              {filteredItems.map((i) => (
                <div
                  key={i.id}
                  onClick={() => {
                    setItemName(i.item_name);
                    setBarcode(i.barcode);
                    setItemId(i.id);
                    setShowItemList(false);
                    loadLedger(i.id);
                  }}
                  style={{
                    padding: 6,
                    cursor: "pointer",
                    borderBottom: "1px solid #222",
                  }}
                >
                  {i.item_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BARCODE */}
        <div>
          <label>Barcode</label>
          <br />
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Barcode"
            style={{ padding: 6, width: 150 }}
          />
        </div>

        {/* ITEM ID */}
        <div>
          <label>Item ID</label>
          <br />
          <input
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="ID"
            style={{ padding: 6, width: 100 }}
          />
        </div>

        {/* SEARCH BUTTON */}
        <button
          onClick={handleSearch}
          style={{
            background: "#007bff",
            padding: "8px 15px",
            color: "#fff",
            borderRadius: 6,
            marginTop: 18,
          }}
        >
          🔍 Search
        </button>
      </div>

      {/* DATE FILTER */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>
          <label>From Date</label>
          <br />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ padding: 6 }}
          />
        </div>

        <div>
          <label>To Date</label>
          <br />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ padding: 6 }}
          />
        </div>
      </div>

      {/* LEDGER TABLE */}
      {selectedItem && (
        <div style={{ marginTop: 20 }}>
          <h3>
            Item: <span style={{ color: "#f3c46b" }}>{selectedItem.item_name}</span>
          </h3>
          <h4>Barcode: {selectedItem.barcode}</h4>
          <h4>Item ID: {selectedItem.id}</h4>

          <h3 style={{ color: "orange" }}>
            Opening Balance: {openingBalance}
          </h3>

          {loading ? (
            <p>Loading...</p>
          ) : ledger.length === 0 ? (
            <p>No movement found.</p>
          ) : (
            <table
              style={{
                width: "100%",
                marginTop: 20,
                borderCollapse: "collapse",
                background: "#111",
                color: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#333" }}>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Type</th>
                  <th style={{ padding: 8 }}>Invoice</th>
                  <th style={{ padding: 8 }}>Qty In</th>
                  <th style={{ padding: 8 }}>Qty Out</th>
                  <th style={{ padding: 8 }}>Balance</th>
                </tr>
              </thead>

              <tbody>
                {/* OPENING BALANCE ROW */}
                <tr style={{ background: "#222" }}>
                  <td style={{ padding: 8 }}>—</td>
                  <td style={{ padding: 8 }}>Opening</td>
                  <td style={{ padding: 8 }}>—</td>
                  <td style={{ padding: 8 }}>0</td>
                  <td style={{ padding: 8 }}>0</td>
                  <td style={{ padding: 8, color: "orange" }}>{openingBalance}</td>
                </tr>

                {ledger.map((l, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                    <td style={{ padding: 8 }}>{l.date}</td>
                    <td style={{ padding: 8 }}>{l.type}</td>
                    <td style={{ padding: 8 }}>{l.invoice}</td>
                    <td style={{ padding: 8, color: "lightgreen", textAlign: "center" }}>
                      {l.qty_in}
                    </td>
                    <td style={{ padding: 8, color: "red", textAlign: "center" }}>
                      {l.qty_out}
                    </td>
                    <td style={{ padding: 8, color: "#f3c46b", textAlign: "center" }}>
                      {l.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
