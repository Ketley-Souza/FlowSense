const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

interface UserAvatarProps {
  nome: string;
  foto_url?: string | null;
  size?: number; // px (default 32)
  className?: string;
}

/**
 * Avatar de usuário: exibe a foto se disponível,
 * caso contrário exibe as iniciais com cor gerada pelo nome.
 */
export function UserAvatar({ nome, foto_url, size = 32, className = "" }: UserAvatarProps) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

  // Cor determinística baseada no nome
  const hue = nome
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const bgColor = `hsl(${hue}, 65%, 55%)`;

  const resolvedUrl = foto_url
    ? foto_url.startsWith("http")
      ? foto_url
      : `${API_BASE}${foto_url}`
    : null;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.375,
  };

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={nome}
        title={nome}
        className={`rounded-full object-cover ${className}`}
        style={style}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.style.backgroundColor = bgColor;
            parent.textContent = iniciais;
          }
        }}
      />
    );
  }

  return (
    <div
      title={nome}
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className}`}
      style={{ ...style, backgroundColor: bgColor }}
    >
      {iniciais}
    </div>
  );
}
