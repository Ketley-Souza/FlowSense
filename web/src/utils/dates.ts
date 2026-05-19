/**
 * Verifica se o projeto está atrasado (data fim passou)
 */
export function projetoAtrasado(dataFim: string | undefined): boolean {
  if (!dataFim) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);
  return fim < hoje;
}

/**
 * Verifica se faltam 2 dias ou menos para o prazo (mas não está atrasado)
 */
export function faltaDoisDias(dataFim: string | undefined): boolean {
  if (!dataFim) return false;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);
  
  // Se já passou, não mostra alerta de atenção
  if (fim <= hoje) return false;
  
  // Calcula diferença em dias
  const diffTime = fim.getTime() - hoje.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= 2;
}

/**
 * Formata data para exibição em PT-BR
 */
export function formatarData(data: string | undefined): string {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "-";
  }
}

/**
 * Formata data para input HTML (YYYY-MM-DD)
 */
export function isoParaInput(data: string | undefined): string {
  if (!data) return "";
  try {
    const date = new Date(data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

/**
 * Converte input HTML para ISO string
 */
export function inputParaIso(inputValue: string): string | undefined {
  if (!inputValue) return undefined;
  try {
    return new Date(`${inputValue}T00:00:00`).toISOString();
  } catch {
    return undefined;
  }
}
