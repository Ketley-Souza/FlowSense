import { useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import DeleteModal from "./DeleteModal";

export default function Projects() {

  const [projects, setProjects] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  // 🔥 CRIAR PROJETO (ESSA FUNÇÃO FAZ O SALVAR FUNCIONAR)
  const handleCreate = (project: any) => {
    setProjects((prev) => [...prev, project]);
  };

  // 🔥 DELETAR
  const handleDelete = (id: any) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const activeProjects = projects.filter(
    (p) => p.status === "Em andamento"
  );

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen">

      {/* TOPO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Projetos</h1>
          <p className="text-sm text-gray-500">
            {activeProjects.length} projetos ativos
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="bg-gradient-to-r from-[#5f5bff] to-[#6c2bd9] text-white px-4 py-2 rounded-lg text-sm"
        >
          + Novo Projeto
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-5">

        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-xl shadow-sm border relative"
          >

            {/* COR LATERAL */}
            <div
              className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
              style={{ background: p.color || "#5f5bff" }}
            />

            {/* HEADER */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-sm font-semibold">
                  {p.name}
                </h2>

                <p className="text-xs text-gray-500">
                  {p.description}
                </p>
              </div>

              <button
                onClick={() => setDeleteId(p.id)}
                className="text-red-500 text-xs"
              >
                🗑
              </button>
            </div>

            {/* DATAS */}
            <div className="text-xs text-gray-400 mb-2">
              📅 {p.startDate || "Sem data"} → {p.endDate || "Sem data"}
            </div>

            {/* RESPONSÁVEL */}
            <div className="text-xs text-gray-500 mb-2">
              👤 {p.creator || "Sem responsável"}
            </div>

            {/* PROGRESSO */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso</span>
                <span>{p.progress || 0}%</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full bg-[#5f5bff]"
                  style={{ width: `${p.progress || 0}%` }}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-xs text-gray-500 mt-3">
              {p.tasksDone || 0}/{p.totalTasks || 0} tarefas
            </div>

          </div>
        ))}

      </div>

      {/* MODAL CRIAR */}
      {openCreate && (
        <CreateProjectModal
          onClose={() => setOpenCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* MODAL DELETE */}
      {deleteId && (
        <DeleteModal
          projectId={deleteId}
          onClose={() => setDeleteId(null)}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}