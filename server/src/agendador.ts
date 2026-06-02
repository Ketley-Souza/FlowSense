import cron from "node-cron";
import { verificarPrazosProximos } from "./modules/notificacoes/notificacoes.service";

/**
 * Inicializa todos os jobs agendados do FlowSense.
 * Deve ser chamado uma única vez, após o servidor iniciar.
 */
export function inicializarAgendador() {
  // ─────────────────────────────────────────────────────────────────────────
  // Job: Verificação de prazos próximos
  // Roda todos os dias às 08:00 (horário do servidor)
  // ─────────────────────────────────────────────────────────────────────────
  cron.schedule("0 8 * * *", async () => {
    console.log("[Agendador] Iniciando verificação de prazos próximos...");
    try {
      await verificarPrazosProximos();
    } catch (err) {
      console.error("[Agendador] Erro ao verificar prazos:", err);
    }
  });

  console.log("[Agendador] Jobs inicializados. Verificação de prazos: diária às 08:00.");
}
