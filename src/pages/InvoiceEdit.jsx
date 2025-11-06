// src/pages/InvoiceEdit.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function InvoiceEdit({ onNavigate }) {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // 🔹 Fetch Invoice Details
  const fetchInvoice = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("invoice_no", invoiceNo)
      .eq("is_deleted", false);

    if (error) console.error(error);
    else setInvoiceData(data || []);
  };

  // 🔹 Lookup Item from "items" table
  const lookupItem = async (key, value) => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .ilike(key, `%${value}%`);

    if (error) console.error(error);
    else setSuggestions(data || []);
  };

  // 🔹 Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      lookupItem("item_name", value);
    } else {
      setSuggestions([]);
    }
  };

  // 🔹 Add selected item
  const handleSelectItem = (item) => {
    const newItem = {
      item_code: item.id,
      item_name: item.item_name,
      barcode: item.barcode,
      category: item.category,
      description: item.description,
      sale_rate: item.sale_price,
      qty: 1,
      amount: item.sale_price,
    };
    setInvoiceData([...invoiceData, newItem]);
    setSuggestions([]);
    setSearchTerm("");
  };

  // 🔹 Handle quantity or rate change
  const updateItemField = (index, field, value) => {
    const updated = [...invoiceData];
    updated[index][field] = value;
    updated[index].amount =
      updated[index].qty * updated[index].sale_rate;
    setInvoiceData(updated);
  };

  // 🔹 Save updated invoice
  const saveInvoice = async () => {
    for (const row of invoiceData) {
      await supabase
        .from("sales")
        .update({
          qty: row.qty,
          sale_rate: row.sale_rate,
          amount: row.amount,
          total_amount: invoiceData.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          ),
        })
        .eq("invoice_no", invoiceNo)
        .eq("item_code", row.item_code);
    }
    alert("Invoice updated successfully!");
  };

  // 🔹 Delete invoice (soft delete)
  const deleteInvoice = async () => {
    await supabase
      .from("sales")
      .update({ is_deleted: true })
      .eq("invoice_no", invoiceNo);
    alert("Invoice deleted (soft delete).");
    onNavigate("sale-detail");
  };

  // 🔹 Reprint invoice (thermal 80mm)
  const reprintInvoice = () => {
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    printWindow.document.write(`
      <html>
        <head><title>Invoice ${invoiceNo}</title></head>
        <body style="font-family: monospace; font-size:12px;">
          <h3>INVOICE #${invoiceNo}</h3>
          <table>
            ${invoiceData
              .map(
                (i) =>
                  `<tr><td>${i.item_name}</td><td>${i.qty}</td><td>${i.sale_rate}</td><td>${i.amount}</td></tr>`
              )
              .join("")}
          </table>
          <hr>
          <p>Total: ${invoiceData.reduce(
            (sum, i) => sum + Number(i.amount || 0),
            0
          )}</p>
        </body>
      </html>
    `);
    printWindow.print();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Edit Invoice</h2>

      <div className="flex gap-2 mb-3">
        <input
          placeholder="Enter Invoice No"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchInvoice} className="bg-blue-500 text-white px-4 py-2 rounded">
          Load Invoice
        </button>
      </div>

      <div className="mb-3">
        <input
          placeholder="Search item by name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 w-full rounded"
        />
        {suggestions.length > 0 && (
          <ul className="border mt-1 bg-white shadow">
            {suggestions.map((s) => (
              <li
                key={s.id}
                onClick={() => handleSelectItem(s)}
                className="p-2 hover:bg-gray-200 cursor-pointer"
              >
                {s.item_name} ({s.barcode})
              </li>
            ))}
          </ul>
        )}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.map((row, i) => (
            <tr key={i}>
              <td>{row.item_name}</td>
              <td>
                <input
                  type="number"
                  value={row.sale_rate}
                  onChange={(e) => updateItemField(i, "sale_rate", e.target.value)}
                  className="border w-16 p-1"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) => updateItemField(i, "qty", e.target.value)}
                  className="border w-16 p-1"
                />
              </td>
              <td>{row.amount}</td>
              <td>
                <button
                  onClick={() =>
                    setInvoiceData(invoiceData.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        <button onClick={saveInvoice} className="bg-green-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
        <button onClick={reprintInvoice} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Reprint
        </button>
        <button onClick={deleteInvoice} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete Invoice
        </button>
      </div>
    </div>
  );
}
