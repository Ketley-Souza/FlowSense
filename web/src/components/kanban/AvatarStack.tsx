const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

type AvatarItem = {
  nome: string;
  foto_url?: string | null;
};

type AvatarStackProps = {
  membros: AvatarItem[];
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

/** Resolve URL da foto: caminho relativo recebe o prefixo da API */
function resolverFotoUrl(foto_url?: string | null): string | null {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  return `${API_BASE}${foto_url}`;
}

/** Cor determinística baseada no nome do membro */
function corPorNome(nome: string): string {
  const hue = nome.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[hue];
}

/**
 * Componente que exibe avatares empilhados com foto real ou iniciais como fallback.
 * Útil para exibir múltiplos responsáveis de forma compacta.
 */
export function AvatarStack({ membros, limit = 3 }: AvatarStackProps) {
  const visiveis = membros.slice(0, limit);
  const extra = Math.max(membros.length - visiveis.length, 0);

  return (
    <div className="flex items-center">
      {visiveis.map((membro, index) => {
        const fotoResolvida = resolverFotoUrl(membro.foto_url);
        const cor = corPorNome(membro.nome);
        return (
          <div
            key={`${membro.nome}-${index}`}
            title={membro.nome}
            className="-mr-2 h-8 w-8 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0"
            style={!fotoResolvida ? { backgroundColor: cor } : undefined}
          >
            {fotoResolvida ? (
              <img
                src={fotoResolvida}
                alt={membro.nome}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback para iniciais se a imagem falhar ao carregar
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = cor;
                    parent.style.display = "grid";
                    parent.style.placeItems = "center";
                    parent.innerHTML = `<span style="font-size:11px;font-weight:700;color:white">${membro.nome.charAt(0).toUpperCase()}</span>`;
                  }
                }}
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[11px] font-bold text-white">
                {membro.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      })}

      {extra > 0 && (
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#EEF1FF] px-2 text-sm font-bold text-[#5147F5] ring-2 ring-white">
          +{extra}
        </span>
      )}
    </div>
  );
}
