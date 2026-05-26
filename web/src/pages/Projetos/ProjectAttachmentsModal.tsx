import { useState, useEffect, useRef } from "react";
import { X, Paperclip, Download, Trash2, FileText, Image, File, FileSpreadsheet, Upload, Loader2 } from "lucide-react";
import { projetoService } from "@/services/projetoService";
import { useToastGlobal } from "@/contexts/ToastContext";
import type { AnexoProjeto } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

interface ProjectAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
  projetoNome: string;
}

function resolverUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function iconeAnexo(tipo: string) {
  if (tipo.startsWith("image/")) return <Image size={18} className="text-blue-500" />;
  if (tipo === "application/pdf") return <FileText size={18} className="text-red-500" />;
  if (tipo.includes("spreadsheet") || tipo.includes("excel") || tipo === "text/csv")
    return <FileSpreadsheet size={18} className="text-emerald-500" />;
  if (tipo.includes("word") || tipo === "text/plain")
    return <FileText size={18} className="text-blue-400" />;
  return <File size={18} className="text-slate-400" />;
}

function tamanhoLegivel(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProjectAttachmentsModal({
  isOpen,
  onClose,
  projetoId,
  projetoNome,
}: ProjectAttachmentsModalProps) {
  const toast = useToastGlobal();
  const inputRef = useRef<HTMLInputElement>(null);

  const [anexos, setAnexos] = useState<AnexoProjeto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  //puxa anexos ao abrir
  useEffect(() => {
    if (!isOpen || !projetoId) return;
    setCarregando(true);
    projetoService
      .listarAnexos(projetoId)
      .then(setAnexos)
      .catch(() => toast.erro("Erro ao carregar anexos."))
      .finally(() => setCarregando(false));
  }, [isOpen, projetoId]);

  if (!isOpen) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setEnviando(true);
    const resultados = await Promise.allSettled(
      files.map((f) => projetoService.adicionarAnexo(projetoId, f))
    );

    const novos = resultados
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<AnexoProjeto>).value);

    const falhas = resultados.filter((r) => r.status === "rejected").length;

    setAnexos((prev) => [...novos, ...prev]);

    if (novos.length > 0) toast.sucesso(`${novos.length} arquivo(s) enviado(s)!`);
    if (falhas > 0) toast.erro(`${falhas} arquivo(s) falharam. Verifique o tamanho (máx. 20 MB).`);

    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDeletar(anexoId: string) {
    setDeletandoId(anexoId);
    try {
      await projetoService.deletarAnexo(projetoId, anexoId);
      setAnexos((prev) => prev.filter((a) => a.id !== anexoId));
      toast.sucesso("Anexo removido.");
    } catch {
      toast.erro("Erro ao remover anexo.");
    } finally {
      setDeletandoId(null);
    }
  }

  async function handleDownload(anexo: AnexoProjeto) {
    const url = resolverUrl(anexo.url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = anexo.nome;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      //nova aba
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[85vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">Anexos do Projeto</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">{projetoNome}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload área */}
        <div className="border-b border-slate-100 px-6 py-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={enviando}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={16} />
                Adicionar arquivos
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Imagens, PDF, Word, Excel, CSV, ZIP — máx. 20 MB por arquivo
          </p>
        </div>

        {/* Lista de anexos */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : anexos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Paperclip size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Nenhum anexo ainda</p>
              <p className="mt-1 text-xs text-slate-400">
                Clique em "Adicionar arquivos" para enviar
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {anexos.map((a) => {
                const fullUrl = resolverUrl(a.url);
                const isImage = a.tipo.startsWith("image/");

                return (
                  <li
                    key={a.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    {/* Ícone / Preview de imagem */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      {isImage ? (
                        <img
                          src={fullUrl}
                          alt={a.nome}
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        iconeAnexo(a.tipo)
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {a.nome}
                      </p>
                      <p className="text-xs text-slate-400">
                        {[tamanhoLegivel(a.tamanho), formatarData(a.createdAt)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      {/* Download */}
                      <button
                        onClick={() => handleDownload(a)}
                        title="Baixar"
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600"
                      >
                        <Download size={16} />
                      </button>

                      {/* Ver em nova aba (imagens / PDFs) */}
                      {(isImage || a.tipo === "application/pdf") && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visualizar"
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Paperclip size={14} />
                        </a>
                      )}

                      {/* Deletar */}
                      <button
                        onClick={() => handleDeletar(a.id)}
                        disabled={deletandoId === a.id}
                        title="Remover"
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      >
                        {deletandoId === a.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-400">
            {anexos.length} arquivo{anexos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
