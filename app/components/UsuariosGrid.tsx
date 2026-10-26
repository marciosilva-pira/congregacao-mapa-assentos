"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    addDoc
} from "firebase/firestore";

export default function UsuariosGrid() {

    const [selecionado, setSelecionado] = useState<string | null>(null);

    const [usuarios, setUsuarios] = useState<any[]>([]);

    const [modo, setModo] = useState<"novo" | "editar" | null>(null);
    const [usuarioAtual, setUsuarioAtual] = useState<any>(null);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [admin, setAdmin] = useState(false);

    async function carregarUsuarios() {
        const snapshot = await getDocs(collection(db, "usuarios"));

        const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        setUsuarios(lista);
    }

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // ✅ EXCLUIR
    async function excluirUsuario(id: string) {
        if (!confirm("Deseja excluir este usuário?")) return;

        await deleteDoc(doc(db, "usuarios", id));
        carregarUsuarios();
    }

    // ✅ NOVO USUÁRIO
    function novoUsuario() {
        setModo("novo");
        setNome("");
        setEmail("");
        setSenha("");
        setAdmin(false);
    }


    // ✅ EDITAR
    function editarUsuario(u: any) {
        setModo("editar");
        setUsuarioAtual(u);
        setNome(u.nome);
        setEmail(u.email);
        setSenha(u.senha || "");
        setAdmin(u.admin || false);
    }

    // ✅ SALVAR (novo ou edição)
    async function salvar() {

        if (!nome || !email || !senha) {
            alert("Preencha nome, email e senha");
            return;
        }


        if (modo === "novo") {
            await addDoc(collection(db, "usuarios"), {
                nome,
                email,
                senha,
                admin
            });
        }

        if (modo === "editar") {
            await updateDoc(doc(db, "usuarios", usuarioAtual.id), {
                nome,
                email,
                senha,
                admin
            });
        }

        setModo(null);
        carregarUsuarios();
    }

    return (
        <div className="w-full p-4">

            <h2 className="text-xl text-white mb-3">
                Usuários
            </h2>


            <button
                onClick={novoUsuario}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >

                ➕ Novo Usuário
            </button>

            <div className="w-full overflow-x-auto mt-4">
                <table className="min-w-[600px] w-full text-white">
                    <thead className="bg-slate-800 text-white">

                        <tr>
                            <th className="text-left p-3 border-b border-slate-700">Nome</th>
                            <th className="text-left p-3 border-b border-slate-700">Email</th>
                            <th className="text-left p-3 border-b border-slate-700">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {usuarios.map((u) => (


                            <tr
                                key={u.id}
                                onClick={() => setSelecionado(u.id)}
                                className={`cursor-pointer ${selecionado === u.id
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-800"
                                    }`}
                            >




                                <td className="p-3 border-b border-slate-800">{u.nome}</td>
                                <td className="p-3 border-b border-slate-800">{u.email}</td>

                                <td className="p-3 border-b border-slate-800">
                                    <div className="flex gap-2">

                                        <button
                                            onClick={() => editarUsuario(u)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            onClick={() => excluirUsuario(u.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
                                        >
                                            🗑️
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>



            {/* ✅ FORMULÁRIO */}
            {modo && (
                <div style={modal}>
                    <div style={box}>
                        <h3>{modo === "novo" ? "Novo Usuário" : "Editar Usuário"}</h3>

                        <input
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            style={input}
                        />

                        <input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={input}
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={input}
                        />

                        <label style={{ color: "white", display: "block", marginTop: 10 }}>
                            <input
                                type="checkbox"
                                checked={admin}
                                onChange={(e) => setAdmin(e.target.checked)}
                            /> Admin
                        </label>

                        <button onClick={salvar} style={btnSalvar}>
                            Salvar
                        </button>

                        <button onClick={() => setModo(null)} style={btnCancelar}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}


/* ✅ ESTILOS */

const th = {
    textAlign: "left" as const,
    padding: 12,
    borderBottom: "1px solid #334155"
};

const td = {
    padding: 12,
    borderBottom: "1px solid #1e293b"
};

const btnNovo = {
    padding: 10,
    background: "#22c55e",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
};

const btnEditar = {
    background: "#3b82f6",
    border: "none",
    color: "white",
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14
};

const btnExcluir = {
    background: "#ef4444",
    border: "none",
    color: "white",
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14
};



const btnSalvar = {
    width: "100%",
    padding: 10,
    background: "#3b82f6",
    border: "none",
    borderRadius: 6,
    color: "white",
    marginTop: 10
};

const btnCancelar = {
    width: "100%",
    padding: 10,
    background: "#334155",
    border: "none",
    borderRadius: 6,
    color: "white",
    marginTop: 5
};

const input = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff"
};

const modal = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const box = {
    background: "#1e293b",
    padding: 20,
    borderRadius: 10,
    width: 300,
    color: "white"
};