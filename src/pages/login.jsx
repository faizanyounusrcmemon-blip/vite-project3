import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function Login({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    // تمام ضروری columns لے آئیں تاکہ navbar کو ساری permissions مل جائیں
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, username, role, password,
        sale_entry, sale_return, sale_detail, sale_item_detail,
        purchase_entry, purchase_return, purchase_detail, purchase_item_detail,
        item_profile, customer_profile, manage_users, stock_report
      `)
      .eq("username", username)
      .eq("password", password)   // نوٹ: بعد میں hash پر شفٹ کرلیں
      .maybeSingle();

    if (error || !data) {
      setMsg("❌ غلط username یا password");
      return;
    }

    // ✅ اب ہم sessionStorage استعمال کر رہے ہیں تاکہ refresh پر دوبارہ login مانگے
    sessionStorage.setItem("user", JSON.stringify({
      id: data.id,
      username: data.username,
      role: data.role,
      // permissions:
      sale_entry: !!data.sale_entry,
      sale_return: !!data.sale_return,
      sale_detail: !!data.sale_detail,
      sale_item_detail: !!data.sale_item_detail,
      purchase_entry: !!data.purchase_entry,
      purchase_return: !!data.purchase_return,
      purchase_detail: !!data.purchase_detail,
      purchase_item_detail: !!data.purchase_item_detail,
      item_profile: !!data.item_profile,
      customer_profile: !!data.customer_profile,
      manage_users: !!data.manage_users,
      stock_report: !!data.stock_report,
    }));

    setMsg("✅ Login successful");
    onNavigate("dashboard");
  }

  function handleCancel() {
    setUsername("");
    setPassword("");
    setMsg("");
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",color:"#f3c46b"}}>
      <form onSubmit={handleLogin} style={{width:320,background:"#111",padding:18,borderRadius:10,border:"1px solid #333"}}>
        <h2 style={{marginTop:0,marginBottom:12,textAlign:"center"}}>Khadija Jewellery</h2>

        <label className="small">Username</label>
        <input
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          style={{width:"100%",padding:8,borderRadius:6,marginBottom:10}}
          autoFocus
        />

        <label className="small">Password</label>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{flex:1,padding:8,borderRadius:6}}
          />
          <button type="button" className="menu-btn" onClick={()=>setShowPw(v=>!v)}>
            {showPw ? "🙈 Hide" : "👁 Show"}
          </button>
        </div>

        {msg && <div style={{marginBottom:10,color: msg.startsWith("✅") ? "#9f9" : "#f88"}}>{msg}</div>}

        <div style={{display:"flex",gap:8}}>
          <button type="submit" className="logout-btn" style={{flex:1}}>Login</button>
          <button type="button" className="menu-btn" style={{flex:1}} onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
