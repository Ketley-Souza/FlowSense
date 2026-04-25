import React, { useState } from "react";
import { Bell, CircleUserRound, Shield } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState(false);
  const [comments, setComments] = useState(false);

  const handleSave = () => {
    alert("Configurações salvas.");
  };

  const handleUploadPhoto = () => {
    alert("Botão de alterar foto funcionando.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex h-14 items-center justify-end border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 text-slate-400">
          <button type="button" className="transition hover:text-slate-600" aria-label="Notificações">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <span className="text-sm font-medium text-slate-600">Usuário</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie suas preferências</p>
        </div>

        <div className="space-y-5">
          <SectionCard icon={<CircleUserRound size={18} />} title="Perfil">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 ring-4 ring-slate-50" />
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Alterar foto
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Nome</span>
                <input
                  type="text"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                <input
                  type="email"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard icon={<Bell size={18} />} title="Notificações">
            <div className="space-y-4">
              {[
                ["Notificações por email", "Receba atualizações no seu email", emailNotifs, setEmailNotifs],
                ["Notificações push", "Notificações no navegador", pushNotifs, setPushNotifs],
                ["Atualizações de tarefas", "Quando tarefas são criadas ou atualizadas", taskUpdates, setTaskUpdates],
                ["Comentários", "Quando alguém comentar em suas tarefas", comments, setComments],
              ].map(([title, desc, checked, setter]) => (
                <div key={title as string} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{title as string}</p>
                    <p className="text-xs text-slate-400">{desc as string}</p>
                  </div>
                  <Toggle
                    checked={checked as boolean}
                    onChange={() => (setter as React.Dispatch<React.SetStateAction<boolean>>)((v) => !v)}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<Shield size={18} />} title="Segurança">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Senha atual</span>
                <input
                  type="password"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Nova senha</span>
                <input
                  type="password"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </SectionCard>

          <div className="flex justify-end pb-4">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
