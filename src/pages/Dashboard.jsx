// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [lastBackup, setLastBackup] = useState("");
  const containerRef = useRef(null);

  // =============================
  // LOAD LAST BACKUP
  // =============================
  useEffect(() => {
    loadLastBackup();
  }, []);

  async function loadLastBackup() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/list-backups`
      );
      const data = await res.json();

      if (data.success && data.files.length > 0) {
        setLastBackup(data.files[0].date);
      }
    } catch (err) {
      console.error("Backup load error:", err);
    }
  }

  // =============================
  // LOAD ITEMS
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not initialized — check .env");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .limit(10);

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading)
    return (
      <div style={{ padding: 30, color: "#fff" }}>
        ⏳ Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: 30, color: "red", fontWeight: "bold" }}>
        ❌ {error}
      </div>
    );

  return (
    <div
      ref={containerRef}
      style={{
        padding: 25,
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#f5f5f5",
        background:
          "radial-gradient(circle at top, #2b2b52 0, #050509 45%, #000 100%)",
      }}
    >
      {/* GLOBAL STYLING */}
      <style>
        {`
          .dash-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.75));
            box-shadow: 0 12px 30px rgba(0,0,0,0.7);
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.06);
            backdrop-filter: blur(12px);
            transition: all 0.25s ease-out;
          }
          .dash-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 18px 40px rgba(0,0,0,0.85);
            border-color: rgba(243,196,107,0.55);
          }
          .golden-text {
            color: #f3c46b !important;
            text-shadow: 0 0 10px rgba(243,196,107,0.6);
          }
          .dash-table th, .dash-table td {
            border-bottom: 1px solid #333;
          }
        `}
      </style>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="golden-text" style={{ margin: 0 }}>
            💎 Khadija Jewellery Dashboard
          </h1>
          <p style={{ color: "#bdbdbd", marginTop: 4 }}>
            System status & quick overview
          </p>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: "1px solid #333",
            color: "#ccc",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          ✅ Software Created By FaizanYounus
        </div>
      </div>

      {/* TOP SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.3fr",
          gap: 16,
          marginBottom: 25,
        }}
      >
        {/* BACKUP CARD */}
        <div className="dash-card" style={{ padding: 18 }}>
          <h3 className="golden-text" style={{ margin: 0 }}>
            ☁ Last Backup Status
          </h3>
          <p style={{ marginTop: 8, fontSize: 18, fontWeight: "bold" }}>
            {lastBackup || "No backup found"}
          </p>
          <p style={{ color: "#c0c0c0", fontSize: 13 }}>
            Backup protects your jewellery system data.
          </p>
        </div>

        {/* SMALL STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}
        >
          <div className="dash-card" style={{ padding: 16, textAlign: "center" }}>
            <div className="golden-text" style={{ fontSize: 28 }}>💍</div>
            <small style={{ color: "#bbb" }}>Items Loaded</small>
            <div className="golden-text" style={{ fontSize: 22, fontWeight: "bold" }}>
              {items.length}
            </div>
          </div>

          <div className="dash-card" style={{ padding: 16, textAlign: "center" }}>
            <div className="golden-text" style={{ fontSize: 28 }}>🧾</div>
            <small style={{ color: "#bbb" }}>System Status</small>
            <div style={{ color: "#4ade80", fontSize: 18, fontWeight: "bold" }}>
              All Good
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS PREVIEW */}
      <div className="dash-card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 className="golden-text" style={{ margin: 0 }}>
              🔎 Quick Items Preview
            </h3>
            <p style={{ color: "#b0b0b0", fontSize: 13 }}>
              First 10 items (quick check)
            </p>
          </div>

          <button
            onClick={() => setShowList((prev) => !prev)}
            style={{
              background: showList ? "#6c757d" : "#0d6efd",
              color: "white",
              padding: "6px 12px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {showList ? "Hide ▲" : "Show ▼"}
          </button>
        </div>

        {showList && (
          <div
            style={{
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              maxHeight: 260,
              overflow: "auto",
            }}
          >
            <table
              className="dash-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(0,0,0,0.45)",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>Code</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: 15 }}>
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: 8 }}>{item.code}</td>
                      <td style={{ padding: 8 }}>{item.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
