import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import SaleEntry from "./pages/SaleEntry";
import SaleReturn from "./pages/SaleReturn";
import SaleReturnDetail from "./pages/SaleReturnDetail";
import SaleDetail from "./pages/SaleDetail";
import SaleItemDetail from "./pages/SaleItemDetail";

import PurchaseEntry from "./pages/PurchaseEntry";
import PurchaseReturn from "./pages/PurchaseReturn";
import PurchaseDetail from "./pages/PurchaseDetail";
import PurchaseItemDetail from "./pages/PurchaseItemDetail";

import ItemProfile from "./pages/ItemProfile";
import CustomerProfile from "./pages/CustomerProfile";
import ManageUsers from "./pages/ManageUsers";
import StockReport from "./pages/StockReport";
import BarcodePrint from "./pages/BarcodePrint";
import Login from "./pages/login";
import InvoiceEdit from "./pages/InvoiceEdit";

import SaleReport from "./pages/SaleReport";
import MonthlyReport from "./pages/MonthlyReport";


// ------------------------------------------------
// 🟢 BACKUP BUTTON COMPONENT (New Stylish Small Button)
// ------------------------------------------------
function BackupButton() {
  async function takeBackup() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/backup`, {
        method: "POST",
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        alert("Backup Failed: Server returned invalid response:\n" + text);
        return;
      }

      if (data.success) {
        alert("✅ Backup Completed Successfully!");
      } else {
        alert("❌ Backup Failed:\n" + (data.error || "Unknown Error"));
      }
    } catch (err) {
      alert("❌ Backup Error: " + err.message);
    }
  }

  return (
    <button
      onClick={takeBackup}
      style={{
        background: "#0d6efd",
        color: "white",
        padding: "6px 16px",
        fontSize: "14px",
        borderRadius: "6px",
        cursor: "pointer",
        border: "none",
        fontWeight: "500",
        transition: "0.2s",

        // ⭐⭐ MAIN FIX ⭐⭐
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        width: "auto",
        maxWidth: "fit-content",
        minWidth: "max-content",

        margin: "10px auto 10px 10px",
      }}
      onMouseEnter={(e) => (e.target.style.background = "#0b5ed7")}
      onMouseLeave={(e) => (e.target.style.background = "#0d6efd")}
    >
      ☁ Backup
    </button>
  );
}


// ------------------------------------------------
// 🟢 MAIN APP COMPONENT
// ------------------------------------------------
export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
      setPage("dashboard");
    }
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      setPage("dashboard");
    }
  }, [user]);

  // ---------- PAGE RENDER SWITCH ----------
  function renderPage() {
    if (!user) return <Login onLogin={(u) => setUser(u)} />;

    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "sale-entry": return <SaleEntry onNavigate={setPage} />;
      case "sale-return": return <SaleReturn onNavigate={setPage} />;
      case "sale-return-detail": return <SaleReturnDetail onNavigate={setPage} />;

      case "sale-detail":
        return (
          <SaleDetail
            onNavigate={setPage}
            onEditInvoice={(inv) => {
              sessionStorage.setItem("selectedInvoice", JSON.stringify(inv));
              setPage("invoice-edit");
            }}
          />
        );

      case "sale-item-detail": return <SaleItemDetail onNavigate={setPage} />;

      case "purchase-entry": return <PurchaseEntry onNavigate={setPage} />;
      case "purchase-return": return <PurchaseReturn onNavigate={setPage} />;
      case "purchase-detail": return <PurchaseDetail onNavigate={setPage} />;
      case "purchase-item-detail": return <PurchaseItemDetail onNavigate={setPage} />;

      case "barcode-print": return <BarcodePrint onNavigate={setPage} />;
      case "item-profile": return <ItemProfile onNavigate={setPage} />;
      case "customer-profile": return <CustomerProfile onNavigate={setPage} />;
      case "manage-users": return <ManageUsers onNavigate={setPage} />;

      case "stock-report": return <StockReport onNavigate={setPage} />;
      case "sale-report": return <SaleReport onNavigate={setPage} />;
      case "monthly-report": return <MonthlyReport onNavigate={setPage} />;

      case "invoice-edit": return <InvoiceEdit onNavigate={setPage} />;

      default: return <Dashboard onNavigate={setPage} />;
    }
  }

  // ---------- FINAL UI ----------
  return (
    <div className="app-root">
      {user && <Navbar onNavigate={setPage} />}

      {/* 🔥 BACKUP BUTTON ALWAYS SHOWS WHEN LOGGED IN */}
      {user && <BackupButton />}

      <div className="content-area">{renderPage()}</div>
    </div>
  );
}
