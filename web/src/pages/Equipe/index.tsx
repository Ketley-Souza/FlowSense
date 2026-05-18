/**
 * Página de Gerenciamento de Equipes
 * Componente refatorado com sub-componentes de modais
 */

import { useState, useEffect } from "react";
import { Mail, Plus, Loader, Edit2, Trash2 } from "lucide-react";
import { useEquipesStore } from "@/store/useEquipesStore";
import { ModalConvidarMembro } from "./ModalConvidarMembro";
import { ModalEditarEquipe } from "./ModalEditarEquipe";
import { ModalCriarEquipe } from "./ModalCriarEquipe";
import { ModalConfirmarDeletar } from "./ModalConfirmarDeletar";
import type { UsuarioEquipe, CargoConvite } from "@/types";

export default function EquipePage() {
  const {
    equipes,
    equipeAtiva,
    listar,
    listarMembros,
    convidarMembro,
    atualizar,
    deletar,
    carregando,
    erro,
    definirAtiva,
    criar,
  } = useEquipesStore();

  const [membros, setMembros] = useState<UsuarioEquipe[]>([]);
  const [modalAberto, setModalAberto] = useState<
    "convidar" | "criar" | "editar" | "confirmar-deletar" | null
  >(null);

  const [mensagem, setMensagem] = useState("");
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Carregar equipes ao montar
  useEffect(() => {
    listar();
  }, [listar]);

  // Carregar membros quando equipe ativa muda
  useEffect(() => {
    if (equipeAtiva) {
      carregarMembros();
    }
  }, [equipeAtiva]);

  async function carregarMembros() {
    if (!equipeAtiva) return;
    setCarregandoMembros(true);
    try {
      const data = await listarMembros(equipeAtiva.id);
      setMembros(data || []);
    } catch (error) {
      console.error(error);
      setMembros([]);
    } finally {
      setCarregandoMembros(false);
    }
  }

  async function handleConvidar(nome: string, email: string, cargo: CargoConvite) {
    if (!equipeAtiva) return;
    setEnviando(true);

    try {
      await convidarMembro(equipeAtiva.id, { nome, email, cargo });
      setMensagem("Convite enviado com sucesso!");
      setModalAberto(null);
      await carregarMembros();

      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao convidar";
      setMensagem(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleCriarEquipe(nome: string) {
    setEnviando(true);
    try {
      const novaEquipe = await criar({ nome });
      setMensagem("Equipe criada com sucesso!");
      definirAtiva(novaEquipe);
      setModalAberto(null);

      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar equipe";
      setMensagem(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEditarEquipe(nome: string, descricao: string) {
    if (!equipeAtiva) return;
    setEnviando(true);

    try {
      const equipeAtualizada = await atualizar(equipeAtiva.id, {
        nome,
        descricao,
      });
      setMensagem("Equipe atualizada com sucesso!");
      definirAtiva(equipeAtualizada);
      setModalAberto(null);

      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar";
      setMensagem(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletarEquipe() {
    if (!equipeAtiva) return;
    setEnviando(true);

    try {
      await deletar(equipeAtiva.id);
      setMensagem("Equipe deletada com sucesso!");
      setModalAberto(null);

      // Selecionar primeira equipe disponível
      if (equipes.length > 1) {
        const proximaEquipe = equipes.find((eq) => eq.id !== equipeAtiva.id);
        if (proximaEquipe) {
          definirAtiva(proximaEquipe);
        }
      }

      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao deletar";
      setMensagem(msg);
    } finally {
      setEnviando(false);
    }
  }

  const cores = [
    "bg-indigo-500",
    "bg-blue-400",
    "bg-pink-400",
    "bg-emerald-400",
    "bg-orange-400",
    "bg-purple-400",
    "bg-red-400",
    "bg-green-400",
  ];

  function getCor(id: string) {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cores[hash % cores.length];
  }

  // ===== RENDERIZAÇÃO =====

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Mensagem de Feedback */}
      {mensagem && (
        <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg border border-blue-300 z-40">
          {mensagem}
        </div>
      )}

      {/* SEÇÃO: Seletor de Equipe */}
      {carregando || equipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          {carregando && (
            <>
              <Loader className="animate-spin" size={32} />
              <p className="text-slate-600">Carregando equipes...</p>
            </>
          )}
          {!carregando && equipes.length === 0 && (
            <>
              <p className="text-slate-600 text-lg">Nenhuma equipe encontrada</p>
              <button
                onClick={() => setModalAberto("criar")}
                className="bg-[#4f35f5] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} />
                Criar Equipe
              </button>
            </>
          )}
        </div>
      ) : (
        <section className="p-8">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Equipes</h1>

              {/* Lista de Equipes */}
              <div className="flex flex-wrap gap-2">
                {equipes.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => definirAtiva(eq)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      equipeAtiva?.id === eq.id
                        ? "bg-[#4f35f5] text-white"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {eq.nome} {eq.eh_pessoal && <span className="ml-1">(Pessoal)</span>}
                  </button>
                ))}
                <button
                  onClick={() => setModalAberto("criar")}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Nova
                </button>
              </div>
            </div>
          </div>

          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erro}
            </div>
          )}

          {/* SEÇÃO: Detalhes da Equipe */}
          {equipeAtiva && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {equipeAtiva.nome}
                    </h2>
                    {equipeAtiva.eh_pessoal && (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                        Pessoal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {membros.length} membro{membros.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModalAberto("convidar")}
                    className="bg-[#4f35f5] text-white px-5 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-[#3f2bd0]"
                  >
                    <Plus size={16} />
                    Adicionar Membro
                  </button>

                  {!equipeAtiva.eh_pessoal && (
                    <>
                      <button
                        onClick={() => setModalAberto("editar")}
                        className="bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-300"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>

                      <button
                        onClick={() => setModalAberto("confirmar-deletar")}
                        className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                        Deletar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* SEÇÃO: Lista de Membros */}
              {carregandoMembros ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="animate-spin" />
                </div>
              ) : membros.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Nenhum membro nesta equipe</p>
                  <p className="text-sm text-slate-500">
                    Convide alguém para começar
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membros.map((membro) => (
                    <div
                      key={membro.usuario_id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
                    >
                      <div className="flex gap-4">
                        <div
                          className={`${getCor(membro.usuario_id)} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold`}
                        >
                          {membro.usuario.nome
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {membro.usuario.nome}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {membro.usuario.email}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="inline-block px-2 py-1 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                              {membro.cargo}
                            </span>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                membro.status === "ATIVO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {membro.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* MODAIS */}
      <ModalConvidarMembro
        isOpen={modalAberto === "convidar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleConvidar}
        enviando={enviando}
      />

      <ModalCriarEquipe
        isOpen={modalAberto === "criar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleCriarEquipe}
        enviando={enviando}
      />

      <ModalEditarEquipe
        isOpen={modalAberto === "editar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleEditarEquipe}
        nomeInicial={equipeAtiva?.nome || ""}
        descricaoInicial={equipeAtiva?.descricao || ""}
        enviando={enviando}
      />

      <ModalConfirmarDeletar
        isOpen={modalAberto === "confirmar-deletar"}
        onClose={() => setModalAberto(null)}
        onConfirm={handleDeletarEquipe}
        equipeName={equipeAtiva?.nome || ""}
        enviando={enviando}
      />
    </div>
  );
}
