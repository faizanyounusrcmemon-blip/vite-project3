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
        // Fix time parsing
        const fixed = data.files.map((f) => {
          const parts = f.name.replace(".zip", "").split("_");

          const dateStr = parts[1]; // YYYY-MM-DD
          const timeStr = parts[2].replace(/-/g, ":"); // HH:mm:ss

          return {
            ...f,
            date: `${dateStr} ${timeStr}`,
          };
        });

        setFiles(fixed);
      } else {
        alert("❌ Failed to load backup list");
      }
    } catch (err) {
      alert("Error loading backups: " + err.message);
    }
  }

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
        { method: "POST", body: form }
      );

      const data = await res.json();
      setLoading(false);

      alert(data.success ? "✅ Restore Successful!" : "❌ " + data.error);
    } catch (err) {
      alert("❌ Error: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>🔄 Restore Backup</h2>

      <h3 style={{ marginTop: "20px" }}>📁 Available Backups</h3>

      {files.length === 0 ? (
        <p>No backups found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            background: "#111",
            color: "white",
          }}
        >
          <thead>
            <tr style={{ background: "#333" }}>
              <th style={{ padding: "8px" }}>File</th>
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr key={file.name} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: "8px" }}>{file.name}</td>
                <td style={{ padding: "8px" }}>{file.date}</td>

                <td style={{ padding: "8px" }}>
                  {/* FULL RESTORE BUTTON */}
                  <button
                    disabled={loading}
                    onClick={() => restoreFile(file.name, "full")}
                    style={{
                      padding: "6px 12px",
                      background: "#007bff",
                      color: "white",
                      marginRight: "6px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    🔄 Full Restore
                  </button>

                  {/* TABLE RESTORE */}
                  <select
                    onChange={(e) =>
                      e.target.value &&
                      restoreFile(file.name, "table", e.target.value)
                    }
                    style={{
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #666",
                      background: "#222",
                      color: "white",
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
