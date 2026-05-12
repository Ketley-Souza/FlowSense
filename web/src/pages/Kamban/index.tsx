import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CreateTaskModal } from "./CreateTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { useTarefasStore } from "@/store/useTarefasStore";
import { useProjetosStore } from "@/store/useProjetosStore";
import type { Tarefa } from "@/store/types";

// Cores de prioridade
const prioridadeColors = {
  BAIXA: "bg-blue-100 text-blue-800 border-blue-300",
  MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ALTA: "bg-red-100 text-red-800 border-red-300",
};

const prioridadeLabels = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

export default function Kanban() {
  const {
    tarefas,
    carregando,
    erro,
    listar,
    criar,
    atualizar,
    deletar,
  } = useTarefasStore();

  const { projetoAtual } = useProjetosStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(
    null
  );
  const [filtroColuna, setFiltroColuna] = useState<string>("todas");
  const [filtroProjeto, setFiltroProjeto] = useState<string>("todos");

  // Carregar tarefas ao montar componente
  useEffect(() => {
    listar();
  }, [listar]);

  async function handleCriarTarefa(payload: {
    titulo: string;
    descricao: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    id_coluna?: string;
  }): Promise<void> {
    try {
      // Se houver projeto ativo, usar ele; caso contrário, usar o primeiro projeto
      let idProjeto = projetoAtual?.id;

      if (!idProjeto) {
        const projetos = [
          ...new Map(
            tarefas.map((t: Tarefa) => [t.id_projeto, t.projeto])
          ).values(),
        ];

        if (projetos.length === 0) {
          throw new Error(
            "Nenhum projeto disponível. Crie um projeto primeiro ou selecione um projeto ativo na Dashboard."
          );
        }

        idProjeto = (projetos[0] as any).id;
      }

      await criar({
        ...payload,
        id_projeto: idProjeto,
      });
      setCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar tarefa");
    }
  }

  async function handleAtualizarTarefa(payload: {
    titulo: string;
    descricao: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    progresso: number;
  }): Promise<void> {
    if (!tarefaSelecionada) return;

    try {
      await atualizar(tarefaSelecionada.id, payload);
      setEditModalOpen(false);
      setTarefaSelecionada(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar tarefa");
    }
  }

  async function handleDeletarTarefa(): Promise<void> {
    if (!tarefaSelecionada) return;

    try {
      await deletar(tarefaSelecionada.id);
      setEditModalOpen(false);
      setTarefaSelecionada(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar tarefa");
    }
  }

  // Agrupar tarefas por coluna
  const colunas = [
    ...new Map(
      tarefas
        .filter((t: Tarefa) => t.coluna)
        .map((t: Tarefa) => [t.coluna!.id, t.coluna!])
    ).values(),
  ];

  const tarefasSemColuna = tarefas.filter((t: Tarefa) => !t.coluna);

  // Aplicar filtros
  const tarefasFiltradas = tarefas.filter((t: Tarefa) => {
    // Se há projeto ativo, filtrar por ele
    if (projetoAtual && t.id_projeto !== projetoAtual.id) {
      return false;
    }

    if (
      filtroColuna !== "todas" &&
      filtroColuna !== "sem_coluna" &&
      t.coluna?.id !== filtroColuna
    ) {
      return false;
    }
    if (
      filtroColuna === "sem_coluna" &&
      t.coluna?.id !== undefined &&
      t.coluna?.id !== null
    ) {
      return false;
    }
    if (filtroProjeto !== "todos" && t.id_projeto !== filtroProjeto) {
      return false;
    }
    return true;
  });

  // Obter projetos únicos
  const projetos = [
    ...new Map(tarefas.map((t: Tarefa) => [t.id_projeto, t.projeto])).values(),
  ];

  if (carregando && tarefas.length === 0) {
    return (
      <main className="p-8">
        <div className="text-center">
          <p className="text-gray-500">Carregando tarefas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nova Tarefa
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-4 items-end">
        {projetoAtual && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">
              Projeto Ativo: <span className="font-bold">{projetoAtual.nome}</span>
            </p>
          </div>
        )}

        {!projetoAtual && projetos.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Projeto
            </label>
            <select
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os projetos</option>
              {projetos.map((proj: any) => (
                <option key={proj.id} value={proj.id}>
                  {proj.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {colunas.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Coluna
            </label>
            <select
              value={filtroColuna}
              onChange={(e) => setFiltroColuna(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as colunas</option>
              {colunas.map((col: any) => (
                <option key={col.id} value={col.id}>
                  {col.nome}
                </option>
              ))}
              {tarefasSemColuna.length > 0 && (
                <option value="sem_coluna">Sem coluna</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Board */}
      {tarefasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            {projetoAtual 
              ? "Nenhuma tarefa encontrada neste projeto" 
              : "Nenhuma tarefa encontrada. Selecione um projeto na Dashboard para criar tarefas."}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Criar primeira tarefa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colunas.length === 0 ? (
            // Se não há colunas, mostrar todas as tarefas em um grid
            tarefasFiltradas.map((tarefa: Tarefa) => (
              <div
                key={tarefa.id}
                onClick={() => {
                  setTarefaSelecionada(tarefa);
                  setEditModalOpen(true);
                }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">
                    {tarefa.titulo}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded border ${
                      prioridadeColors[tarefa.prioridade as "BAIXA" | "MEDIA" | "ALTA"]
                    }`}
                  >
                    {prioridadeLabels[tarefa.prioridade]}
                  </span>
                </div>

                {tarefa.descricao && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {tarefa.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tarefa.responsavel && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {tarefa.responsavel.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {tarefa.progresso}%
                  </span>
                </div>

                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${tarefa.progresso}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            // Mostrar colunas
            <>
              {colunas.map((coluna: any) => {
                const tarefasColuna = tarefasFiltradas.filter(
                  (t: Tarefa) => t.coluna?.id === coluna.id
                );

                return (
                  <div
                    key={coluna.id}
                    className="bg-gray-50 rounded-lg p-4 min-h-96"
                  >
                    <h2 className="font-semibold text-gray-900 mb-4">
                      {coluna.nome} ({tarefasColuna.length})
                    </h2>

                    <div className="space-y-3">
                      {tarefasColuna.map((tarefa: Tarefa) => (
                        <div
                          key={tarefa.id}
                          onClick={() => {
                            setTarefaSelecionada(tarefa);
                            setEditModalOpen(true);
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm flex-1">
                              {tarefa.titulo}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                                prioridadeColors[tarefa.prioridade as "BAIXA" | "MEDIA" | "ALTA"]
                              }`}
                            >
                              {prioridadeLabels[tarefa.prioridade as "BAIXA" | "MEDIA" | "ALTA"]}
                            </span>
                          </div>

                          {tarefa.descricao && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {tarefa.descricao}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {tarefa.responsavel && (
                                <div
                                  title={tarefa.responsavel.nome}
                                  className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
                                >
                                  {tarefa.responsavel.nome
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {tarefa.progresso}%
                            </span>
                          </div>

                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${tarefa.progresso}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Coluna de tarefas sem coluna */}
              {tarefasSemColuna.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 min-h-96">
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Sem Coluna ({tarefasSemColuna.length})
                  </h2>

                  <div className="space-y-3">
                    {tarefasSemColuna.map((tarefa) => (
                      <div
                        key={tarefa.id}
                        onClick={() => {
                          setTarefaSelecionada(tarefa);
                          setEditModalOpen(true);
                        }}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm flex-1">
                            {tarefa.titulo}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                              prioridadeColors[tarefa.prioridade]
                            }`}
                          >
                            {prioridadeLabels[tarefa.prioridade]}
                          </span>
                        </div>

                        {tarefa.descricao && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {tarefa.responsavel && (
                              <div
                                title={tarefa.responsavel.nome}
                                className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
                              >
                                {tarefa.responsavel.nome
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {tarefa.progresso}%
                          </span>
                        </div>

                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${tarefa.progresso}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCriarTarefa}
        colunas={colunas}
      />

      <EditTaskModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleAtualizarTarefa}
        onDelete={handleDeletarTarefa}
        task={tarefaSelecionada || undefined}
      />
    </main>
  );
}