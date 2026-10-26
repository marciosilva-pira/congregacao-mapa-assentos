export default function Miniaturas({
  fotos,
  selecionada,
  setSelecionada,
  usuario,
  excluirFoto,
  setDragFoto,      // ✅ NOVO
  setPosicao

}: any) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
      {fotos.map((foto: any) => (
        <div key={foto.id} style={{ position: "relative" }}>

          <img
            src={foto.url}
            draggable={false}
            onClick={() => setSelecionada(foto.url)}

            onPointerDown={(e) => {
              setSelecionada(foto.url)

              setDragFoto(foto.url) // ✅ ativa drag global

              setPosicao({
                x: e.clientX,
                y: e.clientY
              })
            }}



            onDragStart={(e) => e.preventDefault()}

            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              userSelect: "none",
              touchAction: "none",
              cursor: "grab",
              border: selecionada === foto.url ? "3px solid #00BFFF" : "2px solid transparent"
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
  );
}
