import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "@/components/Modal";
import { useEquipesStore } from "@/store/useEquipesStore";
import { ChevronDown, AlertCircle, Paperclip, X, FileText, Image, File } from "lucide-react";
import { inputParaIso } from "@/utils/dates";
import type { Usuario, Equipe, UsuarioEquipe } from "@/types";
import { projetoService } from "@/services/projetoService";

type Cargo = "GERENTE" | "MEMBRO";

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
    equipe_id?: string;
    data_inicio?: string;
    data_fim?: string;
    membros?: MembroProjeto[];
    anexos?: File[];
  }) => Promise<void>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const equipes = useEquipesStore((state) => state.equipes) as Equipe[];
  const listar = useEquipesStore((state) => state.listar);
  const listarMembros = useEquipesStore((state) => state.listarMembros);

  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const usuarios = todosUsuarios;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [equipeId, setEquipeId] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const [membrosAdicionados, setMembrosAdicionados] = useState<MembroProjeto[]>([]);
  const [mostrarListaMembros, setMostrarListaMembros] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const anexoInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setNome("");
    setDescricao("");
    setEquipeId("");
    setDataInicio("");
    setDataFim("");
    setMembrosAdicionados([]);
    setMostrarListaMembros(false);
    setAnexos([]);
  }

  useEffect(() => {
    if (isOpen) {
      listar();
      projetoService.listarUsuariosParaAdicionar()
        .then(setTodosUsuarios)
        .catch(console.error);
    }
  }, [isOpen, listar]);

  useEffect(() => {
    if (equipeId) {
      listarMembros(equipeId)
        .then((membros) => {
          if (membros && membros.length > 0) {
            const defaultMembros = membros.map((m) => ({
              id_usuario: m.usuario_id,
              cargo: (m.cargo === "ADMIN" || m.cargo === "GERENTE") ? ("GERENTE" as Cargo) : ("MEMBRO" as Cargo),
            }));
            setMembrosAdicionados(defaultMembros);
          }
        })
        .catch(console.error);
    } else {
      setMembrosAdicionados([]);
    }
  }, [equipeId, listarMembros]);

  function adicionarMembro(usuarioId: string, cargo: Cargo = "MEMBRO") {
    const jaExiste = membrosAdicionados.find((m) => m.id_usuario === usuarioId);
    if (!jaExiste) {
      setMembrosAdicionados([...membrosAdicionados, { id_usuario: usuarioId, cargo }]);
    }
  }

  function removerMembro(usuarioId: string) {
    setMembrosAdicionados(membrosAdicionados.filter((m) => m.id_usuario !== usuarioId));
  }

  function alterarCargoMembro(usuarioId: string, novoCargo: Cargo) {
    setMembrosAdicionados(
      membrosAdicionados.map((m) =>
        m.id_usuario === usuarioId ? { ...m, cargo: novoCargo } : m
      )
    );
  }

  function usuarioJaAdicionado(usuarioId: string) {
    return membrosAdicionados.some((m) => m.id_usuario === usuarioId);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setCarregando(true);

    try {
      const membrosUnicos = Array.from(
        new Map(
          membrosAdicionados.map((m) => [m.id_usuario, m])
        ).values()
      );

      await onSubmit({
        nome,
        descricao: descricao || undefined,
        equipe_id: equipeId || undefined,
        data_inicio: inputParaIso(dataInicio),
        data_fim: inputParaIso(dataFim),
        membros: membrosUnicos.length > 0 ? membrosUnicos : undefined,
        anexos: anexos.length > 0 ? anexos : undefined,
      });

      resetForm();
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  function handleAnexoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setAnexos((prev) => {
      const todos = [...prev, ...files];
      //remover dupicatas
      const unicos = todos.filter(
        (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i
      );
      return unicos;
    });
    //input pra reset
    if (anexoInputRef.current) anexoInputRef.current.value = "";
  }

  function removerAnexo(nome: string) {
    setAnexos((prev) => prev.filter((f) => f.name !== nome));
  }

  function iconeAnexo(tipo: string) {
    if (tipo.startsWith("image/")) return <Image size={14} className="text-blue-500 shrink-0" />;
    if (tipo === "application/pdf") return <FileText size={14} className="text-red-500 shrink-0" />;
    return <File size={14} className="text-slate-400 shrink-0" />;
  }

  function tamanhoLegivel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Criar Novo Projeto"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              resetForm();
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipe (opcional)
          </label>
          <select
            value={equipeId}
            onChange={(e) => setEquipeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Nenhuma equipe</option>
            {equipes.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Membros ao Projeto (opcional)
          </label>

          {!usuarios || usuarios.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-700 shrink-0" />
              <span>Nenhum usuário cadastrado no sistema.</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMostrarListaMembros(!mostrarListaMembros)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400"
                >
                  <span className="text-sm text-gray-700">
                    {membrosAdicionados.length > 0
                      ? `${membrosAdicionados.length} membro${membrosAdicionados.length !== 1 ? "s" : ""
                      } adicionado${membrosAdicionados.length !== 1 ? "s" : ""}`
                      : "Selecione membros da equipe..."}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${mostrarListaMembros ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {mostrarListaMembros && (
                  <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {usuarios.map((usuario: Usuario) => (
                      <div
                        key={usuario.id}
                        className={`px-3 py-2 border-b border-gray-100 flex items-center gap-2 ${usuarioJaAdicionado(usuario.id) ? "bg-blue-50" : "hover:bg-gray-50"
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
                          <p className="text-sm font-medium text-gray-900">{usuario.nome}</p>
                          <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {membrosAdicionados.length > 0 && (
                <div className="mt-3 space-y-2">
                  {membrosAdicionados.map((membro: MembroProjeto) => {
                    const usuarioInfo = usuarios.find((u: Usuario) => u.id === membro.id_usuario);
                    return (
                      <div
                        key={membro.id_usuario}
                        className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{usuarioInfo?.nome}</p>
                        </div>
                        <select
                          value={membro.cargo}
                          onChange={(e) =>
                            alterarCargoMembro(membro.id_usuario, e.target.value as Cargo)
                          }
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="MEMBRO">Membro</option>
                          <option value="GERENTE">Gerente</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removerMembro(membro.id_usuario)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── ANEXOS ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anexos (opcional)
          </label>

          <button
            type="button"
            onClick={() => anexoInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full justify-center"
          >
            <Paperclip size={15} />
            Adicionar arquivo(s)
          </button>

          <input
            ref={anexoInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAnexoChange}
          />

          {anexos.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {anexos.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {iconeAnexo(f.type)}
                  <span className="flex-1 truncate text-slate-700">{f.name}</span>
                  <span className="text-slate-400 shrink-0">{tamanhoLegivel(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removerAnexo(f.name)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </BaseModal>
  );
}
