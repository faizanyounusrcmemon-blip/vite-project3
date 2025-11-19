import React, { useEffect, useState } from "react";

export default function Restore({ onNavigate }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const TABLES = ["sales", "purchases", "items", "customers", "app_users"];

  useEffect(() => {
    loadBackupFiles();
  }, []);

  async function loadBackupFiles() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/list-backups`
      );
      const data = await res.json();

      if (data.success) {
        setFiles(data.files);
      } else {
        alert("❌ Failed to load backup list");
      }
    } catch (err) {
      alert("Error loading backups: " + err.message);
    }
  }

  // ---------- RESTORE FUNCTION ----------
  async function restoreFile(fileName, mode = "full", table = "") {
    const password = prompt("Enter Restore Password:");
    if (!password) return;

    setLoading(true);

    try {
      const form = new FormData();
      form.append("password", password);
      form.append("fileName", fileName);
      form.append("mode", mode);
      if (mode === "table") form.append("table", table);

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
        alert("✅ Restore Successful!");
      } else {
        alert("❌ Restore Failed: " + data.error);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔄 Restore Backup</h2>

      {/* Backup List */}
      <h3 style={{ marginTop: "20px" }}>📁 Available Backups</h3>

      {files.length === 0 ? (
        <p>No backups found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px" }}>File</th>
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr key={file.name} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{file.name}</td>
                <td style={{ padding: "8px" }}>{file.date}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    disabled={loading}
                    onClick={() => restoreFile(file.name, "full")}
                    style={{
                      padding: "6px 12px",
                      background: "#0d6efd",
                      color: "white",
                      marginRight: "6px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    🔄 Full Restore
                  </button>

                  {/* Selected Table Restore */}
                  <select
                    onChange={(e) =>
                      restoreFile(file.name, "table", e.target.value)
                    }
                    style={{
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Restore Table...</option>
                    {TABLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
