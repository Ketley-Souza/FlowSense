import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Folder, AlertTriangle } from "lucide-react";
import { BaseModal } from "@/components/Modal";
import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { useProjetosStore } from "@/store/useProjetosStore";
import { useToastGlobal } from "@/contexts/ToastContext";
import { gerarCorProjetoIndexada } from "@/utils/colors";
import { formatarData, projetoAtrasado, faltaDoisDias } from "@/utils/dates";
import type { Projeto, ProjetoMembro } from "@/types";

export default function Projects() {
  const {
    projetos,
    carregando,
    erro,
    listar,
    criar,
    deletar,
    atualizar,
  } = useProjetosStore();

  const toast = useToastGlobal();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projetoParaDeletar, setProjetoParaDeletar] = useState<string | null>(null);
  const [projetoParaEditar, setProjetoParaEditar] = useState<Projeto | null>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    listar();
  }, [listar]);

  async function handleCriarProjeto(payload: {
    nome: string;
    descricao?: string;
    equipe_id?: string;
    data_inicio?: string;
    data_fim?: string;
    membros?: Array<{ id_usuario: string; cargo: "GERENTE" | "MEMBRO" }>;
  }) {
    try {
      await criar(payload);
      setCreateModalOpen(false);
      toast.sucesso("Projeto criado com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao criar projeto");
    }
  }

  async function handleDeletarProjeto() {
    if (!projetoParaDeletar) return;
    setDeletando(true);
    try {
      await deletar(projetoParaDeletar);
      setDeleteModalOpen(false);
      setProjetoParaDeletar(null);
      toast.sucesso("Projeto excluído com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao deletar projeto");
    } finally {
      setDeletando(false);
    }
  }

  async function handleEditarProjeto(data: {
    nome: string;
    descricao?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    if (!projetoParaEditar) return;
    try {
      await atualizar(projetoParaEditar.id, data);
      setEditModalOpen(false);
      setProjetoParaEditar(null);
      toast.sucesso("Projeto atualizado com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao atualizar projeto");
    }
  }

  function abrirDeleteModal(projetoId: string) {
    setProjetoParaDeletar(projetoId);
    setDeleteModalOpen(true);
  }

  function abrirEditModal(projeto: Projeto) {
    setProjetoParaEditar(projeto);
    setEditModalOpen(true);
  }

  const projetoSelecionado = projetos.find((p) => p.id === projetoParaDeletar);

  if (carregando && projetos.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-slate-50 min-h-screen">
        <p className="text-gray-500">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-slate-50 min-h-screen">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projetos.length} projeto{projetos.length !== 1 ? "s" : ""} criado
            {projetos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 h-10 px-5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          {erro}
        </div>
      )}

      {/* GRID */}
      {projetos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Nenhum projeto criado ainda</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-[37px] items-center gap-2 rounded-full bg-[#5B35F5] px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(91,53,245,0.25)] transition hover:bg-[#4D2DE0]"
          >
            <Plus size={16} />
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projetos.map((projeto: Projeto, index: number) => {
            const estaAtrasado = projetoAtrasado(projeto.data_fim);
            const falta2Dias = faltaDoisDias(projeto.data_fim);
            const cor = gerarCorProjetoIndexada(projeto.id, index);

            const totalTarefas = projeto._count?.tarefas ?? 0;
            const tarefasConcluidas = (projeto.tarefas ?? []).filter(
              (t) => (t.progresso ?? 0) >= 100
            ).length;
            const temDetalheTarefas =
              Array.isArray(projeto.tarefas) && projeto.tarefas.length > 0;
            const percentualProgresso =
              totalTarefas > 0 && temDetalheTarefas
                ? Math.round((tarefasConcluidas / totalTarefas) * 100)
                : 0;

            return (
              <div
                key={projeto.id}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* COR LATERAL ESQUERDA */}
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ background: cor }}
                />

                {/* HEADER COM ÍCONE E BOTÕES */}
                <div className="flex items-start justify-between mb-3 pl-1">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${cor}20` }}>
                      <Folder size={20} style={{ color: cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">
                        {projeto.nome}
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {projeto.descricao || "Sem descrição"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => abrirEditModal(projeto)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors"
                      title="Editar projeto"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => abrirDeleteModal(projeto.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors"
                      title="Deletar projeto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* ALERTAS DE PRAZO */}
                {(estaAtrasado || falta2Dias) && (
                  <div
                    className={`mb-3 pl-1 flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg ${
                      estaAtrasado
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <AlertTriangle size={14} />
                    {estaAtrasado ? "Projeto atrasado" : "Prazo em 2 dias"}
                  </div>
                )}

                {/* PROGRESSO */}
                <div className="mb-4 pl-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Progresso</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {temDetalheTarefas
                        ? `${tarefasConcluidas} de ${totalTarefas} concluída${tarefasConcluidas !== 1 ? "s" : ""}`
                        : `${totalTarefas} tarefa${totalTarefas !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentualProgresso}%`, background: cor }}
                    />
                  </div>
                </div>

                {/* INFORMAÇÕES */}
                <div className="flex gap-4 text-xs text-gray-600 pl-1 py-3 border-t border-gray-100">
                  <div>
                    <p className="text-gray-500">Tarefas</p>
                    <p className="font-semibold text-gray-900">{projeto._count?.tarefas || 0}</p>
                  </div>
                  {projeto.data_inicio && (
                    <div>
                      <p className="text-gray-500">Início</p>
                      <p className="font-semibold text-gray-900">{formatarData(projeto.data_inicio)}</p>
                    </div>
                  )}
                  {projeto.data_fim && (
                    <div>
                      <p className="text-gray-500">Fim</p>
                      <p className="font-semibold text-gray-900">{formatarData(projeto.data_fim)}</p>
                    </div>
                  )}
                </div>

                {/* EQUIPE */}
                {projeto.membros && projeto.membros.length > 0 && (
                  <div className="mt-3 pl-1">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Equipe</p>
                    <div className="flex -space-x-2">
                      {projeto.membros.slice(0, 3).map((membro: ProjetoMembro) =>
                        membro.usuario && (
                          <div
                            key={membro.id_usuario}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white"
                            style={{
                              backgroundColor: `hsl(${membro.id_usuario
                                .split("")
                                .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 60%)`,
                            }}
                            title={membro.usuario.nome}
                          >
                            {membro.usuario.nome
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )
                      )}
                      {projeto.membros.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 border-2 border-white">
                          +{projeto.membros.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CRIAR PROJETO */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCriarProjeto}
      />

      {/* MODAL EDITAR PROJETO */}
      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setProjetoParaEditar(null);
        }}
        onSubmit={handleEditarProjeto}
        project={projetoParaEditar || undefined}
      />

      {/* MODAL DELETAR PROJETO — ConfirmDeleteModal em vez de alert/confirm */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjetoParaDeletar(null);
        }}
        onConfirm={handleDeletarProjeto}
        title="Excluir projeto"
        description={`Tem certeza que deseja excluir o projeto "${projetoSelecionado?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir projeto"
        loading={deletando}
      />
    </div>
  );
}
