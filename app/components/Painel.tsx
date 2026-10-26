"use client";

import { useEffect, useState } from "react";

// ✅ IMPORTS QUE FALTAVAM
import Grid from "./Grid";
import Miniaturas from "./Miniaturas";

import { listarFotos, excluirFoto } from "../services/fotos";
import { carregarMapa, salvarMapa } from "../services/mapa";

export default function Painel({ usuario, setTela }: any) {
  const [fotos, setFotos] = useState<any[]>([]);
  const [mapa, setMapa] = useState<any>({});
  const [selecionada, setSelecionada] = useState<string | null>(null);

  useEffect(() => {
    listarFotos().then(setFotos);
    carregarMapa().then(setMapa);
  }, []);

  function limparCadeiras() {
    setMapa({});
    setSelecionada(null);
  }

  return (
    <div style={{ background: "#1E1E1E", minHeight: "100vh", padding: 20 }}>
      
      {/* AÇÕES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTela("menu")}>Voltar</button>

        <button onClick={() => salvarMapa(mapa)}>
          Salvar Layout
        </button>

        <button onClick={limparCadeiras}>
          Limpar
        </button>
      </div>

      {/* GRID */}
      <Grid
        mapa={mapa}
        setMapa={setMapa}
        selecionada={selecionada}
      />

      {/* MINIATURAS */}
      <Miniaturas
        fotos={fotos}
        selecionada={selecionada}
        setSelecionada={setSelecionada}
        usuario={usuario}
        excluirFoto={excluirFoto}
      />
    </div>
  );
}