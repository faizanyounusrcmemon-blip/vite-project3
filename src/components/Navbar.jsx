import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ onNavigate }) {
  const [openMenu, setOpenMenu] = useState(null);

  // ہر بار fresh user session سے
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // permission helper
  const can = (perm) => user?.role === "admin" || user?.[perm] === true;

  const logout = () => {
    sessionStorage.removeItem("user");
    onNavigate("login");
  };

  return (
    <div className="topbar">
      <div className="nav-left">
        <div className="brand">💎 KHADIJA JEWELLERY</div>

        {/* 🛒 Sales — header ہمیشہ نظر آئے؛ اندر صرف allowed buttons */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("sales")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">🛒 Sales</button>
          {openMenu === "sales" && (
            <div className="menu-list">
              {can("sale_entry") && <button onClick={() => onNavigate("sale-entry")}>Sale Entry</button>}
              {can("sale_return") && <button onClick={() => onNavigate("sale-return")}>Sale Return</button>}
              {can("sale_detail") && <button onClick={() => onNavigate("sale-detail")}>Sale Detail</button>}
              {can("sale_item_detail") && <button onClick={() => onNavigate("sale-item-detail")}>Sale Item Detail</button>}
              {!can("sale_entry") && !can("sale_return") && !can("sale_detail") && !can("sale_item_detail") && (
                <div className="disabled">No access</div>
              )}
            </div>
          )}
        </div>

        {/* 📦 Purchase */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("purchase")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📦 Purchase</button>
          {openMenu === "purchase" && (
            <div className="menu-list">
              {can("purchase_entry") && <button onClick={() => onNavigate("purchase-entry")}>Purchase Entry</button>}
              {can("purchase_return") && <button onClick={() => onNavigate("purchase-return")}>Purchase Return</button>}
              {can("purchase_detail") && <button onClick={() => onNavigate("purchase-detail")}>Purchase Detail</button>}
              {can("purchase_item_detail") && <button onClick={() => onNavigate("purchase-item-detail")}>Purchase Item Detail</button>}
              {!can("purchase_entry") && !can("purchase_return") && !can("purchase_detail") && !can("purchase_item_detail") && (
                <div className="disabled">No access</div>
              )}
            </div>
          )}
        </div>

        {/* 📇 Master */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("master")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📇 Master</button>
          {openMenu === "master" && (
            <div className="menu-list">
              {can("item_profile") && <button onClick={() => onNavigate("item-profile")}>Item Profile</button>}
              {can("customer_profile") && <button onClick={() => onNavigate("customer-profile")}>Customer Profile</button>}
              {can("manage_users") && <button onClick={() => onNavigate("manage-users")}>Manage Users</button>}
              {!can("item_profile") && !can("customer_profile") && !can("manage_users") && (
                <div className="disabled">No access</div>
              )}
            </div>
          )}
        </div>

        {/* 📊 Reports */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("reports")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📊 Reports</button>
          {openMenu === "reports" && (
            <div className="menu-list">
              {can("stock_report") && <button onClick={() => onNavigate("stock-report")}>Stock Report</button>}
              {!can("stock_report") && <div className="disabled">No access</div>}
            </div>
          )}
        </div>
      </div>

      <div className="right-actions">
        <div className="status">🟢 {user?.username || "User"} ({user?.role || "-"})</div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
