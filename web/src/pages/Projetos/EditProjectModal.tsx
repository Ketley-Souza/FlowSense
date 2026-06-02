import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";
import { inputParaIso, isoParaInput } from "@/utils/dates";
import type { Projeto, Usuario } from "@/types";
import { useProjetosStore } from "@/store/useProjetosStore";
import { getUsuarioLogado } from "@/services/auth";
import { projetoService } from "@/services/projetoService";
import { useToastGlobal } from "@/contexts/ToastContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Users, Plus, Trash2 } from "lucide-react";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nome: string;
    descricao?: string;
    data_inicio?: string;
    data_fim?: string;
  }) => Promise<void>;
  project?: Projeto;
}

export function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: EditProjectModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState("");
  const [salvandoMembro, setSalvandoMembro] = useState(false);
  const toast = useToastGlobal();

  const store = useProjetosStore();
  const usuarioLogado = getUsuarioLogado();

  useEffect(() => {
    if (project && isOpen) {
      setNome(project.nome);
      setDescricao(project.descricao || "");
      setDataInicio(isoParaInput(project.data_inicio));
      setDataFim(isoParaInput(project.data_fim));
    }
  }, [project, isOpen]);

  useEffect(() => {
    if (isOpen) {
      projetoService.listarUsuariosParaAdicionar()
        .then(setTodosUsuarios)
        .catch(console.error);
    }
  }, [isOpen]);

  const membrosProjetoIds = new Set(project?.membros?.map((m) => m.id_usuario) || []);
  const usuariosNaoMembros = todosUsuarios.filter((u) => !membrosProjetoIds.has(u.id));

  async function handleAdicionarMembro() {
    if (!project || !usuarioSelecionadoId) return;
    setSalvandoMembro(true);
    try {
      await store.adicionarMembro(project.id, usuarioSelecionadoId, "MEMBRO");
      setUsuarioSelecionadoId("");
      toast.sucesso("Membro adicionado com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao adicionar membro");
    } finally {
      setSalvandoMembro(false);
    }
  }

  async function handleRemoverMembro(usuarioId: string) {
    if (!project) return;
    setSalvandoMembro(true);
    try {
      await store.removerMembro(project.id, usuarioId);
      toast.sucesso("Membro removido com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao remover membro");
    } finally {
      setSalvandoMembro(false);
    }
  }

  async function handleAlterarCargo(usuarioId: string, cargo: "GERENTE" | "MEMBRO") {
    if (!project) return;
    setSalvandoMembro(true);
    try {
      await store.atualizarCargoMembro(project.id, usuarioId, cargo);
      toast.sucesso("Cargo do membro atualizado!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao atualizar cargo");
    } finally {
      setSalvandoMembro(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      await onSubmit({
        nome,
        descricao: descricao || undefined,
        data_inicio: inputParaIso(dataInicio),
        data_fim: inputParaIso(dataFim),
      });
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Projeto"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={carregando || !nome}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Projeto *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex: App Mobile"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do projeto..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início (opcional)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim (opcional)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ── EQUIPE E MEMBROS DO PROJETO ── */}
        <div className="border-t border-gray-200 my-4 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <Users size={16} className="text-blue-600" />
            Membros do Projeto
          </h3>

          {/* Adicionar Novo Membro */}
          <div className="flex gap-2 mb-4">
            <select
              value={usuarioSelecionadoId}
              onChange={(e) => setUsuarioSelecionadoId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Selecione um usuário para adicionar...</option>
              {usuariosNaoMembros.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdicionarMembro}
              disabled={!usuarioSelecionadoId || salvandoMembro}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          {/* Lista de Membros Atuais */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {project?.membros && project.membros.length > 0 ? (
              project.membros.map((membro) => {
                const isCurrentUser = membro.id_usuario === usuarioLogado?.id;
                return (
                  <div
                    key={membro.id_usuario}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar
                        nome={membro.usuario?.nome || ""}
                        foto_url={membro.usuario?.foto_url}
                        size={28}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {membro.usuario?.nome} {isCurrentUser && <span className="text-xs text-blue-600 font-semibold">(Você)</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{membro.usuario?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={membro.cargo}
                        onChange={(e) =>
                          handleAlterarCargo(membro.id_usuario, e.target.value as "GERENTE" | "MEMBRO")
                        }
                        disabled={isCurrentUser || salvandoMembro}
                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                      >
                        <option value="MEMBRO">Membro</option>
                        <option value="GERENTE">Gerente</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoverMembro(membro.id_usuario)}
                        disabled={isCurrentUser || salvandoMembro}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                        title={isCurrentUser ? "Você não pode se remover" : "Remover do projeto"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">Nenhum membro no projeto.</p>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
