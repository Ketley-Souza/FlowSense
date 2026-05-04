import { useState } from "react";
import { Bell, Mail, Pencil, Plus, Trash2, X } from "lucide-react";

/* -------------- tipagem dos membros -------------- */

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  color: string;
};

/* ------------ dados mockados front-end ( importante!!) -------------- */

const initialMembers: Member[] = [

  { id: 1, name: "Ana Silva", email: "ana@email.com", role: "Admin", color: "bg-indigo-500" },
  { id: 2, name: "Carlos Souza", email: "carlos@email.com", role: "Developer", color: "bg-blue-400" },
  { id: 3, name: "Maria Santos", email: "maria@email.com", role: "Designer", color: "bg-pink-400" },
  { id: 4, name: "João Lima", email: "joao@email.com", role: "Developer", color: "bg-blue-400" },
  { id: 5, name: "Beatriz Costa", email: "beatriz@email.com", role: "QA", color: "bg-emerald-400" },
];

export default function EquipePage() {

    /* ------------ states ( controle da tela ) -------------- */

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });

  /* ------------ funcao que gera iniciais dos membros ( AS, LB, CD etc...) -------------- */

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /* ------------ abrir e fechar modais -------------- */

  function openCreateModal() {
    setForm({ name: "", email: "", role: "" });
    setSelectedMember(null);
    setModalType("create");
  }

  function openEditModal(member: Member) {
    setSelectedMember(member);
    setForm({ name: member.name, email: member.email, role: member.role });
    setModalType("edit");
  }

  function openDeleteModal(member: Member) {
    setSelectedMember(member);
    setModalType("delete");
  }

  function closeModal() {
    setModalType(null);
    setSelectedMember(null);
  }

  /* ------------ crud ( importante!! )-------------- */

  // create

  function handleAddMember() {
    if (!form.name || !form.email || !form.role) return;

    const newMember: Member = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      role: form.role,
      color: "bg-indigo-500",
    };

    setMembers([...members, newMember]);
    closeModal();
  }

  // update

  function handleEditMember() {
    if (!selectedMember) return;

    setMembers(
      members.map((member) =>
        member.id === selectedMember.id
          ? { ...member, name: form.name, email: form.email, role: form.role }
          : member
      )
    );

    closeModal();
  }

  // delete

  function handleDeleteMember() {
    if (!selectedMember) return;
    setMembers(members.filter((member) => member.id !== selectedMember.id));
    closeModal();
  }

  /* ------------ render -------------- */

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      <section className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Equipe</h1>
            <p className="text-sm text-slate-500 mt-1">{members.length} membros</p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-[#4f35f5] text-white px-5 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-[#3f2bd0]"
          >
            <Plus size={16} />
            Adicionar Membro
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between"
            >
              <div className="flex gap-4">
                <div
                  className={`w-11 h-11 rounded-full ${member.color} text-white font-bold flex items-center justify-center`}
                >
                  {getInitials(member.name)}
                </div>

                <div>
                  <h2 className="text-sm font-medium text-slate-900">{member.name}</h2>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Mail size={13} />
                    {member.email}
                  </div>

                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] bg-indigo-100 text-indigo-600">
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 text-slate-500">
                <button onClick={() => openEditModal(member)}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => openDeleteModal(member)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {(modalType === "create" || modalType === "edit") && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white w-[390px] rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {modalType === "create" ? "Adicionar Membro" : "Editar Perfil"}
              </h2>
              <button onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {/* ------------ formulario -------------- */}

            <label className="text-sm text-slate-700">Nome</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 mb-4 outline-none focus:border-indigo-500"
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="text-sm text-slate-700">Email</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 mb-4 outline-none focus:border-indigo-500"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label className="text-sm text-slate-700">Cargo</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 mb-6 outline-none focus:border-indigo-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />

            {/* ------------ botoes -------------- */}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={modalType === "create" ? handleAddMember : handleEditMember}
                className="px-4 py-2 bg-[#4f35f5] text-white rounded-lg text-sm"
              >
                {modalType === "create" ? "Adicionar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal delete */}

      {modalType === "delete" && selectedMember && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white w-[410px] rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Remover Membro</h2>

            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja remover "{selectedMember.name}" da equipe?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}