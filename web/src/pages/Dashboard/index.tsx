import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  MoreVertical,
  Trash2,
  Users,
  Check,
  CircleDot,
} from "lucide-react";
import { useProjetosStore } from "@/store/useProjetosStore";

/* ------------ tipagem das atividades recentes -------------- */
type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  color: string;
  read: boolean;
};

/* ------------ dados mockados front-end -------------- */
const recentProjects = [
  {
    id: 1,
    name: "Redesign do App",
    tasks: "12 tarefas",
    progress: 65,
    color: "bg-indigo-100 text-indigo-600",
    bar: "bg-[#4f35f5]",
  },
  {
    id: 2,
    name: "API Gateway",
    tasks: "8 tarefas",
    progress: 30,
    color: "bg-emerald-100 text-emerald-600",
    bar: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Landing Page",
    tasks: "5 tarefas",
    progress: 90,
    color: "bg-orange-100 text-orange-500",
    bar: "bg-orange-400",
  },
];

const initialActivities: Activity[] = [
  {
    id: 1,
    title: "Nova tarefa atribuída",
    description: "Você foi atribuído à tarefa 'UI/UX Design'",
    time: "5 min atrás",
    color: "bg-blue-500",
    read: false,
  },
  {
    id: 2,
    title: "Projeto concluído",
    description: "O projeto 'Landing Page' foi marcado como concluído",
    time: "1 hora atrás",
    color: "bg-emerald-500",
    read: false,
  },
  {
    id: 3,
    title: "Prazo próximo",
    description: "A tarefa 'Machine Learning Progress' vence amanhã",
    time: "2 horas atrás",
    color: "bg-orange-400",
    read: true,
  },
  {
    id: 4,
    title: "Novo comentário",
    description: "Carlos comentou na tarefa 'Blog Copywriting'",
    time: "3 horas atrás",
    color: "bg-blue-500",
    read: true,
  },
  {
    id: 5,
    title: "Membro adicionado",
    description: "Beatriz Costa foi adicionada ao projeto 'API Gateway'",
    time: "1 dia atrás",
    color: "bg-blue-500",
    read: true,
  },
];

export default function DashboardPage() {
  /* ------------ stores -------------- */
  const { projetos, projetoAtual, listar, definirProjetoAtivo, carregando } = useProjetosStore();

  /* ------------ states -------------- */
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  /* ------------ efeitos -------------- */
  useEffect(() => {
    listar();
  }, [listar]);

  /* ------------ ações das notificações/atividades -------------- */
  function markAsRead(id: number) {
    setActivities(
      activities.map((activity) =>
        activity.id === id ? { ...activity, read: true } : activity
      )
    );

    setOpenMenuId(null);
  }

  function markAsUnread(id: number) {
    setActivities(
      activities.map((activity) =>
        activity.id === id ? { ...activity, read: false } : activity
      )
    );

    setOpenMenuId(null);
  }

  function deleteActivity(id: number) {
    setActivities(activities.filter((activity) => activity.id !== id));
    setOpenMenuId(null);
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8 pt-10">
      {/* ------------ título -------------- */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral dos seus projetos e tarefas
          </p>
        </div>

        {/* Seletor de Projeto Ativo */}
        {projetos.length > 0 && (
          <div className="flex flex-col items-end gap-2">
            <label className="text-xs font-semibold text-slate-600">Projeto Ativo:</label>
            <select
              value={projetoAtual?.id || ""}
              onChange={(e) => {
                const projeto = projetos.find((p) => p.id === e.target.value);
                definirProjetoAtivo(projeto || null);
              }}
              disabled={carregando}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecione um projeto...</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ------------ cards de resumo -------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Projetos</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">3</h2>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <CalendarDays size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Concluídas</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">4</h2>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Em Progresso</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">2</h2>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Membros</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">4</h2>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* ------------ conteúdo principal -------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* projetos recentes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[470px]">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-base font-semibold text-slate-900">
              Projetos Recentes
            </h2>

            <button className="text-sm text-[#4f35f5] hover:underline">
              Ver todos →
            </button>
          </div>

          <div className="space-y-7">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${project.color}`}
                  >
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500">{project.tasks}</p>
                  </div>
                </div>

                <div className="w-[110px]">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>

                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${project.bar}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* atividade recente */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[470px]">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-base font-semibold text-slate-900">
              Atividade Recente
            </h2>

            <button className="text-sm text-[#4f35f5] hover:underline">
              Ver todas →
            </button>
          </div>

          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-4 group">
                <span
                  className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}
                />

                <div className="flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      activity.read ? "text-slate-800" : "text-slate-950"
                    }`}
                  >
                    {activity.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {activity.description}
                  </p>

                  <span className="text-xs text-slate-400 mt-2 block">
                    {activity.time}
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === activity.id ? null : activity.id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>

                  {openMenuId === activity.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
                      {!activity.read && (
                        <button
                          onClick={() => markAsRead(activity.id)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Check size={14} />
                          Marcar como lido
                        </button>
                      )}
                      {activity.read && (
                        <button
                          onClick={() => markAsUnread(activity.id)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <CircleDot size={14} />
                          Marcar como não lido
                        </button>
                      )}
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-200"
                      >
                        <Trash2 size={14} />
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhuma atividade recente encontrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}