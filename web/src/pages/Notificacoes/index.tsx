import { useState } from "react";
import {
  Check,
  CheckCheck,
  CircleAlert,
  CircleDot,
  Info,
  MoreVertical,
  Trash2,
} from "lucide-react";

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

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  /* ------------ ações das notificações -------------- */
  function markAllAsRead() {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function markAsRead(id: number) {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    setOpenMenuId(null);
  }

  function markAsUnread(id: number) {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );

    setOpenMenuId(null);
  }

  function deleteNotification(id: number) {
    setNotifications(notifications.filter((notification) => notification.id !== id));
    setOpenMenuId(null);
  }

  /* ------------ ícone por tipo -------------- */
  function getNotificationIcon(type: Notification["type"]) {
    if (type === "success") {
      return <Check size={17} className="text-emerald-500" />;
    }

    if (type === "warning") {
      return <CircleAlert size={17} className="text-orange-400" />;
    }

    return <Info size={17} className="text-blue-500" />;
  }

  const groups: Notification["group"][] = ["Hoje", "Ontem", "Mais Antigas"];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <section className="p-8 pt-10 max-w-[760px]">

        {/* ------------ título e ação principal -------------- */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notificações</h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount} não lidas
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="text-sm text-[#4f35f5] flex items-center gap-1 hover:underline"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        </div>

        {/* ------------ lista agrupada -------------- */}
        {groups.map((group) => {
          const groupNotifications = notifications.filter(
            (notification) => notification.group === group
          );

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
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* conteúdo */}
                    <div className="flex-1">
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
                      <span className="absolute top-3 right-3 w-2 h-2 bg-[#4f35f5] rounded-full" />
                    )}

                    {/* menu de ações */}
                    <div className="relative mt-5">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === notification.id ? null : notification.id)
                        }
                        className="text-slate-500 hover:text-slate-800"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === notification.id && (
                        <div className="absolute right-0 top-7 w-[190px] bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-2">

                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                          >
                            <Check size={15} />
                            Marcar como lida
                          </button>

                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                          >
                            <CircleDot size={15} />
                            Marcar como não lida
                          </button>

                          <button
                            onClick={() => deleteNotification(notification.id)}
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
      </section>
    </div>
  );
}