import { useState, useEffect } from "react";
import { Mail, Plus, Loader, X } from "lucide-react";
import { useEquipesStore } from "@/store/useEquipesStore";
import type { UsuarioEquipe, CargoType } from "@/types/equipe";

export default function EquipePage() {
  const {
    equipes,
    equipeAtiva,
    listar,
    listarMembros,
    convidarMembro,
    carregando,
    erro,
    definirAtiva,
    criar,
  } = useEquipesStore();

  const [membros, setMembros] = useState<UsuarioEquipe[]>([]);
  const [modalType, setModalType] = useState<
    "convidar" | "criar" | null
  >(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "MEMBRO" as CargoType,
  });

  const [formCriar, setFormCriar] = useState({
    nome: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [carregandoMembros, setCarregandoMembros] = useState(false);

  useEffect(() => {
    listar();
  }, [listar]);

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

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function handleConvidar() {
    if (!form.nome || !form.email || !equipeAtiva) {
      setMensagem("Preencha todos os campos");
      return;
    }

    setEnviando(true);

    try {
      await convidarMembro(equipeAtiva.id, {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo,
      });

      setForm({
        nome: "",
        email: "",
        cargo: "MEMBRO",
      });

      setModalType(null);
      setMensagem("Convite enviado com sucesso!");

      await carregarMembros();

      setTimeout(() => {
        setMensagem("");
      }, 3000);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Erro ao convidar membro";

      setMensagem(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleCriarEquipe() {
    if (!formCriar.nome) {
      setMensagem("Digite o nome da equipe");
      return;
    }

    setEnviando(true);

    try {
      const novaEquipe = await criar({
        nome: formCriar.nome,
      });

      setFormCriar({
        nome: "",
      });

      setModalType(null);

      setMensagem("Equipe criada com sucesso!");

      definirAtiva(novaEquipe);

      setTimeout(() => {
        setMensagem("");
      }, 3000);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Erro ao criar equipe";

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
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return cores[hash % cores.length];
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {!equipeAtiva ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            {carregando ? (
              <>
                <Loader
                  className="animate-spin mx-auto mb-4"
                  size={32}
                />

                <p className="text-slate-600">
                  Carregando equipes...
                </p>
              </>
            ) : equipes.length === 0 ? (
              <>
                <p className="text-slate-600 mb-4">
                  Nenhuma equipe encontrada
                </p>

                <p className="text-sm text-slate-500 mb-6">
                  Crie uma equipe para começar
                </p>

                <button
                  onClick={() => setModalType("criar")}
                  className="bg-[#4f35f5] text-white px-6 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-[#3f2bd0] mx-auto"
                >
                  <Plus size={16} />
                  Criar Equipe
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-600 mb-4">
                  Selecione uma equipe
                </p>

                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  onChange={(e) => {
                    const eq = equipes.find(
                      (item) => item.id === e.target.value
                    );

                    if (eq) {
                      definirAtiva(eq);
                    }
                  }}
                >
                  <option value="">
                    Escolha uma equipe...
                  </option>

                  {equipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      ) : (
        <section className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {equipeAtiva.nome}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                {membros.length} membro
                {membros.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={() => setModalType("convidar")}
              className="bg-[#4f35f5] text-white px-5 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-[#3f2bd0]"
            >
              <Plus size={16} />
              Adicionar Membro
            </button>
          </div>

          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {mensagem}
            </div>
          )}

          {carregandoMembros ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin" />
            </div>
          ) : membros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">
                Nenhum membro nesta equipe
              </p>

              <p className="text-sm text-slate-500">
                Convide alguém para começar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-4">
              {membros.map((membro) => (
                <div
                  key={membro.usuario_id}
                  className="bg-white border border-slate-200 rounded-xl p-5"
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-11 h-11 rounded-full ${getCor(
                        membro.usuario_id
                      )} text-white font-bold flex items-center justify-center`}
                    >
                      {getInitials(membro.usuario.nome)}
                    </div>

                    <div>
                      <h2 className="text-sm font-medium text-slate-900">
                        {membro.usuario.nome}
                      </h2>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Mail size={13} />
                        {membro.usuario.email}
                      </div>

                      <div className="mt-2">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] bg-slate-100 text-slate-600">
                          {membro.cargo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MODAL CRIAR */}
      {modalType === "criar" && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white w-[390px] rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                Criar Equipe
              </h2>

              <button onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>

            <label className="text-sm text-slate-700 block mb-2">
              Nome da Equipe
            </label>

            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 outline-none focus:border-indigo-500"
              placeholder="Digite o nome da equipe"
              value={formCriar.nome}
              onChange={(e) =>
                setFormCriar({
                  ...formCriar,
                  nome: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={handleCriarEquipe}
                className="px-4 py-2 bg-[#4f35f5] text-white rounded-lg text-sm"
              >
                {enviando ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONVIDAR */}
      {modalType === "convidar" && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white w-[390px] rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                Adicionar Membro
              </h2>

              <button onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>

            <label className="text-sm block mb-2">
              Nome
            </label>

            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
              value={form.nome}
              onChange={(e) =>
                setForm({
                  ...form,
                  nome: e.target.value,
                })
              }
            />

            <label className="text-sm block mb-2">
              Email
            </label>

            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <label className="text-sm block mb-2">
              Cargo
            </label>

            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6"
              value={form.cargo}
              onChange={(e) =>
                setForm({
                  ...form,
                  cargo: e.target.value as CargoType,
                })
              }
            >
              <option value="MEMBRO">
                Membro
              </option>

              <option value="GERENTE">
                Gerente
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={handleConvidar}
                className="px-4 py-2 bg-[#4f35f5] text-white rounded-lg text-sm"
              >
                {enviando ? "Enviando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}