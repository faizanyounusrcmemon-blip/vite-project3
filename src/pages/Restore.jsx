// =====================================================
//   FINAL Restore.jsx (Backup Size + Delete Fix)
// =====================================================

import React, { useEffect, useState } from "react";

export default function Restore({ onNavigate }) {
  const [backups, setBackups] = useState([]);
  const [progress, setProgress] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [search, setSearch] = useState("");

  const TABLES = ["sales","purchases","items","customers","app_users","sale_returns"];

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/list-backups`);
    const data = await res.json();
    if (data.success) {
      const sorted = data.files.sort((a, b) => (a.date < b.date ? 1 : -1));
      setBackups(sorted);
    }
  }

  async function restoreFile(fileName, mode, table = null) {
    const password = prompt("Enter Restore Password:");
    if (!password) return;

    setRestoring(true);
    setProgress(0);

    const int = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 4));
    }, 150);

    const form = new FormData();
    form.append("password", password);
    form.append("fileName", fileName);
    form.append("mode", mode);
    if (table) form.append("table", table);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/restore-from-bucket`,
      { method: "POST", body: form }
    );

    const data = await res.json();

    clearInterval(int);
    setProgress(100);
    setTimeout(() => {
      setRestoring(false);
      setProgress(0);
    }, 700);

    alert(data.success ? "✔ Restore Successful!" : "❌ " + data.error);
  }

  async function deleteBackup(fileName) {
    const password = prompt("Enter Password to Delete:");
    if (!password) return;

    const ok = confirm(`Delete:\n${fileName}?`);
    if (!ok) return;

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/delete-backup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("🗑 Backup Deleted");
      loadBackups();
    } else {
      alert("❌ " + data.error);
    }
  }
  async function downloadBackup(fileName) {
    const password = prompt("Enter Password to Download Backup");
    if (!password) return;
    
    const ok = confirm(`Download:\n${fileName}?`);
    if (!ok) return;

  function downloadBackup(name) {
    const link = document.createElement("a");
    link.href = `${import.meta.env.VITE_BACKEND_URL}/api/download-backup/${name}`;
    link.download = name;
    link.click();
  }

  const filtered = backups.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20, color: "white" }}>

      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#ff3333",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          color: "white",
        }}
      >
        ⬅ Back
      </button>

      <h1 style={{ marginTop: 20 }}>📦 Backup History</h1>

      <input
        type="text"
        placeholder="Search Backup..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "300px",
          padding: "8px",
          borderRadius: "6px",
          marginTop: "15px",
        }}
      />

      {restoring && (
        <div style={{ marginTop: 15 }}>
          <div
            style={{
              width: "350px",
              height: "12px",
              background: "#333",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#ff9800",
                transition: "0.2s",
              }}
            ></div>
          </div>
          <p>{progress}% Restoring...</p>
        </div>
      )}

      <div
        style={{
          marginTop: 25,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "15px",
        }}
      >
        {filtered.map((file, i) => (
          <div
            key={i}
            style={{
              background: "#1c1c1c",
              padding: "18px",
              borderRadius: "10px",
            }}
          >
            <h3>📁 {file.name}</h3>
            <p>📅 {file.date}</p>
            <p>📦 Size: {file.size}</p>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => restoreFile(file.name, "full")}
                style={{
                  background: "#00c853",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "white",
                  marginRight: "10px",
                }}
              >
                🔄 Full
              </button>

              <select
                onChange={(e) => setSelectedTable(e.target.value)}
                defaultValue=""
                style={{ padding: "6px", borderRadius: "6px", marginRight: 10 }}
              >
                <option value="" disabled>
                  Table
                </option>
                {TABLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  restoreFile(file.name, "table", selectedTable)
                }
                style={{
                  background: "#2979ff",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "white",
                }}
              >
                🧩 Restore
              </button>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button
                onClick={() => downloadBackup(file.name)}
                style={{
                  background: "#8e24aa",
                  padding: "6px 10px",
                  color: "white",
                  borderRadius: "6px",
                }}
              >
                ⬇ Download
              </button>

              <button
                onClick={() => deleteBackup(file.name)}
                style={{
                  background: "#d50000",
                  padding: "6px 10px",
                  color: "white",
                  borderRadius: "6px",
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



