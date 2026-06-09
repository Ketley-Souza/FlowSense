import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, UserPlus, Users } from "lucide-react";
import { useEquipesStore } from "@/store/useEquipesStore";
import { useToastGlobal } from "@/contexts/ToastContext";
import type { CargoConvite, Equipe, StatusFiltro, UsuarioEquipe } from "@/types";

import { TeamHeader } from "./components/TeamHeader";
import { TeamSwitcher } from "./components/TeamSwitcher";
import { TeamInsights } from "./components/TeamInsights";
import { MembersToolbar } from "./components/MembersToolbar";
import { MembersList } from "./components/MembersList";

import { ModalConvidarMembro } from "./ModalConvidarMembro";
import { ModalEditarEquipe } from "./ModalEditarEquipe";
import { ModalCriarEquipe } from "./ModalCriarEquipe";
import { ModalConfirmarDeletar } from "./ModalConfirmarDeletar";
import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[#EEF2F8] px-5 py-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#EDF2F8]" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 animate-pulse rounded bg-[#EDF2F8]" />
        <div className="h-3 w-48 animate-pulse rounded bg-[#EDF2F8]" />
      </div>
      <div className="hidden h-6 w-16 animate-pulse rounded-full bg-[#EDF2F8] lg:block" />
      <div className="hidden h-6 w-20 animate-pulse rounded-full bg-[#EDF2F8] lg:block" />
      <div className="hidden h-4 w-24 animate-pulse rounded bg-[#EDF2F8] lg:block" />
    </div>
  );
}

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
    alterarCargoMembro,
    removerMembro,
  } = useEquipesStore();

  const toast = useToastGlobal();
  const [membros, setMembros] = useState<UsuarioEquipe[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODOS");
  const [modalAberto, setModalAberto] = useState<
    "convidar" | "criar" | "editar" | "confirmar-deletar" | "remover-membro" | null
  >(null);
  const [membroParaRemover, setMembroParaRemover] = useState<string | null>(null);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function resetFiltros() {
    setBusca("");
    setStatusFiltro("TODOS");
  }

  async function recarregarMembrosAtual() {
    if (!equipeAtiva?.id) return;

    setCarregandoMembros(true);
    try {
      const data = await listarMembros(equipeAtiva.id);
      setMembros(data || []);
    } catch {
      setMembros([]);
    } finally {
      setCarregandoMembros(false);
    }
  }

  useEffect(() => {
    listar();
  }, [listar]);

  useEffect(() => {
    const equipeId = equipeAtiva?.id;
    let cancelado = false;

    if (!equipeId) return;

    const equipeIdAtual = equipeId;

    async function carregarMembros() {
      setCarregandoMembros(true);
      try {
        const data = await listarMembros(equipeIdAtual);
        if (!cancelado) setMembros(data || []);
      } catch {
        if (!cancelado) setMembros([]);
      } finally {
        if (!cancelado) setCarregandoMembros(false);
      }
    }

    carregarMembros();

    return () => {
      cancelado = true;
    };
  }, [equipeAtiva?.id, listarMembros]);

  function handleDefinirAtiva(equipe: Equipe) {
    resetFiltros();
    definirAtiva(equipe);
  }

  async function handleConvidar(nome: string, email: string, cargo: CargoConvite) {
    if (!equipeAtiva) return;

    setEnviando(true);
    try {
      await convidarMembro(equipeAtiva.id, { nome, email, cargo });
      toast.sucesso("Convite enviado com sucesso!");
      setModalAberto(null);
      await recarregarMembrosAtual();
    } catch (error) {
      toast.erro(error instanceof Error ? error.message : "Erro ao convidar");
    } finally {
      setEnviando(false);
    }
  }

  async function handleCriarEquipe(nome: string) {
    setEnviando(true);
    try {
      const nova = await criar({ nome });
      toast.sucesso("Equipe criada!");
      resetFiltros();
      definirAtiva(nova);
      setModalAberto(null);
    } catch (error) {
      toast.erro(error instanceof Error ? error.message : "Erro ao criar equipe");
    } finally {
      setEnviando(false);
    }
  }

  async function handleEditarEquipe(nome: string, descricao: string) {
    if (!equipeAtiva) return;

    setEnviando(true);
    try {
      const atualizada = await atualizar(equipeAtiva.id, { nome, descricao });
      toast.sucesso("Equipe atualizada!");
      definirAtiva(atualizada);
      setModalAberto(null);
    } catch (error) {
      toast.erro(error instanceof Error ? error.message : "Erro ao atualizar");
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletarEquipe() {
    if (!equipeAtiva) return;

    setEnviando(true);
    try {
      await deletar(equipeAtiva.id);
      toast.sucesso("Equipe excluída.");
      setModalAberto(null);

      const proxima = equipes.find((equipe) => equipe.id !== equipeAtiva.id);
      if (proxima) {
        resetFiltros();
        definirAtiva(proxima);
      }
    } catch (error) {
      toast.erro(error instanceof Error ? error.message : "Erro ao deletar");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAlterarCargo(membroId: string, novoCargo: "ADMIN" | "GERENTE" | "MEMBRO") {
    if (!equipeAtiva) return;
    try {
      await alterarCargoMembro(equipeAtiva.id, membroId, novoCargo);
      toast.sucesso("Cargo atualizado!");
      await recarregarMembrosAtual();
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao alterar cargo");
    }
  }

  async function handleConfirmarRemover() {
    if (!equipeAtiva || !membroParaRemover) return;
    setEnviando(true);
    try {
      await removerMembro(equipeAtiva.id, membroParaRemover);
      toast.sucesso("Membro removido da equipe.");
      setModalAberto(null);
      setMembroParaRemover(null);
      await recarregarMembrosAtual();
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao remover membro");
    } finally {
      setEnviando(false);
    }
  }

  const totais = useMemo(() => {
    const ativos = membros.filter((membro) => membro.status === "ATIVO").length;
    const pendentes = membros.filter((membro) => membro.status === "PENDENTE").length;
    const gestores = membros.filter((membro) =>
      ["ADMIN", "GERENTE"].includes(membro.cargo)
    ).length;

    return { ativos, pendentes, gestores };
  }, [membros]);

  const membrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return membros.filter((membro) => {
      const correspondeBusca =
        !termo ||
        membro.usuario.nome.toLowerCase().includes(termo) ||
        membro.usuario.email.toLowerCase().includes(termo);
      const correspondeStatus =
        statusFiltro === "TODOS" || membro.status === statusFiltro;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, membros, statusFiltro]);

  if (carregando && equipes.length === 0) {
    return (
      <div className="grid h-64 place-items-center bg-[#F4F7FB] text-[#7E8DA6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#5B35F5]" size={24} />
          <p className="text-sm font-medium">Carregando equipes...</p>
        </div>
      </div>
    );
  }

  if (!carregando && equipes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] px-4 pt-6 md:pt-16 pb-6 lg:pb-8 text-[#202A3D] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-[#202A3D]">Equipe</h1>
            <p className="mt-1 text-sm font-medium text-[#7E8DA6]">
              Gerencie quem acessa seus projetos e mantenha permissões claras.
            </p>
          </header>

          <div className="rounded-2xl border border-dashed border-[#C9D5E6] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF1FF] text-[#5B35F5]">
              <Users size={22} />
            </div>
            <h2 className="text-base font-bold text-[#202A3D]">
              Nenhuma equipe criada
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7E8DA6]">
              Comece com uma equipe enxuta e convide as pessoas certas quando o
              fluxo estiver pronto.
            </p>
            <button
              id="create-first-team"
              onClick={() => setModalAberto("criar")}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#5B35F5] px-5 text-sm font-bold text-white transition hover:bg-[#4D2DE0]"
            >
              <Plus size={16} />
              Criar primeira equipe
            </button>
          </div>
        </div>

        <ModalCriarEquipe
          isOpen={modalAberto === "criar"}
          onClose={() => setModalAberto(null)}
          onSubmit={handleCriarEquipe}
          enviando={enviando}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 pt-6 md:pt-16 pb-6 lg:pb-8 text-[#202A3D] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#202A3D]">Equipe</h1>
            <p className="mt-1 text-sm font-medium text-[#7E8DA6]">
              Veja quem faz parte da sua equipe e acompanhe permissões sem ruído.
            </p>
          </div>

          <div className="shrink-0">
            <TeamSwitcher
              equipes={equipes}
              equipeAtiva={equipeAtiva}
              onSelect={handleDefinirAtiva}
              onNova={() => setModalAberto("criar")}
            />
          </div>
        </header>

        {equipeAtiva && (
          <main className="overflow-hidden rounded-2xl border border-[#DDE7F3] bg-white shadow-sm">
            <TeamHeader
              equipe={equipeAtiva}
              totalMembros={membros.length}
              totalAtivos={totais.ativos}
              onInvite={() => setModalAberto("convidar")}
              onEdit={() => setModalAberto("editar")}
              onDelete={() => setModalAberto("confirmar-deletar")}
            />

            <TeamInsights
              totalMembros={membros.length}
              totalAtivos={totais.ativos}
              totalPendentes={totais.pendentes}
              totalGestores={totais.gestores}
            />

            {erro && (
              <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {erro}
              </div>
            )}

            <MembersToolbar
              busca={busca}
              statusFiltro={statusFiltro}
              totalResultados={membrosFiltrados.length}
              onBuscaChange={setBusca}
              onStatusChange={setStatusFiltro}
            />

            {carregandoMembros ? (
              <div>
                {Array.from({ length: 5 }).map((_, index) => (
                  <MemberRowSkeleton key={index} />
                ))}
              </div>
            ) : (
              <MembersList
                membros={membrosFiltrados}
                busca={busca}
                onClearBusca={() => setBusca("")}
                onInvite={() => setModalAberto("convidar")}
                onAlterarCargo={handleAlterarCargo}
                onRemover={(membroId) => {
                  setMembroParaRemover(membroId);
                  setModalAberto("remover-membro");
                }}
              />
            )}
          </main>
        )}
      </div>

      {equipeAtiva && (
        <button
          id="fab-invite"
          onClick={() => setModalAberto("convidar")}
          className="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#5B35F5] text-white shadow-xl shadow-[#5B35F5]/20 transition hover:bg-[#4D2DE0] sm:hidden"
          title="Convidar membro"
          aria-label="Convidar membro"
        >
          <UserPlus size={20} />
        </button>
      )}

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
        nomeInicial={equipeAtiva?.nome ?? ""}
        descricaoInicial={equipeAtiva?.descricao ?? ""}
        enviando={enviando}
      />
      <ModalConfirmarDeletar
        isOpen={modalAberto === "confirmar-deletar"}
        onClose={() => setModalAberto(null)}
        onConfirm={handleDeletarEquipe}
        equipeName={equipeAtiva?.nome ?? ""}
        enviando={enviando}
      />
      <ConfirmDeleteModal
        isOpen={modalAberto === "remover-membro"}
        onClose={() => {
          setModalAberto(null);
          setMembroParaRemover(null);
        }}
        onConfirm={handleConfirmarRemover}
        title="Remover membro"
        description={`Tem certeza que deseja remover ${
          membros.find((m) => m.usuario_id === membroParaRemover)?.usuario.nome
        } da equipe?`}
        confirmLabel="Remover membro"
        loading={enviando}
      />
    </div>
  );
}
