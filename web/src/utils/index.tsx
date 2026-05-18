/**
 * Arquivo centralizado de funções utilitárias
 * Reutilizáveis em toda a aplicação
 */

/**
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY)
 * @param data Data em string ou Date
 * @returns Data formatada
 */
export function formatarData(data: string | Date): string {
  const date = typeof data === "string" ? new Date(data) : data;
  return date.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data e hora
 * @param data Data em string ou Date
 * @returns Data e hora formatadas
 */
export function formatarDataHora(data: string | Date): string {
  const date = typeof data === "string" ? new Date(data) : data;
  return date.toLocaleString("pt-BR");
}

/**
 * Trunca uma string
 * @param str String a truncar
 * @param length Comprimento máximo
 * @returns String truncada com ...
 */
export function truncar(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Valida um email
 * @param email Email a validar
 * @returns true se válido
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Gera uma cor aleatória em hexadecimal
 * @returns Cor em formato #RRGGBB
 */
export function gerarCorAleatoria(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

/**
 * Cria um mapa de cores para equipes/usuários
 * Mantém consistência de cores para o mesmo usuário
 * @returns Função que retorna cor para um ID
 */
export function criarMapeadorCores() {
  const cores = new Map<string, string>();
  const paletaCores = [
    "#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E", "#10B981",
    "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6",
    "#D946EF", "#EC4899", "#F43F5E",
  ];

  return (id: string): string => {
    if (!cores.has(id)) {
      cores.set(id, paletaCores[cores.size % paletaCores.length]);
    }
    return cores.get(id)!;
  };
}

/**
 * Converte prioridade para label legível
 * @param prioridade Prioridade (BAIXA, MEDIA, ALTA)
 * @returns Label formatado
 */
export function formatarPrioridade(prioridade: "BAIXA" | "MEDIA" | "ALTA"): string {
  const mapa = {
    BAIXA: "Baixa",
    MEDIA: "Média",
    ALTA: "Alta",
  };
  return mapa[prioridade];
}

/**
 * Converte cargo para label legível
 * @param cargo Cargo (ADMIN, GERENTE, MEMBRO)
 * @returns Label formatado
 */
export function formatarCargo(cargo: string): string {
  const mapa: Record<string, string> = {
    ADMIN: "Administrador",
    GERENTE: "Gerente",
    MEMBRO: "Membro",
  };
  return mapa[cargo] || cargo;
}

/**
 * Calcula dias restantes até uma data
 * @param data Data de referência
 * @returns Número de dias (negativo se passou)
 */
export function diasRestantes(data: string | Date): number {
  const date = typeof data === "string" ? new Date(data) : data;
  const hoje = new Date();
  const diff = date.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
