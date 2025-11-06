// src/pages/PurchaseEntry.jsx
import React, { useEffect, useState, useRef } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseEntry({ onNavigate }) {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [barcode, setBarcode] = useState("");
  const [qty, setQty] = useState("");
  const [amount, setAmount] = useState(0);

  const [itemList, setItemList] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);

  const f1 = useRef(), f2 = useRef(), f3 = useRef(), f4 = useRef(), f5 = useRef(), f6 = useRef(), f7 = useRef(), f8 = useRef();

  useEffect(() => {
    f1.current?.focus();
    (async () => {
      const { data } = await supabase.from("items")
        .select("id,barcode,item_name,purchase_price,sale_price");
      setItemList(data || []);
    })();
  }, []);

  useEffect(() => {
    const r = parseFloat(purchaseRate || 0);
    const q = parseFloat(qty || 0);
    setAmount(r * q || 0);
  }, [purchaseRate, qty]);

  useEffect(() => {
    if (!itemCode) return;
    const code = String(itemCode).toLowerCase(); // ✅ Fix lower-case error

    const it = itemList.find(
      i =>
        String(i.barcode).toLowerCase() === code ||
        String(i.id).toLowerCase() === code ||
        String(i.item_name).toLowerCase() === code
    );

    if (it) {
      setItemName(it.item_name);
      setPurchaseRate(it.purchase_price);
      setSaleRate(it.sale_price);
      setBarcode(it.barcode);
    }
  }, [itemCode, itemList]);

  const handlePick = (it, e) => {
    e.preventDefault(); // ✅ Stops blur / screen hide
    setItemCode(it.barcode);
    setItemName(it.item_name);
    setPurchaseRate(it.purchase_price);
    setSaleRate(it.sale_price);
    setBarcode(it.barcode);
    setSearchOpen(false);
    f6.current?.focus();
  };

  const handleAdd = () => {
    if (!itemName || !qty) return alert("Enter item & qty");

    setEntries(prev => [
      ...prev,
      {
        invoiceNo,
        companyName,
        purchaseDate,
        itemCode,
        itemName,
        purchaseRate: Number(purchaseRate),
        saleRate: Number(saleRate),
        qty: Number(qty),
        amount,
        barcode
      }
    ]);

    setItemCode("");
    setItemName("");
    setPurchaseRate("");
    setSaleRate("");
    setQty("");
    setBarcode("");
    setAmount(0);

    setSearchOpen(false);
    f4.current?.focus(); // ✅ safe focus
  };

  const handleDelete = (i) => {
    setEntries(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!entries.length) return alert("No items");

    setLoadingSave(true);
    await supabase.from("purchases").insert(
      entries.map(e => ({
        invoice_no: invoiceNo,
        company_name: companyName,
        purchase_date: e.purchaseDate,
        item_code: e.itemCode,
        item_name: e.itemName,
        purchase_rate: e.purchaseRate,
        sale_price: e.saleRate,
        qty: e.qty,
        amount: e.amount,
        barcode: e.barcode,
        created_at: new Date().toISOString(),
      }))
    );

    alert("Saved ✅");
    setEntries([]);
    setLoadingSave(false);
    f4.current?.focus();
  };

  const handleExit = () => onNavigate && onNavigate("dashboard");

  return (
    <div style={{ padding: 18 }}>
      <h2 style={{ textAlign: "center" }}>Purchase Entry</h2>

      {/* Invoice Row */}
      <div style={{ display:"flex", gap:12, marginBottom:12 }}>
        <div>
          <label>Invoice</label><br />
          <input ref={f1} value={invoiceNo}
            onChange={e=>setInvoiceNo(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f2.current?.focus()}
          />
        </div>

        <div>
          <label>Company</label><br />
          <input ref={f2} value={companyName}
            onChange={e=>setCompanyName(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f3.current?.focus()}
          />
        </div>

        <div>
          <label>Date</label><br />
          <input type="date" ref={f3} value={purchaseDate}
            onChange={e=>setPurchaseDate(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f4.current?.focus()}
          />
        </div>
      </div>

      {/* Entry Row */}
      <div style={{ display:"flex", gap:10, border:"1px solid #ccc", padding:10 }}>
        
        <div>
          <label>Code</label><br />
          <input ref={f4} value={itemCode}
            onChange={e=>setItemCode(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f5.current?.focus()}
            style={{ width:80 }}
          />
        </div>

        <div style={{ position:"relative" }}>
          <label>Item</label><br />
          <input ref={f5} value={itemName}
            onChange={e=>{ setItemName(e.target.value); setSearchOpen(true); }}
            onKeyDown={e=>e.key==="Enter" && f6.current?.focus()}
            style={{ width:220 }}
          />

          {searchOpen && itemName && (
            <div style={{
              position:"absolute", background:"#fff",
              border:"1px solid #aaa", width:"100%",
              maxHeight:200, overflowY:"auto", zIndex:999
            }}>
              {itemList.filter(i=>i.item_name.toLowerCase().includes(itemName.toLowerCase()))
                .slice(0,30).map(it=>(
                  <div key={it.id}
                    style={{ padding:6, cursor:"pointer" }}
                    onMouseDown={(e)=>handlePick(it,e)}
                  >
                    {it.item_name} — {it.barcode}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div>
          <label>P Rate</label><br />
          <input ref={f6} type="number" value={purchaseRate}
            onChange={e=>setPurchaseRate(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f7.current?.focus()}
            style={{ width:80 }}
          />
        </div>

        <div>
          <label>S Rate</label><br />
          <input ref={f7} type="number" value={saleRate}
            onChange={e=>setSaleRate(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && f8.current?.focus()}
            style={{ width:80 }}
          />
        </div>

        <div>
          <label>Qty</label><br />
          <input ref={f8} type="number" value={qty}
            onChange={e=>setQty(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && handleAdd()}
            style={{ width:60 }}
          />
        </div>

        <div>
          <label>Amount</label><br />
          <input value={amount} readOnly style={{ width:90 }} />
        </div>

        <div>
          <label>Barcode</label><br />
          <input value={barcode} readOnly style={{ width:120 }} />
        </div>

        <button style={{ height:32, marginTop:20 }} onClick={handleAdd}>
          Add
        </button>
      </div>

      {/* Table */}
      <table border="1" width="100%" style={{ marginTop:15 }}>
        <thead><tr>
          <th>#</th><th>Code</th><th>Name</th><th>PR</th><th>SR</th><th>Qty</th><th>Amt</th><th>BC</th><th>Action</th>
        </tr></thead>
        <tbody>
          {entries.map((r,i)=>(
            <tr key={i}>
              <td>{i+1}</td><td>{r.itemCode}</td><td>{r.itemName}</td>
              <td>{r.purchaseRate}</td><td>{r.saleRate}</td>
              <td>{r.qty}</td><td>{r.amount}</td><td>{r.barcode}</td>
              <td><button style={{background:"red",color:"#fff"}} onClick={()=>handleDelete(i)}>Remove</button></td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr><td colSpan="9" style={{ textAlign:"center" }}>No items</td></tr>
          )}
        </tbody>
      </table>

      <br />
      <button onClick={handleSave} disabled={loadingSave}>
        {loadingSave ? "Saving..." : "Save All"}
      </button>

      &nbsp;

      <button style={{ background:"red", color:"#fff" }} onClick={handleExit}>
        Exit
      </button>
    </div>
  );
}
