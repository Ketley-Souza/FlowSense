import type { Equipe } from "@/types";

const TEAM_COLORS = [
  "#5B35F5",
  "#5147F5",
  "#7578FF",
  "#42516A",
  "#40506A",
  "#7E8DA6",
];

function hashString(value: string): number {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function getInitials(nome: string): string {
  const initials = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

export function getAvatarColor(id: string): string {
  return TEAM_COLORS[hashString(id) % TEAM_COLORS.length];
}

export function getTeamDisplayName(equipe: Pick<Equipe, "nome" | "eh_pessoal">): string {
  if (!equipe.eh_pessoal) return equipe.nome;

  const cleanName = equipe.nome.replace(/\s*-\s*pessoal$/i, "").trim();
  return cleanName || equipe.nome;
}

export function formatarData(iso?: string): string {
  if (!iso) return "-";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatarDataRelativa(iso?: string): string {
  if (!iso) return "-";

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "-";

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 2) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;

  const days = Math.floor(diff / 86400000);
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;

  const years = Math.floor(days / 365);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

export function plural(valor: number, singular: string, pluralizado: string): string {
  return `${valor} ${valor === 1 ? singular : pluralizado}`;
}
