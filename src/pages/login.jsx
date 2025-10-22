// src/pages/Login.jsx
import React, { useState } from "react";

export default function Login() {
  const api = import.meta.env.VITE_API_URL; // .env سے URL لے رہا ہے
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Login failed!");
      const data = await res.json();
      setMessage(`✅ Login successful: ${data.user || username}`);
    } catch (err) {
      setMessage("❌ Login error, please check credentials.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "gold",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Khadija Jewellery Login</h1>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px", width: "250px" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "gold",
            color: "black",
            padding: "8px",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>{message}</p>
    </div>
  );
}
