"use client";

import { useState, useEffect } from "react";
import UsuariosGrid from "./UsuariosGrid";



export default function Menu({ usuario, ipCamera, setIpCamera, onIrPainel, onIrCadastro, onSair }: any) {

    const [aba, setAba] = useState("");

    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        function ajustarMenu() {
            if (window.innerWidth >= 768) {
                setMenuAberto(true);
            } else {
                setMenuAberto(false);
            }
        }

        ajustarMenu();
        window.addEventListener("resize", ajustarMenu);

        return () => window.removeEventListener("resize", ajustarMenu);
    }, []);

    function fecharSeMobile() {
        if (window.innerWidth < 768) {
            setMenuAberto(false);
        }
    }

    console.log("Menu renderizado");

    return (
        <div className="min-h-screen bg-slate-900 flex">


            {/* BOTÃO MOBILE */}
            <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden fixed top-4 left-4 z-[10000] bg-slate-800 text-white p-2 rounded"

            >
                ☰
            </button>


            {/* ✅ OVERLAY (COLOCA AQUI) */}
            {menuAberto && (
                <div
                    onClick={() => setMenuAberto(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                />
            )}


            {/* ✅ MENU LATERAL */}
            <div
                className={`
    fixed
    top-0 left-0
    h-full
    w-64
    bg-slate-800 text-white
    p-5 pt-16 md:pt-5
    flex flex-col gap-3

    transform transition-transform duration-300
    ${menuAberto ? "translate-x-0" : "-translate-x-full"}

    md:translate-x-0

    z-[9999]
  `}
            >



                <h2>Gestor de Assentos</h2>
                <div className="mb-4 pb-2 border-b border-slate-600">
                    👤 {usuario?.nome}
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label style={{ color: "white", fontSize: 12 }}>
                        IP da Câmera (Vivo)
                    </label>

                    <input
                        type="text"
                        placeholder="Ex: 189.78.xxx.xxx"
                        value={ipCamera}
                        onChange={(e) => setIpCamera(e.target.value)}
                        style={{
                            width: "100%",
                            padding: 8,
                            borderRadius: 6,
                            border: "1px solid #ccc"
                        }}
                    />
                </div>

                <button
                    onClick={() => {
                        onIrPainel();
                        fecharSeMobile();
                    }}

                    className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                >
                    📋 Painel
                </button>


                {usuario?.admin === true && (

                    <button
                        onClick={() => {
                            setAba("usuarios");
                            fecharSeMobile();
                        }}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                    >
                        👤 Usuários
                    </button>

                )}

                <button
                    onClick={() => {
                        onSair();
                        fecharSeMobile();
                    }}
                    className="mt-auto bg-red-500 hover:bg-red-600 p-2 rounded text-left"
                >
                    🚪 Sair
                </button>
            </div>

            {/* ✅ CONTEÚDO PRINCIPAL */}
            <div className="flex-1 bg-slate-900 p-6 md:p-8 text-white w-full md:ml-64">


                {aba === "usuarios" && (
                    <UsuariosGrid />
                )}

            </div>

        </div>
    );
}

/* ✅ ESTILOS */

const btnMenu = {
    padding: 10,
    background: "#334155",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    textAlign: "left" as const,
    width: "100%"
};



const btnMenuSair = {
    marginTop: "auto",
    padding: 10,
    background: "#ef4444",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    textAlign: "left" as const
};

