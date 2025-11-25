import React, { useEffect, useState } from "react";

export default function Restore() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");

  const TABLES = ["sales", "purchases", "items", "customers", "app_users", "sale_returns"];

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/list-backups`
    );
    const data = await res.json();
    if (data.success) setBackups(data.files);
  }

  async function restoreFile(fileName, mode, table = null) {
    const password = prompt("Enter Restore Password:");

    if (!password) {
      alert("Restore cancelled (no password entered)");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("password", password);
    form.append("fileName", fileName);
    form.append("mode", mode);
    if (table) form.append("table", table);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/restore-from-bucket`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Restore successful");
    } else {
      alert("Restore failed: " + data.error);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      {/* ⭐ EXIT BUTTON — no navigate, safe */}
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginBottom: 20,
          backgroundColor: "red",
          color: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none",
        }}
      >
        EXIT
      </button>

      <h2>Restore Backup</h2>

      {loading && <p>Restoring, please wait...</p>}

      {backups.length === 0 ? (
        <p>No backups found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Date</th>
              <th>Full Restore</th>
              <th>Table Restore</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
                <td>{file.date}</td>
                <td>
                  <button onClick={() => restoreFile(file.name, "full")}>
                    Restore Full
                  </button>
                </td>
                <td>
                  <select
                    onChange={(e) => setSelectedTable(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Table
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
                  >
                    Restore Table
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
