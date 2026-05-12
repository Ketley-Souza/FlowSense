import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";
import { useEquipesStore } from "@/store/useEquipesStore";
import { ChevronDown } from "lucide-react";

type Cargo = "GERENTE" | "MEMBRO";

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

interface MembroProjeto {
  id_usuario: string;
  cargo: Cargo;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nome: string;
    descricao?: string;
    membros?: MembroProjeto[];
  }) => Promise<void>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const usuarios = useEquipesStore(
    (state) => state.usuarios
  ) as Usuario[];

  const listar = useEquipesStore((state) => state.listar);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [membrosAdicionados, setMembrosAdicionados] = useState<MembroProjeto[]>(
    []
  );

  const [mostrarListaMembros, setMostrarListaMembros] = useState(false);

  useEffect(() => {
    if (isOpen) {
      listar();
    }
  }, [isOpen, listar]);

  function adicionarMembro(
    usuarioId: string,
    cargo: Cargo = "MEMBRO"
  ) {
    const jaExiste = membrosAdicionados.find(
      (m: MembroProjeto) => m.id_usuario === usuarioId
    );

    if (!jaExiste) {
      setMembrosAdicionados([
        ...membrosAdicionados,
        {
          id_usuario: usuarioId,
          cargo,
        },
      ]);
    }
  }

  function removerMembro(usuarioId: string) {
    setMembrosAdicionados(
      membrosAdicionados.filter(
        (m: MembroProjeto) => m.id_usuario !== usuarioId
      )
    );
  }

  function alterarCargoMembro(
    usuarioId: string,
    novoCargo: Cargo
  ) {
    setMembrosAdicionados(
      membrosAdicionados.map((m: MembroProjeto) =>
        m.id_usuario === usuarioId
          ? { ...m, cargo: novoCargo }
          : m
      )
    );
  }

  function usuarioJaAdicionado(usuarioId: string) {
    return membrosAdicionados.some(
      (m: MembroProjeto) => m.id_usuario === usuarioId
    );
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    setCarregando(true);

    try {
      await onSubmit({
        nome,
        descricao: descricao || undefined,
        membros:
          membrosAdicionados.length > 0
            ? membrosAdicionados
            : undefined,
      });

      setNome("");
      setDescricao("");
      setMembrosAdicionados([]);

      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Projeto"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              setNome("");
              setDescricao("");
              setMembrosAdicionados([]);
            }}
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
            {carregando ? "Criando..." : "Criar"}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Membros da Equipe (opcional)
          </label>

          {!usuarios || usuarios.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              📋 Nenhum membro criado na equipe.
            </div>
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarListaMembros(!mostrarListaMembros)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400"
                >
                  <span className="text-sm text-gray-700">
                    {membrosAdicionados.length > 0
                      ? `${membrosAdicionados.length} membro${
                          membrosAdicionados.length !== 1 ? "s" : ""
                        } adicionado${
                          membrosAdicionados.length !== 1 ? "s" : ""
                        }`
                      : "Selecione membros da equipe..."}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      mostrarListaMembros
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {mostrarListaMembros && (
                  <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {usuarios.map((usuario: Usuario) => (
                      <div
                        key={usuario.id}
                        className={`px-3 py-2 border-b border-gray-100 flex items-center gap-2 ${
                          usuarioJaAdicionado(usuario.id)
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={usuarioJaAdicionado(usuario.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              adicionarMembro(usuario.id);
                            } else {
                              removerMembro(usuario.id);
                            }
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {usuario.nome}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {membrosAdicionados.length > 0 && (
                <div className="mt-3 space-y-2">
                  {membrosAdicionados.map(
                    (membro: MembroProjeto) => {
                      const usuarioInfo = usuarios.find(
                        (u: Usuario) =>
                          u.id === membro.id_usuario
                      );

                      return (
                        <div
                          key={membro.id_usuario}
                          className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {usuarioInfo?.nome}
                            </p>
                          </div>

                          <select
                            value={membro.cargo}
                            onChange={(e) =>
                              alterarCargoMembro(
                                membro.id_usuario,
                                e.target.value as Cargo
                              )
                            }
                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="MEMBRO">
                              Membro
                            </option>

                            <option value="GERENTE">
                              Gerente
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              removerMembro(
                                membro.id_usuario
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </form>
    </BaseModal>
  );
}