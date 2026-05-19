/**
 * Gera uma cor HSL consistente baseada em uma string (ex: ID do projeto)
 * Sempre gera a mesma cor para o mesmo ID
 */
export function gerarCorProjeto(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Converter para inteiro 32-bit
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 70;
  const lightness = 55;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Paleta de cores predefinidas para melhor contraste
 */
export const paletaCores = [
  "#4f35f5", // Indigo
  "#6c2bd9", // Purple
  "#d62828", // Red
  "#f77f00", // Orange
  "#2a9d8f", // Teal
  "#e63946", // Rose
  "#457b9d", // Steel Blue
  "#a8dadc", // Powder Blue
  "#1d3557", // Navy
  "#06aed5", // Sky Blue
];

export function gerarCorProjetoIndexada(id: string, index?: number): string {
  if (index !== undefined) {
    return paletaCores[index % paletaCores.length];
  }
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % paletaCores.length;
  return paletaCores[colorIndex];
}
