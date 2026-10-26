"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Cadastro({ usuario, onVoltar }: any) {

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoAdmin, setNovoAdmin] = useState(false);

  async function cadastrarUsuario() {

    if (!novoNome.trim()) {
      alert("Digite o nome");
      return;
    }

    if (!novoEmail.trim()) {
      alert("Digite o email");
      return;
    }

    if (!novaSenha.trim()) {
      alert("Digite a senha");
      return;
    }

    await addDoc(collection(db, "usuarios"), {
      nome: novoNome,
      email: novoEmail,
      senha: novaSenha,
      admin: novoAdmin,
    });

    alert("✅ Usuário criado!");

    setNovoNome("");
    setNovoEmail("");
    setNovaSenha("");
    setNovoAdmin(false);

    onVoltar(); // volta para o menu
  }

  // ✅ BLOQUEIO
  if (!usuario?.admin) {
    return <div style={{ color: "white" }}>Acesso negado</div>;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg">

        <h2 className="text-white text-xl md:text-2xl mb-4">
          Cadastro
        </h2>

        <input
          placeholder="Nome"
          onChange={(e) => setNovoNome(e.target.value)}
          className="w-full p-2 mb-3 rounded border border-slate-600 bg-slate-900 text-white"
        />

        <input
          placeholder="Email"
          onChange={(e) => setNovoEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded border border-slate-600 bg-slate-900 text-white"
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setNovaSenha(e.target.value)}
          style={input}
          className="w-full p-2 mb-3 rounded border border-slate-600 bg-slate-900 text-white"
        />


        <label className="text-white flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            onChange={(e) => setNovoAdmin(e.target.checked)}
          /> Admin
        </label>

        <button
          onClick={cadastrarUsuario}
          className="w-full p-2 bg-blue-500 rounded text-white mt-2 hover:bg-blue-600"
        >
          Salvar
        </button>

        <button
          onClick={onVoltar}
          className="w-full p-2 bg-slate-600 rounded text-white mt-2 hover:bg-slate-700"
        >
          Voltar
        </button>

      </div>
    </div>
  );
}

/* estilos */
const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff"
};

const btnPrimary = {
  width: "100%",
  padding: 10,
  background: "#3b82f6",
  border: "none",
  borderRadius: 6,
  color: "white",
  marginTop: 10,
  cursor: "pointer"
};

const btnSecondary = {
  width: "100%",
  padding: 10,
  background: "#334155",
  border: "none",
  borderRadius: 6,
  color: "white",
  marginTop: 5,
  cursor: "pointer"
};
