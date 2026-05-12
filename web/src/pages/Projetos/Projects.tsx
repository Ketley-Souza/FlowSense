import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BaseModal } from "@/components/Modal";
import { CreateProjectModal } from "./CreateProjectModal";
import { useProjetosStore } from "@/store/useProjetosStore";

export default function Projects() {
  const {
    projetos,
    carregando,
    erro,
    listar,
    criar,
    deletar,
  } = useProjetosStore();

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projetoParaDeletar, setProjetoParaDeletar] = useState<string | null>(
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

  function abrirDeleteModal(projetoId: string) {
    setProjetoParaDeletar(projetoId);
    setDeleteModalOpen(true);
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
          {projetos.map((projeto: any) => (
            <div
              key={projeto.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* COR LATERAL */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-600" />

              {/* HEADER */}
              <div className="flex justify-between items-start mb-3 pl-1">
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">
                    {projeto.nome}
                  </h2>
                  {projeto.descricao && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {projeto.descricao}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => abrirDeleteModal(projeto.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 -mr-2"
                  title="Deletar projeto"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b border-gray-100 pl-1">
                <div>
                  <p className="text-xs text-gray-500">Tarefas</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {projeto._count?.tarefas || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Membros</p>
                  <p className="text-lg font-semibold text-green-600">
                    {projeto.membros?.length || 0}
                  </p>
                </div>
              </div>

              {/* MEMBROS AVATARES */}
              {projeto.membros && projeto.membros.length > 0 && (
                <div className="mb-3 pl-1">
                  <p className="text-xs text-gray-500 mb-2">Equipe</p>
                  <div className="flex gap-2">
                    {projeto.membros.slice(0, 3).map((membro: any) => (
                      <div
                        key={membro.id_usuario}
                        className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white"
                        title={membro.usuario.nome}
                      >
                        {membro.usuario.nome.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {projeto.membros.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                        +{projeto.membros.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DATA CRIAÇÃO */}
              <p className="text-xs text-gray-400 pl-1">
                📅 Criado em {new Date(projeto.createdAt).toLocaleDateString()}
              </p>
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
            ⚠️ Esta ação não pode ser desfeita. Todas as tarefas associadas também serão deletadas.
          </p>
        </div>
      </BaseModal>
    </div>
  );
}