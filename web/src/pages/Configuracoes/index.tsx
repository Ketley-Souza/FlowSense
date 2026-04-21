import { useState } from "react";

type Configuracoes = {
    temaEscuro: boolean;
    notificacoes: boolean;
    idioma: "pt-BR" | "en-US";
};

export default function ConfiguracoesPage() {
    const [config, setConfig] = useState<Configuracoes>({
        temaEscuro: false,
        notificacoes: true,
        idioma: "pt-BR",
    });

    function atualizar<K extends keyof Configuracoes>(chave: K, valor: Configuracoes[K]) {
        setConfig((prev) => ({ ...prev, [chave]: valor }));
    }

    function salvar() {
        // TODO: integrar com API/back-end
        console.log("Configurações salvas:", config);
    }

    return (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
            <h1>Configurações</h1>
            <p>Gerencie suas preferências do sistema.</p>

            <section style={{ display: "grid", gap: 16, marginTop: 24 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={config.temaEscuro}
                        onChange={(e) => atualizar("temaEscuro", e.target.checked)}
                    />
                    Tema escuro
                </label>

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={config.notificacoes}
                        onChange={(e) => atualizar("notificacoes", e.target.checked)}
                    />
                    Receber notificações
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Idioma
                    <select
                        value={config.idioma}
                        onChange={(e) => atualizar("idioma", e.target.value as Configuracoes["idioma"])}
                        style={{ width: 180 }}
                    >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={salvar}
                    style={{ width: 140, padding: "8px 12px", cursor: "pointer" }}
                >
                    Salvar
                </button>
            </section>
        </main>
    );
}