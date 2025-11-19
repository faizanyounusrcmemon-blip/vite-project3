import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ onNavigate }) {
  const [openMenu, setOpenMenu] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Permission checker
  const can = (perm) => user?.role === "admin" || user?.[perm] === true;

  return (
    <div className="topbar">
      <div className="nav-left">

        {/* Brand */}
        <div className="brand">💎 KHADIJA JEWELLERY</div>

        {/* ---------------- SALES MENU ---------------- */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("sales")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">🛒 Sales</button>

          {openMenu === "sales" && (
            <div className="menu-list">
              {can("sale_entry") && (
                <button onClick={() => onNavigate("sale-entry")}>Sale Entry</button>
              )}
              {can("sale_return") && (
                <button onClick={() => onNavigate("sale-return")}>Sale Return</button>
              )}
              {can("sale_detail") && (
                <button onClick={() => onNavigate("sale-detail")}>Sale Detail</button>
              )}
              {can("sale_item_detail") && (
                <button onClick={() => onNavigate("sale-item-detail")}>
                  Sale Item Detail
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- PURCHASE MENU ---------------- */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("purchase")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📦 Purchase</button>

          {openMenu === "purchase" && (
            <div className="menu-list">
              {can("purchase_entry") && (
                <button onClick={() => onNavigate("purchase-entry")}>
                  Purchase Entry
                </button>
              )}
              {can("purchase_return") && (
                <button onClick={() => onNavigate("purchase-return")}>
                  Purchase Return
                </button>
              )}
              {can("purchase_detail") && (
                <button onClick={() => onNavigate("purchase-detail")}>
                  Purchase Detail
                </button>
              )}
              {can("purchase_item_detail") && (
                <button onClick={() => onNavigate("purchase-item-detail")}>
                  Purchase Item Detail
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- MASTER MENU ---------------- */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("master")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📇 Master</button>

          {openMenu === "master" && (
            <div className="menu-list">
              {can("item_profile") && (
                <button onClick={() => onNavigate("item-profile")}>
                  Item Profile
                </button>
              )}
              {can("customer_profile") && (
                <button onClick={() => onNavigate("customer-profile")}>
                  Customer Profile
                </button>
              )}
              {can("manage_users") && (
                <button onClick={() => onNavigate("manage-users")}>
                  Manage Users
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- REPORTS MENU ---------------- */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("reports")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📊 Reports</button>

          {openMenu === "reports" && (
            <div className="menu-list">
              {can("stock_report") && (
                <button onClick={() => onNavigate("stock-report")}>
                  Stock Report
                </button>
              )}
              {can("sale_report") && (
                <button onClick={() => onNavigate("sale-report")}>
                  Sales Profit Report
                </button>
              )}
              {can("monthly_report") && (
                <button onClick={() => onNavigate("monthly-report")}>
                  Monthly Graph Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- RIGHT SIDE BUTTONS ---------------- */}
      <div className="right-actions">
        
        {/* ✅ Restore Button (NEW – same style as Logout) */}
        <button
          className="logout-btn"      // same CSS class = same UI
          style={{ marginRight: "10px", background: "#6f42c1" }} // purple button
          onClick={() => onNavigate("restore")}
        >
          🔄 Restore
        </button>

        {/* Username + Role */}
        <div className="status">🟢 {user?.username} ({user?.role})</div>

        {/* Logout */}
        <button
          className="logout-btn"
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            onNavigate("login");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
