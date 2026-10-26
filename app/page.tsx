"use client";

console.log("PAGE CARREGOU"); // ✅ COLOQUE AQUI

import { useState, useEffect, useRef } from "react";


import Login from "./components/Login";
import Menu from "./components/Menu";
import Cadastro from "./components/Cadastro";



// ✅ ESTADOS DE LOGIN
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


import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

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



  // cadastro
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoAdmin, setNovoAdmin] = useState(false);


  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<{ id: string; url: string }[]>([]);


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

  // ✅ CARREGAR MAPA

  async function carregarMapaFirebase() {
    const snap = await getDoc(doc(db, "config", "mapa"));
    if (snap.exists()) setMapa(snap.data());
  }

  /*
    useEffect(() => {
      async function carregarMapa() {
        const snap = await getDoc(doc(db, "config", "mapa"));
        if (snap.exists()) setMapa(snap.data());
      }
      carregarMapa();
    }, []);
  */

  // ✅ tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "fotos"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        nome: doc.data().nome,
      }));

      lista.sort((a, b) => a.nome.localeCompare(b.nome));

      setFotos(lista);
    });

    return () => unsubscribe();
  }, []);

  // ✅ carregar inicial
  useEffect(() => {
    async function carregarFotosBanco() {
      const snapshot = await getDocs(collection(db, "fotos"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        nome: doc.data().nome || "",
      }));

      lista.sort((a, b) => a.nome.localeCompare(b.nome));

      setFotos(lista);
    }

    carregarFotosBanco();
  }, []);


  async function fazerLogin() {
    const snapshot = await getDocs(collection(db, "usuarios"));

    // ✅ 1. Procurar usuário pelo email (ignora maiúsculo/minúsculo)
    const userDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.email.toLowerCase() === email.toLowerCase();
    });

    // ❌ Se não encontrou email
    if (!userDoc) {
      alert("Usuário inválido");
      return;
    }

    const data = userDoc.data();

    setUsuario({
      id: userDoc.id,
      ...userDoc.data()
    });


    // ❌ Se senha está errada
    if (data.senha !== senha) {
      alert("Senha inválida");
      return;
    }

    // ✅ Login OK
    setUsuario(data);
    setTela("menu");
  }


  async function excluirFoto(id: string) {
    if (!confirm("Deseja excluir esta foto do Banco de Dados?")) return;
    await deleteDoc(doc(db, "fotos", id));
  }

  async function salvarMapaFirebase() {
    await setDoc(doc(db, "config", "mapa"), mapa);
    alert("✅ Mapa salvo no banco!");
  }


  async function irParaPreset(numero: number) {
    console.log("📸 Enviando preset:", numero);

    try {
      const res = await fetch("/api/preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preset: numero,
          ip: ipCamera // ✅ AGORA ESTÁ ENVIANDO O IP
        }),
      });

      if (!res.ok) {
        alert("❌ API retornou erro ao chamar a câmera");
        return;
      }

      const data = await res.json();

      if (data.ok) {
        //alert(`✅ Comando enviado para a câmera (Preset ${numero})`);
      } else {
        alert("❌ API respondeu, mas não executou o comando");
      }

      console.log("✅ Resposta da API:", data);
    } catch (err) {
      alert("❌ Falha ao comunicar com a API da câmera");
      console.error("Erro:", err);
    }
  }


  async function irParaPresetCameraPalco(numero: number) {
    console.log("📸 Camera Palco preset:", numero);

    // FUTURO:
    // await fetch("/api/preset2", {...})
  }

  async function carregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setCarregando(true);
    setProgresso(0);

    const arquivosOrdenados = Array.from(files).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const uploads = arquivosOrdenados.map(async (file, index) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload_cadeiras");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dous0lse8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        await addDoc(collection(db, "fotos"), {
          url: data.secure_url,
          nome: file.name,
        });
      }

      setProgresso(Math.round(((index + 1) / arquivosOrdenados.length) * 100));
    });

    await Promise.all(uploads);

    setCarregando(false);
  }

  function limparCadeiras() {
    setMapa({});
    setSelecionada(null);
  }

  function clicarCadeira(num: number) {
    const novo = { ...mapa };

    const temPessoa = mapa[num]; // ✅ verifica se tem foto na cadeira

    // 👉 Só dispara câmera se:
    // 1. NÃO está adicionando foto
    // 2. E a cadeira TEM alguém
    if (!selecionada && temPessoa) {
      //irParaPreset(num);
      irParaPreset(1);
      return;
    }

    // comportamento atual (colocar foto)
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

              // ✅ 1. Se tem foto selecionada e cadeira vazia → colocar
              if (selecionada && !mapa[cadeiraNum]) {
                const novo = { ...mapa }
                novo[cadeiraNum] = selecionada
                setMapa(novo)
                setSelecionada(null)
                return
              }

              // ✅ 2. Se NÃO tem seleção e tem pessoa → câmera
              // if (!selecionada && mapa[cadeiraNum]) {
              // vou trocar se NÃO TEM seleção, mesmo que a cadeira esteja vazia, vai enviar o preset

              if (!selecionada) {

                console.log("cadeiraNum:", cadeiraNum);
                console.log("mapa[cadeiraNum]:", mapa[cadeiraNum]);
                console.log("selecionada:", selecionada);

                irParaPreset(cadeiraNum)
                //irParaPreset(54)
              }
            }}


            // ✅ INÍCIO do arrastar
            onPointerDown={() => {

              if (selecionada) return;
              if (!mapa[cadeiraNum]) return;

              if (dragCadeira === cadeiraNum) {
                setDragCadeira(null)
                setIsDragging(false)
                return
              }

              const timeout = setTimeout(() => {
                setDragCadeira(cadeiraNum)
                setIsDragging(true)
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

              // ✅ cancela o timer (se só clicou rápido)
              if (dragTimeout) {
                clearTimeout(dragTimeout);
                setDragTimeout(null);
              }

              // ✅ BLOQUEIA o drag se estiver no modo colocar foto
              if (selecionada) {
                setDragCadeira(null);
                setIsDragging(false);
                return;
              }

              // ✅ arrasto (se realmente ativou)
              if (dragCadeira !== null && dragCadeira !== cadeiraNum) {
                const novo = { ...mapa }

                if (!mapa[cadeiraNum]) {
                  novo[cadeiraNum] = mapa[dragCadeira]
                  delete novo[dragCadeira]
                  setMapa(novo)
                }

                setDragCadeira(null)
              }

              setIsDragging(false)
            }}

            onContextMenu={(e) => {
              // ✅ Bloqueia no celular/tablet (toque)
              if (navigator.maxTouchPoints > 0) return;

              e.preventDefault()
              removerFotoCadeira(cadeiraNum)
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
                  pointerEvents: "none" // ✅ ESSENCIAL
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
                  background: "#1f1f1f", // ✅ mantém a cor escura
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


  console.log("TELA ATUAL:", tela);
  console.log("USUARIO:", usuario);

  if (!tela) return null;

  if (tela === "login") {
    return (
      <Login
        onLogin={(user: any) => {
          setUsuario(user);
          setTela("menu");
        }}
      />
    );
  }

  if (tela === "menu") {
    return (
      <Menu
        usuario={usuario}

        ipCamera={ipCamera}           // ✅ AQUI
        setIpCamera={setIpCamera}

        onIrPainel={async () => {
          await carregarMapaFirebase();
          setTela("painel");
        }}
        onIrCadastro={() => setTela("cadastro")}
        onSair={() => {
          setUsuario(null);
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
              left: "22.7%",   // posição do corredor
              transform: "translateX(-50%)", // ✅ CENTRALIZA
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


          </div> {/* fecha o position: relative */}

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
            onClick={() => {
              irParaPresetCameraPalco(3);
              // FUTURO:
              // irParaPresetCamera2(3)
            }}

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
            onClick={() => {
              irParaPresetCameraPalco(2);
              // FUTURO:
              // irParaPresetCamera2(3)
            }}

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
            onClick={() => {
              irParaPresetCameraPalco(4);
              // FUTURO:
              // irParaPresetCamera2(3)
            }}

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

        {/* ✅ BOTÃO VOLTAR */}
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
                // ✅ se já está selecionada → desmarca
                if (selecionada === foto.url) {
                  setSelecionada(null)
                  return
                }

                // ✅ senão → seleciona
                setSelecionada(foto.url)
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