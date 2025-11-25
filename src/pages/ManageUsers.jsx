import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function ManageUsers({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  // ⭐ UPDATED PERMISSIONS LIST (NEW 2 ADDED)
  const perms = [
    "sale_entry",
    "sale_return",
    "sale_return_detail",
    "sale_detail",
    "sale_item_detail",

    "purchase_entry",
    "purchase_return",
    "purchase_detail",
    "purchase_item_detail",

    "item_profile",
    "customer_profile",
    "manage_users",
    "create_user",

    "stock_report",
    "sale_report",
    "monthly_report",

    "month_wise_summary",       // ⭐ NEW
    "day_wise_sale_report",     // ⭐ NEW

    "deleted_invoice_report",
    "purchase_delete_report"
  ];

  async function loadUsers() {
    const { data } = await supabase.from("app_users").select("*");
    setUsers(data || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const toggle = (uIndex, perm) => {
    const copy = [...users];
    copy[uIndex][perm] = !copy[uIndex][perm];
    setUsers(copy);
  };

  const saveAll = async () => {
    setSaving(true);

    for (const u of users) {
      await supabase.from("app_users").update(u).eq("id", u.id);
    }

    await loadUsers();
    setSaving(false);
    alert("✅ Permissions updated!");
  };

  return (
    <div style={{ padding: 15 }}>
      <h2>Manage Users Permissions</h2>

      <table border="1" cellPadding="6" style={{ width: "100%", background: "#fff" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            {perms.map((p) => (
              <th key={p}>{p.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map((u, i) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role}</td>

              {perms.map((p) => (
                <td key={p}>
                  <input
                    type="checkbox"
                    checked={!!u[p]}
                    onChange={() => toggle(i, p)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={saveAll}
        style={{ padding: "8px 15px", marginTop: 10, background: "green", color: "#fff" }}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Permissions"}
      </button>

      <button
        onClick={() => onNavigate("dashboard")}
        style={{ padding: "8px 15px", marginTop: 10, marginLeft: 10 }}
      >
        Exit
      </button>
    </div>
  );
}
