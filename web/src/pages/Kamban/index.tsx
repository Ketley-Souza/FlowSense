import React from "react";

type Card = {
  id: string;
  title: string;
};

type Column = {
  id: string;
  title: string;
  cards: Card[];
};

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "A Fazer",
    cards: [
      { id: "1", title: "Criar layout inicial" },
      { id: "2", title: "Configurar rotas" },
    ],
  },
  {
    id: "doing",
    title: "Em Progresso",
    cards: [{ id: "3", title: "Implementar drag and drop" }],
  },
  {
    id: "done",
    title: "Concluído",
    cards: [{ id: "4", title: "Setup do projeto" }],
  },
];

export default function Kamban() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Kamban</h1>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {initialColumns.map((column) => (
          <article
            key={column.id}
            style={{
              background: "#f5f5f5",
              borderRadius: 10,
              padding: 12,
              minHeight: 280,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{column.title}</h2>

            <div style={{ display: "grid", gap: 8 }}>
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  {card.title}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}