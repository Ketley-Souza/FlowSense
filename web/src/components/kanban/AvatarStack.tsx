type AvatarStackProps = {
  names: string[];
  limit?: number;
};

const avatarColors = [
  "#F59F2F",
  "#1F2A44",
  "#00C982",
  "#7B7FF7",
  "#E97355",
  "#5363E8",
];

/**
 * Componente que exibe avatares empilhados com iniciais
 * Útil para exibir múltiplos responsáveis de forma compacta
 */
export function AvatarStack({ names, limit = 3 }: AvatarStackProps) {
  const visibleNames = names.slice(0, limit);
  const extra = Math.max(names.length - visibleNames.length, 0);

  return (
    <div className="flex items-center">
      {visibleNames.map((name, index) => (
        <div
          key={`${name}-${index}`}
          title={name}
          className="-mr-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-sm"
          style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      ))}

      {extra > 0 && (
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#EEF1FF] px-2 text-sm font-bold text-[#5147F5] ring-2 ring-white">
          +{extra}
        </span>
      )}
    </div>
  );
}
