import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Folder, AlertTriangle } from "lucide-react";
import { BaseModal } from "@/components/Modal";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { useProjetosStore } from "@/store/useProjetosStore";
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

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projetoParaDeletar, setProjetoParaDeletar] = useState<string | null>(
    null
  );
  const [projetoParaEditar, setProjetoParaEditar] = useState<Projeto | null>(
    null
  );

  // Carregar projetos ao montar
  useEffect(() => {
    listar();
  }, [listar]);

  async function handleCriarProjeto(payload: {
    nome: string;
    descricao?: string;
    membros?: Array<{ id_usuario: string; cargo: "GERENTE" | "MEMBRO" }>;
  }) {
    try {
      await criar(payload);
      setCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar projeto");
    }
  }

  async function handleDeletarProjeto() {
    if (!projetoParaDeletar) return;

    try {
      await deletar(projetoParaDeletar);
      setDeleteModalOpen(false);
      setProjetoParaDeletar(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar projeto");
    }
  }

  async function handleEditarProjeto(data: { nome: string; descricao?: string }) {
    if (!projetoParaEditar) return;

    try {
      await atualizar(projetoParaEditar.id, data);
      setEditModalOpen(false);
      setProjetoParaEditar(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar projeto");
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
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-gray-500">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* TOPO */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projetos.length} projeto{projetos.length !== 1 ? "s" : ""} criado
            {projetos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {erro}
        </div>
      )}

      {/* GRID */}
      {projetos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Nenhum projeto criado ainda</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projetos.map((projeto: Projeto) => (
            <div
              key={projeto.id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* COR LATERAL ESQUERDA */}
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{
                  background:
                    projeto.cor ||
                    `hsl(${Math.random() * 360}, 70%, 60%)`,
                }}
              />

              {/* HEADER COM ÍCONE E BOTÕES */}
              <div className="flex items-start justify-between mb-3 pl-1">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Folder size={20} className="text-indigo-600" />
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

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirEditModal(projeto)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar projeto"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => abrirDeleteModal(projeto.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Deletar projeto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div className="mb-3 pl-1">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  Em andamento
                </span>
              </div>

              {/* PROGRESSO */}
              <div className="mb-4 pl-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600">Progresso</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {projeto.membros?.length || 0} membro
                    {projeto.membros?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${projeto._count?.tarefas ? Math.min(
                        ((projeto._count.tarefas || 0) / Math.max(projeto._count.tarefas, 1)) * 100,
                        100
                      ) : 0}%`,
                      background: projeto.cor
                        ? projeto.cor
                        : "linear-gradient(to right, #4f35f5, #6c2bd9)",
                    }}
                  />
                </div>
              </div>

              {/* INFORMAÇÕES */}
              <div className="flex gap-4 text-xs text-gray-600 pl-1 py-3 border-t border-gray-100">
                <div>
                  <p className="text-gray-500">Tarefas</p>
                  <p className="font-semibold text-gray-900">
                    {projeto._count?.tarefas || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Data Início</p>
                  <p className="font-semibold text-gray-900">
                    {projeto.data_inicio
                      ? new Date(projeto.data_inicio).toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "2-digit" }
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Data Fim</p>
                  <p className="font-semibold text-gray-900">
                    {projeto.data_fim
                      ? new Date(projeto.data_fim).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              {/* EQUIPE */}
              {projeto.membros && projeto.membros.length > 0 && (
                <div className="mt-3 pl-1">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Equipe
                  </p>
                  <div className="flex -space-x-2">
                    {projeto.membros.slice(0, 3).map((membro: ProjetoMembro) => (
                      membro.usuario && (
                        <div
                          key={membro.id_usuario}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white"
                          style={{
                            backgroundColor: `hsl(${membro.id_usuario
                              .split("")
                              .reduce(
                                (acc, char) => acc + char.charCodeAt(0),
                                0
                              ) % 360}, 70%, 60%)`,
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
                    ))}
                    {projeto.membros.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 border-2 border-white">
                        +{projeto.membros.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
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

      {/* MODAL DELETAR PROJETO */}
      <BaseModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjetoParaDeletar(null);
        }}
        title="Deletar Projeto"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setProjetoParaDeletar(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeletarProjeto}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Deletar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-700">
            Tem certeza que deseja deletar o projeto{" "}
            <strong>{projetoSelecionado?.nome}</strong>?
          </p>
          <p className="text-sm text-red-600">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            Esta ação não pode ser desfeita. Todas as tarefas associadas também serão deletadas.
          </p>
        </div>
      </BaseModal>
    </div>
  );
}