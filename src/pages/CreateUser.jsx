// src/pages/CreateUser.jsx

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function CreateUser({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User fields
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [showNewPassword, setShowNewPassword] = useState(false); // ⭐ show/hide create

  // Edit fields
  const [editId, setEditId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false); // ⭐ show/hide edit

  // Table password visibility per user
  const [showTablePassword, setShowTablePassword] = useState({}); // ⭐ map of userID→bool

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from("app_users").select("*").order("id");
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // CREATE USER
  async function createUser() {
    if (!newUsername || !newPassword) {
      alert("❌ Username & Password required");
      return;
    }

    const defaultPerms = {
      sale_entry: false,
      sale_return: false,
      sale_detail: false,
      sale_item_detail: false,

      purchase_entry: false,
      purchase_return: false,
      purchase_detail: false,
      purchase_item_detail: false,

      item_profile: false,
      customer_profile: false,
      manage_users: false,
      stock_report: false,
      sale_report: false,
      monthly_report: false,

      deleted_invoice_report: false,
      purchase_delete_report: false,

      month_wise_summary: false,
      day_wise_sale_report: false,
    };

    const { error } = await supabase.from("app_users").insert([
      {
        username: newUsername,
        password: newPassword,
        role: newRole,
        ...defaultPerms,
      },
    ]);

    if (error) return alert("❌ " + error.message);

    alert("✅ User created!");
    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
    loadUsers();
  }

  // DELETE USER
  async function deleteUser(id) {
    const ok = confirm("⚠ Delete this user permanently?");
    if (!ok) return;

    await supabase.from("app_users").delete().eq("id", id);
    alert("🗑 User deleted!");
    loadUsers();
  }

  // START EDIT
  function startEdit(u) {
    setEditId(u.id);
    setEditUsername(u.username);
    setEditPassword(u.password);
    setShowEditPassword(false);
  }

  // SAVE EDIT
  async function saveEdit() {
    if (!editUsername || !editPassword) {
      alert("❌ Both fields required!");
      return;
    }

    const { error } = await supabase
      .from("app_users")
      .update({
        username: editUsername,
        password: editPassword,
      })
      .eq("id", editId);

    if (error) return alert("❌ " + error.message);

    alert("✅ User updated!");
    setEditId(null);
    loadUsers();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Create / Manage Users</h2>

      {/* BACK BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "#6f42c1",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 5,
          border: "none",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ⬅ Exit
      </button>

      {/* CREATE USER FORM */}
      <div style={{ padding: 15, border: "1px solid #ccc", borderRadius: 6, marginBottom: 20 }}>
        <h3>Create New User</h3>

        <div>
          <label>Username</label><br />
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ padding: 6, width: 250 }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Password</label><br />
          <input
            type={showNewPassword ? "text" : "password"} 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: 6, width: 250 }}
          />

          <div style={{ marginTop: 5 }}>
            <input
              type="checkbox"
              checked={showNewPassword}
              onChange={(e) => setShowNewPassword(e.target.checked)}
            />{" "}
            Show Password
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Role</label><br />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            style={{ padding: 6, width: 250 }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={createUser}
          style={{
            marginTop: 10,
            background: "green",
            color: "#fff",
            padding: "8px 15px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Create User
        </button>
      </div>

      {/* USERS TABLE */}
      <h3>All Users</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding={8} style={{ width: "100%", background: "#fff" }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Show</th>
              <th>Role</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                {/* EDIT MODE */}
                {editId === u.id ? (
                  <>
                    <td>
                      <input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        style={{ padding: 6 }}
                      />
                    </td>

                    <td>
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        style={{ padding: 6 }}
                      />

                      <div>
                        <input
                          type="checkbox"
                          checked={showEditPassword}
                          onChange={(e) => setShowEditPassword(e.target.checked)}
                        />{" "}
                        Show
                      </div>
                    </td>

                    <td>{u.role}</td>

                    <td>
                      <button
                        onClick={saveEdit}
                        style={{
                          background: "green",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: 5,
                        }}
                      >
                        Save
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={() => setEditId(null)}
                        style={{
                          background: "#999",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: 5,
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* NORMAL MODE */}
                    <td>{u.username}</td>

                    <td>
                      {showTablePassword[u.id] ? u.password : "••••••••"}
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        checked={showTablePassword[u.id] || false}
                        onChange={(e) =>
                          setShowTablePassword({
                            ...showTablePassword,
                            [u.id]: e.target.checked,
                          })
                        }
                      />{" "}
                      Show
                    </td>

                    <td>{u.role}</td>

                    <td>
                      <button
                        onClick={() => startEdit(u)}
                        style={{
                          background: "#0d6efd",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: 5,
                        }}
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={() => deleteUser(u.id)}
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: 5,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
