// ---- StockLedger.jsx (UPDATED WITH ITEM SEARCH DROPDOWN) ----

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  // LOAD ALL ITEMS
  async function loadItems() {
    const { data } = await supabase.from("items").select("*");
    setItems(data || []);
  }

  // -----------------------------
  // MAIN SEARCH FUNCTION
  // -----------------------------
  async function handleSearch() {
    let item = null;

    if (itemId) {
      item = items.find((i) => String(i.id) === String(itemId));
    } else if (barcode) {
      item = items.find((i) => String(i.barcode) === String(barcode));
    } else if (itemName) {
      item = items.find((i) =>
        i.item_name.toLowerCase().includes(itemName.toLowerCase())
      );
    }

    if (!item) {
      alert("Item not found!");
      return;
    }

    loadLedger(item.id);
  }

  // -----------------------------
  // LOAD LEDGER DATA
  // -----------------------------
  async function loadLedger(id) {
    setLoading(true);

    const item = items.find((i) => i.id == id);
    setSelectedItem(item);

    const ledgerRows = [];

    // PURCHASE
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false);

    purchases?.forEach((p) => {
      ledgerRows.push({
        date: p.purchase_date,
        type: "Purchase",
        qty_in: Number(p.qty),
        qty_out: 0,
        invoice: p.invoice_no,
      });
    });

    // SALE
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("item_code", id)
      .eq("is_deleted", false);

    sales?.forEach((s) => {
      ledgerRows.push({
        date: s.sale_date,
        type: "Sale",
        qty_in: 0,
        qty_out: Number(s.qty),
        invoice: s.invoice_no,
      });
    });

    // SALE RETURN
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("*")
      .eq("barcode", item?.barcode);

    returns?.forEach((r) => {
      ledgerRows.push({
        date: r.created_at.slice(0, 10),
        type: "Sale Return",
        qty_in: Number(r.return_qty),
        qty_out: 0,
        invoice: r.invoice_no,
      });
    });

    // SORT DATEWISE
    ledgerRows.sort((a, b) => a.date.localeCompare(b.date));

    // RUNNING BALANCE
    let balance = 0;
    const finalRows = ledgerRows.map((row) => {
      balance += row.qty_in - row.qty_out;
      return { ...row, balance };
    });

    setLedger(finalRows);
    setLoading(false);
  }

  // FILTERED ITEM LIST FOR DROPDOWN
  const filteredItems = items.filter((i) =>
    i.item_name.toLowerCase().includes(itemName.toLowerCase())
  );

  return (
    <div style={{ padding: 20, color: "#fff", fontFamily: "Inter" }}>
      
      {/* EXIT */}
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

      {/* SEARCH BOXES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: 20,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* ITEM NAME BOX */}
        <div style={{ position: "relative" }}>
          <label>Item Name</label>
          <br />
          <input
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setShowItemList(true);
            }}
            onFocus={() => setShowItemList(true)}
            placeholder="Search name"
            style={{ padding: 6, width: 180 }}
          />

          {/* AUTO DROPDOWN */}
          {showItemList && itemName.length > 0 && (
            <div
              style={{
                background: "#111",
                border: "1px solid #333",
                position: "absolute",
                width: 180,
                maxHeight: 200,
                overflowY: "auto",
                zIndex: 50,
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

              {filteredItems.length === 0 && (
                <div style={{ padding: 6 }}>No item found</div>
              )}
            </div>
          )}
        </div>

        {/* BARCODE BOX */}
        <div>
          <label>Barcode</label>
          <br />
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode"
            style={{ padding: 6, width: 150 }}
          />
        </div>

        {/* ID BOX */}
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

      {/* LEDGER TABLE */}
      {selectedItem && (
        <div style={{ marginTop: 20 }}>
          <h3>
            Item:{" "}
            <span style={{ color: "#f3c46b" }}>{selectedItem.item_name}</span>
          </h3>
          <h4>Barcode: {selectedItem.barcode}</h4>
          <h4>Item ID: {selectedItem.id}</h4>

          {loading ? (
            <p>Loading...</p>
          ) : ledger.length === 0 ? (
            <p>No movement found for this item.</p>
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
