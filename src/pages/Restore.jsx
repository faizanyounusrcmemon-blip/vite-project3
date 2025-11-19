import React, { useEffect, useState } from "react";

export default function Restore() {
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
        const fixed = data.files.map((f) => {
          const p = f.name.replace(".zip", "").split("_");

          return {
            ...f,
            date: `${p[1]} ${p[2].replace(/-/g, ":")}`,
          };
        });

        setFiles(fixed);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }

  async function restoreFile(fileName, mode = "full", table = "") {
    const password = prompt("Enter Password:");
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

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        alert("❌ Server Error:\n\n" + text);
        setLoading(false);
        return;
      }

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

      <h3>📁 Available Backups</h3>

      <table style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>File</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <tr key={file.name}>
              <td>{file.name}</td>
              <td>{file.date}</td>
              <td>
                <button
                  disabled={loading}
                  onClick={() => restoreFile(file.name, "full")}
                >
                  🔄 Full Restore
                </button>

                <select
                  onChange={(e) =>
                    e.target.value &&
                    restoreFile(file.name, "table", e.target.value)
                  }
                >
                  <option>Restore Table...</option>
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
    </div>
  );
}
