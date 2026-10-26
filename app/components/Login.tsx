"use client";

import { useState } from "react";

export default function Login({ onLogin }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function fazerLogin() {
    const { db } = await import("@/lib/firebase");
    const { collection, getDocs } = await import("firebase/firestore");

    const snapshot = await getDocs(collection(db, "usuarios"));

    const userDoc = snapshot.docs.find((doc: any) => {
      const data = doc.data();
      return data.email.toLowerCase() === email.toLowerCase();
    });

    if (!userDoc) {
      alert("Usuário inválido");
      return;
    }

    const data = userDoc.data();

    if (data.senha !== senha) {
      alert("Senha inválida");
      return;
    }

    onLogin(data);
  }

  return (
    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#1e293b",
        padding: 40,
        borderRadius: 12,
        width: 320
      }}>
        <h2 style={{ color: "white", marginBottom: 20 }}>
          Sistema de Assentos
        </h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff"
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff"
          }}
        />

        <button
          onClick={fazerLogin}
          style={{
            width: "100%",
            padding: 10,
            background: "#3b82f6",
            border: "none",
            borderRadius: 6,
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
``