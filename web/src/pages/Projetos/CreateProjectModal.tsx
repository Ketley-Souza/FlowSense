import { useState } from "react";

export default function CreateProjectModal({ onClose, onCreate }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#5f5bff");

  const colors = [
    "#5f5bff",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6"
  ];

  const handleCreate = () => {
    if (!name) {
      alert("Digite o nome");
      return;
    }

    const newProject = {
      id: Date.now(),
      name,
      description,
      color,
      status: "Em andamento",
      progress: 0,
      creator: "Rafael Soares",
      tasksDone: 0,
      totalTasks: 0,
      startDate: "01 Abr 2026",
      endDate: "02 Abr 2026"
    };

    onCreate(newProject); // 🔥 ESSA LINHA FAZ FUNCIONAR
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

      <div className="bg-white w-[420px] p-6 rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">Criar Projeto</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* NOME */}
        <label className="text-sm text-gray-600">Nome</label>
        <input
          className="w-full border p-2 rounded mt-1 mb-3"
          placeholder="Nome do projeto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* DESCRIÇÃO */}
        <label className="text-sm text-gray-600">Descrição</label>
        <textarea
          className="w-full border p-2 rounded mt-1 mb-4"
          placeholder="Descrição do projeto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* DATAS (visual igual ao da imagem) */}
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div>
            <p>Início</p>
            <p className="flex items-center gap-1">📅 01 Abr 2026</p>
          </div>

          <div>
            <p>Fim</p>
            <p className="flex items-center gap-1">📅 02 Abr 2026</p>
          </div>
        </div>

        {/* ATRIBUÍDO (visual fake) */}
        <label className="text-sm text-gray-600 block mb-1">Atribuídos</label>

        <div className="flex items-center justify-between border rounded p-2 mb-4">
          <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            Rafael Soares
            <span className="cursor-pointer">✕</span>
          </div>

          <button className="text-gray-400 text-lg">+</button>
        </div>

        {/* CORES */}
        <label className="text-sm text-gray-600 mb-2 block">Cor</label>

        <div className="flex gap-2 mb-5">
          {colors.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                color === c ? "border-black" : "border-transparent"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 border rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleCreate}
            className="bg-[#6c2bd9] text-white px-4 py-2 rounded-lg"
          >
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
}