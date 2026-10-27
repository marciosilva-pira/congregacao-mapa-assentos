"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin() {
    if (!email || !senha) {
      alert("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);

    try {
      // 1. Consulta a coleção 'usuarios' buscando pelo e-mail
      const q = query(
        collection(db, "usuarios"),
        where("email", "==", email.trim().toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Usuário não encontrado na base de dados.");
        setCarregando(false);
        return;
      }

      // 2. Obtém os dados do documento encontrado no Firestore
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 3. Valida a senha guardada na tabela 'usuarios'
      if (userData.senha !== senha) {
        alert("Senha incorreta.");
        setCarregando(false);
        return;
      }

      // 4. Monta o objeto do usuário logado
      const dadosUsuario = {
        id: userDoc.id,
        email: userData.email,
        nome: userData.nome || "Usuário",
        admin: userData.admin ?? true,
      };

      onLogin(dadosUsuario);
    } catch (error: any) {
      console.error("Erro ao consultar Firestore:", error);
      alert("Erro ao validar login: " + error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: 40,
          borderRadius: 12,
          width: 320,
        }}
      >
        <h2 style={{ color: "white", marginBottom: 20 }}>
          Sistema de Assentos
        </h2>

        <input
          type="email"
          placeholder="Email da Congregação"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            outline: "none",
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            outline: "none",
          }}
        />

        <button
          onClick={fazerLogin}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 10,
            background: "#3b82f6",
            border: "none",
            borderRadius: 6,
            color: "white",
            fontWeight: "bold",
            cursor: carregando ? "not-allowed" : "pointer",
            opacity: carregando ? 0.7 : 1,
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}