// ===============================
//   FINAL App.jsx (WITH BACKUP PROGRESS)
// ===============================

import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Restore from "./pages/Restore";
import SaleEntry from "./pages/SaleEntry";
import SaleReturn from "./pages/SaleReturn";
import SaleReturnDetail from "./pages/SaleReturnDetail";
import SaleDetail from "./pages/SaleDetail";
import SaleItemDetail from "./pages/SaleItemDetail";
import CreateUser from "./pages/CreateUser";
import StockLedger from "./pages/StockLedger";

import PurchaseEntry from "./pages/PurchaseEntry";
import PurchaseReturn from "./pages/PurchaseReturn";
import PurchaseDetail from "./pages/PurchaseDetail";
import PurchaseItemDetail from "./pages/PurchaseItemDetail";
import PurchaseDeleteReport from "./pages/PurchaseDeleteReport";

import ItemProfile from "./pages/ItemProfile";
import CustomerProfile from "./pages/CustomerProfile";
import ManageUsers from "./pages/ManageUsers";

import StockReport from "./pages/StockReport";
import SaleReport from "./pages/SaleReport";
import MonthlyReport from "./pages/MonthlyReport";
import RateDifferenceReport from "./pages/RateDifferenceReport";
import BarcodePrint from "./pages/BarcodePrint";

import Login from "./pages/login";
import InvoiceEdit from "./pages/InvoiceEdit";
import PurchaseEdit from "./pages/PurchaseEdit";

import DeletedInvoiceReport from "./pages/DeletedInvoiceReport";
import MonthWiseSummary from "./pages/MonthWiseSummary";
import DayWiseSaleReport from "./pages/DayWiseSaleReport";


// =================================================
//   BACKUP BUTTON (WITH PROGRESS BAR)
// =================================================
function BackupButton() {
  const [progress, setProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  async function takeBackup() {
    const pwd = prompt("Enter backup password:");
    if (!pwd) return;

    if (pwd !== "8515") {
      alert("❌ Incorrect Password!");
      return;
    }

    setProgress(0);
    setIsBackingUp(true);

    // Smooth UI progress (fake)
    const int = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + 5;
      });
    }, 150);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/backup`, {
      method: "POST",
    });

    const data = await res.json();

    clearInterval(int);
    setProgress(100);

    setTimeout(() => {
      setIsBackingUp(false);
      setProgress(0);
    }, 700);

    alert(data.success ? "✅ Backup Completed!" : "❌ " + data.error);
  }

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={takeBackup}
        disabled={isBackingUp}
        style={{
          background: isBackingUp ? "#6c757d" : "#0d6efd",
          color: "white",
          padding: "4px 10px",
          fontSize: "13px",
          borderRadius: "5px",
          cursor: "pointer",
          border: "none",
          marginRight: "5px",
        }}
      >
        ☁ {isBackingUp ? "Backing Up..." : "Backup"}
      </button>

      {isBackingUp && (
        <div
          style={{
            width: "150px",
            height: "6px",
            background: "#ccc",
            marginTop: "5px",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#28a745",
              borderRadius: "4px",
              transition: "0.2s",
            }}
          />
        </div>
      )}
    </div>
  );
}


// =================================================
//   MAIN APP
// =================================================
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

  function renderPage() {
    if (!user) return <Login onLogin={(u) => setUser(u)} />;

    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "restore": return <Restore onNavigate={setPage} />;

      case "sale-entry": return <SaleEntry onNavigate={setPage} />;
      case "sale-return": return <SaleReturn onNavigate={setPage} />;
      case "sale-return-detail": return <SaleReturnDetail onNavigate={setPage} />;

      case "stock-ledger": return <StockLedger onNavigate={setPage} />;

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

      case "purchase-delete-report": return <PurchaseDeleteReport onNavigate={setPage} />;

      case "create-user": return <CreateUser onNavigate={setPage} />;
      case "item-profile": return <ItemProfile onNavigate={setPage} />;
      case "customer-profile": return <CustomerProfile onNavigate={setPage} />;
      case "manage-users": return <ManageUsers onNavigate={setPage} />;

      case "stock-report": return <StockReport onNavigate={setPage} />;
      case "sale-report": return <SaleReport onNavigate={setPage} />;
      case "monthly-report": return <MonthlyReport onNavigate={setPage} />;
      case "barcode-print": return <BarcodePrint onNavigate={setPage} />;

      case "month-wise-summary": return <MonthWiseSummary onNavigate={setPage} />;
      case "day-wise-sale-report": return <DayWiseSaleReport onNavigate={setPage} />;
      case "deleted-invoice-report": return <DeletedInvoiceReport onNavigate={setPage} />;

      case "rate-difference-report": return <RateDifferenceReport onNavigate={setPage} />;

      case "invoice-edit": return <InvoiceEdit onNavigate={setPage} />;
      case "purchase-edit": return <PurchaseEdit onNavigate={setPage} />;

      default:
        return <Dashboard onNavigate={setPage} />;
    }
  }

  return (
    <div className="app-root">
      {user && <Navbar onNavigate={setPage} />}

      {/* Backup Button */}
      {user && (
        <div style={{ paddingLeft: "10px" }}>
          <BackupButton />
        </div>
      )}

      <div className="content-area">{renderPage()}</div>
    </div>
  );
}
