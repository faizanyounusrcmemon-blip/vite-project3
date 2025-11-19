import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Restore from "./pages/Restore";
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


// =====================================================================
// SMALL BACKUP BUTTON (fixed size + perfect UI)
// =====================================================================
function BackupButton() {
  async function takeBackup() {
    const pwd = prompt("Enter backup password:");
    if (!pwd) return;

    // Your backup password
    if (pwd !== "8515") {
      alert("❌ Incorrect Password!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/backup`, {
        method: "POST",
      });

      const data = await res.json();
      alert(data.success ? "✅ Backup Completed!" : "❌ " + data.error);
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }

  return (
    <button
      onClick={takeBackup}
      style={{
        background: "#0d6efd",
        color: "white",
        padding: "4px 10px",
        fontSize: "13px",
        borderRadius: "5px",
        cursor: "pointer",
        border: "none",
        margin: "8px 5px",
      }}
    >
      ☁ Backup
    </button>
  );
}



// =====================================================================
// MAIN APP COMPONENT
// =====================================================================
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

  // PAGE SWITCHING
  function renderPage() {
    if (!user) return <Login onLogin={(u) => setUser(u)} />;

    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "restore": return <Restore onNavigate={setPage} />;
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

  return (
    <div className="app-root">
      {user && <Navbar onNavigate={setPage} />}

      {/* 🔥 BACKUP + RESTORE BUTTONS SHOW TOGETHER */}
      {user && (
        <div style={{ display: "flex", paddingLeft: "10px" }}>
          <BackupButton />
        </div>
      )}

      <div className="content-area">{renderPage()}</div>
    </div>
  );
}
