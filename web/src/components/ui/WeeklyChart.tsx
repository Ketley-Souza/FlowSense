interface DadoSemana {
  data: string;
  concluidas: number;
}

interface WeeklyChartProps {
  semana: DadoSemana[];
  height?: number;
}

function formatDia(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 3);
}

export function WeeklyChart({ semana, height = 140 }: WeeklyChartProps) {
  const max = Math.max(...semana.map((d) => d.concluidas), 1);
  const barWidth = 28;
  const gap = 12;
  const paddingX = 8;
  const paddingBottom = 28;
  const paddingTop = 8;
  const chartHeight = height - paddingBottom - paddingTop;
  const totalWidth = semana.length * (barWidth + gap) - gap + paddingX * 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalWidth} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gráfico de produtividade semanal"
    >
      {/* Linhas de referência */}
      {[0, 0.5, 1].map((frac) => {
        const y = paddingTop + chartHeight * (1 - frac);
        return (
          <line
            key={frac}
            x1={paddingX}
            y1={y}
            x2={totalWidth - paddingX}
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        );
      })}

      {/* Barras */}
      {semana.map((dia, i) => {
        const x = paddingX + i * (barWidth + gap);
        const barH = Math.max((dia.concluidas / max) * chartHeight, dia.concluidas > 0 ? 4 : 0);
        const y = paddingTop + chartHeight - barH;
        const isToday = i === semana.length - 1;

        return (
          <g key={dia.data}>
            {/* Barra */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={6}
              ry={6}
              fill={isToday ? "#6366f1" : "#c7d2fe"}
              className="transition-all duration-500"
            />

            {/* Valor acima da barra */}
            {dia.concluidas > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#6366f1"
              >
                {dia.concluidas}
              </text>
            )}

            {/* Label do dia */}
            <text
              x={x + barWidth / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill={isToday ? "#6366f1" : "#94a3b8"}
              fontWeight={isToday ? "700" : "400"}
            >
              {formatDia(dia.data)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
