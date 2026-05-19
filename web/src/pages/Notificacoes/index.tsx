import { useState, useEffect } from "react";
import {
  Check,
  CheckCheck,
  CircleAlert,
  CircleDot,
  Info,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";

/* ------------ tipagem das notificações -------------- */
type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  group: "Hoje" | "Ontem" | "Mais Antigas";
  type: "info" | "success" | "warning";
  read: boolean;
};

/* ------------ dados mockados front-end -------------- */
const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Nova tarefa atribuída",
    description: "Você foi atribuído à tarefa 'UI/UX Design'",
    time: "5 min atrás",
    group: "Hoje",
    type: "info",
    read: false,
  },
  {
    id: 2,
    title: "Projeto concluído",
    description: "O projeto 'Landing Page' foi marcado como concluído",
    time: "1 hora atrás",
    group: "Hoje",
    type: "success",
    read: false,
  },
  {
    id: 3,
    title: "Prazo próximo",
    description: "A tarefa 'Machine Learning Progress' vence amanhã",
    time: "1 dia atrás",
    group: "Ontem",
    type: "warning",
    read: true,
  },
  {
    id: 4,
    title: "Novo comentário",
    description: "Carlos comentou na tarefa 'Blog Copywriting'",
    time: "1 dia atrás",
    group: "Ontem",
    type: "info",
    read: true,
  },
  {
    id: 5,
    title: "Membro adicionado",
    description: "Beatriz Costa foi adicionada ao projeto 'API Gateway'",
    time: "Semana Passada",
    group: "Mais Antigas",
    type: "info",
    read: true,
  },
];

export default function NotificacoesPage() {
  /* ------------ states -------------- */
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ------------ fechar menu ao clicar fora -------------- */
  useEffect(() => {
    if (openMenuId === null) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  /* ------------ ações das notificações -------------- */
  function markAllAsRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  function markAsRead(id: number) {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setOpenMenuId(null);
  }

  function markAsUnread(id: number) {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: false } : n)));
    setOpenMenuId(null);
  }

  function confirmDelete(id: number) {
    setOpenMenuId(null);
    setDeleteTargetId(id);
  }

  function handleConfirmedDelete() {
    if (deleteTargetId === null) return;
    setNotifications(notifications.filter((n) => n.id !== deleteTargetId));
    setDeleteTargetId(null);
  }

  /* ------------ ícone por tipo -------------- */
  function getNotificationIcon(type: Notification["type"]) {
    if (type === "success") return <Check size={17} className="text-emerald-500" />;
    if (type === "warning") return <CircleAlert size={17} className="text-orange-400" />;
    return <Info size={17} className="text-blue-500" />;
  }

  const groups: Notification["group"][] = ["Hoje", "Ontem", "Mais Antigas"];
  const deleteTarget = notifications.find((n) => n.id === deleteTargetId);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-screen bg-slate-50">
      <div className="max-w-[780px]">

        {/* ------------ título e ação principal -------------- */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notificações</h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="inline-flex h-[37px] items-center gap-2 rounded-full border border-[#DDE7F3] bg-white px-4 text-sm font-semibold text-[#344158] transition hover:bg-slate-50"
          >
            <CheckCheck size={15} />
            Marcar todas como lidas
          </button>
        </div>

        {/* ------------ lista agrupada -------------- */}
        {groups.map((group) => {
          const groupNotifications = notifications.filter((n) => n.group === group);
          if (groupNotifications.length === 0) return null;

          return (
            <div key={group} className="mb-6">
              {/* título do grupo */}
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-slate-700">{group}</h2>
                <div className="h-px bg-slate-200 mt-2" />
              </div>

              <div className="space-y-2">
                {groupNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative rounded-xl border p-4 flex items-start gap-4 ${
                      notification.read
                        ? "bg-white border-slate-200"
                        : "bg-[#eeeaff] border-[#b8a9ff]"
                    }`}
                  >
                    {/* ícone */}
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* conteúdo */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {notification.description}
                      </p>
                      <span className="text-xs text-slate-400 mt-2 block">
                        {notification.time}
                      </span>
                    </div>

                    {/* indicador de não lida */}
                    {!notification.read && (
                      <span className="absolute top-3 right-10 w-2 h-2 bg-[#4f35f5] rounded-full" />
                    )}

                    {/* menu de ações */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === notification.id ? null : notification.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === notification.id && (
                        <div
                          className="absolute right-0 top-8 w-[190px] bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Check size={15} />
                            Marcar como lida
                          </button>

                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <CircleDot size={15} />
                            Marcar como não lida
                          </button>

                          <div className="h-px bg-slate-100 my-1" />

                          <button
                            onClick={() => confirmDelete(notification.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={15} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmedDelete}
        title="Excluir notificação"
        description={`Tem certeza que deseja excluir a notificação "${deleteTarget?.title}"?`}
        confirmLabel="Excluir"
      />
    </div>
  );
}