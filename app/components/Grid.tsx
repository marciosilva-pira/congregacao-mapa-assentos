"use client";

export default function Grid({ mapa, setMapa, selecionada, setSelecionada }: any) {

  function clicarCadeira(num: number) {
    if (!selecionada) return;

    const novo = { ...mapa };
    novo[num] = selecionada;

    setMapa(novo);

    // limpa seleção depois de usar
    setSelecionada(null);
  }


  function remover(num: number) {
    
    const novo = { ...mapa };
    delete novo[num];
    setMapa(novo);
  }

  const cadeiras = [];

  for (let i = 1; i <= 50; i++) {
    const foto = mapa[i];

    cadeiras.push(
      <div
        key={i}
        onClick={() => clicarCadeira(i)}

        onPointerUp={() => clicarCadeira(i)}

        onPointerEnter={() => {
          if (selecionada) {
            clicarCadeira(i)
          }
        }}

        onContextMenu={(e) => {
          e.preventDefault();
          remover(i);
        }}

        style={{
          width: 70,
          height: 70,
          background: "#2B2B2B",
          border: "1px solid #555",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: 6
        }}
      >

        {foto ? (
          <img
            src={foto}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          i
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(10, 1fr)",
      gap: 10
    }}>
      {cadeiras}
    </div>
  );
}