"use client";

console.log("PAGE CARREGOU");

import { useState, useEffect, useRef } from "react";

import Login from "./components/Login";
import Menu from "./components/Menu";
import Cadastro from "./components/Cadastro";

const inputStyle = {
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

import { db, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

// Função utilitária para converter fotos em Base64
function converterParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default function Home() {
  const containerRef = useRef<any>(null);
  const [tela, setTela] = useState("login");

  const [isDragging, setIsDragging] = useState(false);
  const [dragCadeira, setDragCadeira] = useState<number | null>(null);
  const [dragTimeout, setDragTimeout] = useState<any>(null);

  const [usuario, setUsuario] = useState<any>(null);

  const [ipCamera, setIpCamera] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Obter ID da congregação a partir do e-mail
  const congregacaoId = usuario?.email ? usuario.email.split("@")[0] : "";

  useEffect(() => {
    if (usuario) {
      setTela("menu");
    } else {
      setTela("login");
    }
  }, [usuario]);

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    async function pegarIP() {
      try {
        console.log("🔄 Buscando IP...");
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        console.log("✅ IP detectado:", data.ip);
        setIpCamera(data.ip || "");
      } catch (err) {
        console.error("❌ ERRO AO PEGAR IP:", err);
      }
    }
    pegarIP();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    const el = containerRef.current;
    let startY = 0;

    const handleTouchStart = (e: any) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: any) => {
      const currentY = e.touches[0].clientY;
      if (el.scrollTop === 0 && currentY > startY) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<{ id: string; url: string; nome: string }[]>([]);

  const [carregando, setCarregando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ CARREGAR MAPA DA CONGREGAÇÃO
  async function carregarMapaFirebase() {
    if (!congregacaoId) return;
    const snap = await getDoc(doc(db, "mapas", congregacaoId));
    if (snap.exists()) setMapa(snap.data());
    else setMapa({});
  }

  // ✅ ESCUTAR FOTOS DA CONGREGAÇÃO EM TEMPO REAL
  useEffect(() => {
    if (!congregacaoId) return;

    const q = query(collection(db, "fotos"), where("congregacaoId", "==", congregacaoId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        nome: doc.data().nome || "",
      }));

      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      setFotos(lista);
    });

    return () => unsubscribe();
  }, [congregacaoId]);

  // ✅ FAZER LOGIN
  async function fazerLoginCustom() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userObj = {
        id: user.uid,
        email: user.email,
        admin: true,
      };

      setUsuario(userObj);
      localStorage.setItem("usuario", JSON.stringify(userObj));
      setTela("menu");
    } catch (error: any) {
      alert("Falha no login: " + error.message);
    }
  }

  async function excluirFoto(id: string) {
    if (!confirm("Deseja excluir esta foto do Banco de Dados?")) return;
    await deleteDoc(doc(db, "fotos", id));
  }

  // ✅ SALVAR MAPA DA CONGREGAÇÃO
  async function salvarMapaFirebase() {
    if (!congregacaoId) {
      alert("Nenhuma congregação identificada.");
      return;
    }
    await setDoc(doc(db, "mapas", congregacaoId), mapa);
    alert("✅ Mapa da congregação salvo no banco!");
  }

  async function irParaPreset(numero: number) {
    try {
      const res = await fetch("/api/preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preset: numero,
          ip: ipCamera
        }),
      });

      if (!res.ok) {
        alert("❌ API retornou erro ao chamar a câmera");
        return;
      }

      const data = await res.json();
      if (!data.ok) {
        alert("❌ API respondeu, mas não executou o comando");
      }
    } catch (err) {
      alert("❌ Falha ao comunicar com a API da câmera");
    }
  }

  async function irParaPresetCameraPalco(numero: number) {
    console.log("📸 Camera Palco preset:", numero);
  }

  // ✅ CARREGAR FOTOS EM BASE64 (GRATUITO)
  async function carregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !congregacaoId) return;

    setCarregando(true);
    setProgresso(0);

    const arquivosOrdenados = Array.from(files).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (let index = 0; index < arquivosOrdenados.length; index++) {
      const file = arquivosOrdenados[index];
      const base64 = await converterParaBase64(file);

      await addDoc(collection(db, "fotos"), {
        congregacaoId: congregacaoId,
        url: base64,
        nome: file.name,
        criadoEm: new Date(),
      });

      setProgresso(Math.round(((index + 1) / arquivosOrdenados.length) * 100));
    }

    setCarregando(false);
  }

  function limparCadeiras() {
    setMapa({});
    setSelecionada(null);
  }

  function clicarCadeira(num: number) {
    const novo = { ...mapa };
    const temPessoa = mapa[num];

    if (!selecionada && temPessoa) {
      irParaPreset(1);
      return;
    }

    if (selecionada) {
      novo[num] = selecionada;
      setMapa(novo);
      setSelecionada(null);
    }
  }

  function removerFotoCadeira(num: number) {
    if (
      !window.confirm(
        "Deseja realmente remover esta foto da cadeira?\n\nA foto continuará cadastrada no banco de dados."
      )
    ) {
      return;
    }

    const novo = { ...mapa };
    delete novo[num];
    setMapa(novo);
  }

  const cadeiras = [];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const corredores = [5, 12, 19];

      if (corredores.includes(j)) {
        cadeiras.push(
          <div
            key={`gap-${i}-${j}`}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        );
        continue;
      }
      let col;
      if (j < 5) col = j;
      else if (j < 12) col = j - 1;
      else if (j < 19) col = j - 2;
      else col = j - 3;

      let linha = ROWS - 1 - i;
      let numeroLinha = linha * COLS + col + 1;
      let cadeiraNum = numeroLinha < 90 ? numeroLinha : numeroLinha + 10;

      const foto = mapa[cadeiraNum];

      cadeiras.push(
        <div
          key={i + "-" + j}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#ccc",
              fontSize: isMobile ? 12 : 14,
              marginBottom: 3,
              letterSpacing: 3,
            }}
          >
            {cadeiraNum}
          </span>

          <div
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (selecionada && !mapa[cadeiraNum]) {
                const novo = { ...mapa };
                novo[cadeiraNum] = selecionada;
                setMapa(novo);
                setSelecionada(null);
                return;
              }

              if (!selecionada) {
                irParaPreset(cadeiraNum);
              }
            }}
            onPointerDown={() => {
              if (selecionada) return;
              if (!mapa[cadeiraNum]) return;

              if (dragCadeira === cadeiraNum) {
                setDragCadeira(null);
                setIsDragging(false);
                return;
              }

              const timeout = setTimeout(() => {
                setDragCadeira(cadeiraNum);
                setIsDragging(true);
              }, 600);

              setDragTimeout(timeout);
            }}
            onPointerLeave={() => {
              if (dragTimeout) {
                clearTimeout(dragTimeout);
                setDragTimeout(null);
              }
            }}
            onPointerCancel={() => {
              if (dragTimeout) {
                clearTimeout(dragTimeout);
                setDragTimeout(null);
              }
            }}
            onPointerUp={() => {
              if (dragTimeout) {
                clearTimeout(dragTimeout);
                setDragTimeout(null);
              }

              if (selecionada) {
                setDragCadeira(null);
                setIsDragging(false);
                return;
              }

              if (dragCadeira !== null && dragCadeira !== cadeiraNum) {
                const novo = { ...mapa };

                if (!mapa[cadeiraNum]) {
                  novo[cadeiraNum] = mapa[dragCadeira];
                  delete novo[dragCadeira];
                  setMapa(novo);
                }

                setDragCadeira(null);
              }

              setIsDragging(false);
            }}
            onContextMenu={(e) => {
              if (navigator.maxTouchPoints > 0) return;
              e.preventDefault();
              removerFotoCadeira(cadeiraNum);
            }}
            style={{
              width: "100%",
              maxWidth: isMobile ? 50 : 70,
              aspectRatio: "1",
              background: "#2B2B2B",
              border:
                dragCadeira === cadeiraNum
                  ? "3px solid red"
                  : "1px solid #555",
              boxShadow:
                dragCadeira === cadeiraNum
                  ? "0 0 10px red"
                  : "none",
              position: "relative",
              cursor: "pointer",
              borderRadius: 6,
              overflow: "hidden",
              outline: "none",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              touchAction: isDragging ? "none" : "auto",
              opacity: dragCadeira === cadeiraNum ? 0.5 : 1
            }}
          >
            {foto && (
              <img
                src={foto}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none"
                }}
              />
            )}

            {foto && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removerFotoCadeira(cadeiraNum);
                }}
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "#1f1f1f",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 100,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.6)"
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  if (!tela) return null;

  if (tela === "login") {
    return (
      <Login
        onLogin={(user: any) => {
          setUsuario(user);
          localStorage.setItem("usuario", JSON.stringify(user));
          setTela("menu");
        }}
      />
    );
  }

  if (tela === "menu") {
    return (
      <Menu
        usuario={usuario}
        ipCamera={ipCamera}
        setIpCamera={setIpCamera}
        onIrPainel={async () => {
          await carregarMapaFirebase();
          setTela("painel");
        }}
        onIrCadastro={() => setTela("cadastro")}
        onSair={() => {
          setUsuario(null);
          localStorage.removeItem("usuario");
          setTela("login");
        }}
      />
    );
  }

  if (tela === "cadastro") {
    return (
      <Cadastro
        usuario={usuario}
        onVoltar={() => setTela("menu")}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: "#1E1E1E",
        minHeight: "100vh",
        padding: isMobile ? 10 : 20,
        color: "white",
        overflowY: "auto"
      }}
    >
      {/* GRID */}
      <div style={{ overflowX: isMobile ? "hidden" : "auto" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(4,1fr)"
                : isTablet
                  ? "repeat(10,1fr)"
                  : `
  repeat(5, 1fr) 4px
  repeat(6, 1fr) 4px
  repeat(6, 1fr) 4px
  repeat(5, 1fr)
`,
              rowGap: isMobile ? 5 : 10,
              columnGap: isMobile ? 0 : 1,
              minWidth: isTablet ? 1000 : undefined,
            }}
          >
            {cadeiras}

            {/* LINHAS VERMELHAS */}
            <div style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "22.7%",
              transform: "translateX(-50%)",
              width: 4,
              background: "red"
            }} />

            <div style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              background: "red"
            }} />

            <div style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "77.3%",
              transform: "translateX(-50%)",
              width: 4,
              background: "red"
            }} />
          </div>
        </div>
      </div>

      {/* TÍTULOS */}
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `
              repeat(5, 1fr) 4px
              repeat(6, 1fr) 4px
              repeat(6, 1fr) 4px
              repeat(5, 1fr)
            `,
            marginTop: 6,
            marginBottom: 20,
            fontSize: 16,
            fontWeight: "bold",
            color: "#ccc",
          }}
        >
          <button
            onClick={() => irParaPresetCameraPalco(3)}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            style={{
              gridColumn: "1 / span 5",
              textAlign: "center",
              background: "transparent",
              border: "1px solid #555",
              color: "#ccc",
              fontWeight: "bold",
              padding: "6px",
              cursor: "pointer",
              borderRadius: 6,
              transition: "0.2s"
            }}
          >
            3 - CADEIRA (ESQUERDO)
          </button>

          <button
            onClick={() => irParaPresetCameraPalco(2)}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            style={{
              gridColumn: "7 / span 13",
              textAlign: "center",
              background: "transparent",
              border: "1px solid #555",
              color: "#ccc",
              fontWeight: "bold",
              padding: "6px",
              cursor: "pointer",
              borderRadius: 6,
              transition: "0.2s"
            }}
          >
            2 - TRIBUNA
          </button>

          <button
            onClick={() => irParaPresetCameraPalco(4)}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            style={{
              gridColumn: "21 / span 5",
              textAlign: "center",
              background: "transparent",
              border: "1px solid #555",
              color: "#ccc",
              fontWeight: "bold",
              padding: "6px",
              cursor: "pointer",
              borderRadius: 6,
              transition: "0.2s"
            }}
          >
            4 - MESA (DIREITO)
          </button>
        </div>
      )}

      {/* BOTÕES */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <button
          onClick={() => setTela("menu")}
          style={{
            background: "#3b82f6",
            color: "white",
            height: 45,
            padding: "10px 20px",
            borderRadius: 5,
            border: "none",
            marginBottom: 10,
            cursor: "pointer"
          }}
        >
          ← Voltar ao Menu
        </button>

        <input
          id="uploadFotos"
          type="file"
          multiple
          onChange={carregarFotos}
          style={{ display: "none" }}
        />

        <button
          onClick={() =>
            document.getElementById("uploadFotos")?.click()
          }
          disabled={carregando}
          style={{
            background: "#007BFF",
            color: "white",
            height: 45,
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Carregar Fotos
        </button>

        <button
          onClick={limparCadeiras}
          style={{
            background: "#dc3545",
            color: "white",
            height: 45,
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Limpar Cadeiras
        </button>

        <button
          onClick={salvarMapaFirebase}
          style={{
            background: "#28a745",
            color: "white",
            height: 45,
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Salvar Layout
        </button>
      </div>

      {/* LOADING */}
      {carregando && (
        <div style={{ marginTop: 15 }}>
          ⏳ {progresso}%
        </div>
      )}

      {/* MINIATURAS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 15,
          padding: 10,
          background: "#111",
          borderRadius: 6,
        }}
      >
        {fotos.map((foto) => (
          <div key={foto.id} style={{ position: "relative" }}>
            <img
              src={foto.url}
              onClick={() => {
                if (selecionada === foto.url) {
                  setSelecionada(null);
                  return;
                }
                setSelecionada(foto.url);
              }}
              onDragStart={(e) => e.preventDefault()}
              style={{
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "grab",
                border: selecionada === foto.url ? "3px solid red" : "2px solid transparent",
                touchAction: "none"
              }}
            />

            {usuario?.admin && (
              <button
                onClick={() => excluirFoto(foto.id)}
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}